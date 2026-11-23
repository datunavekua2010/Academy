-- REVIEW ONLY. Depends on classroom/capacity/code and admin-link review migrations.
-- This protocol must be used by EVERY authorized link/membership mutation path.
-- Privileged direct writes, role revocation and auth-token/session races remain
-- independent release blockers; do not apply without a full security review.
begin;

-- A hash collision can serialize unrelated pairs, but never authorizes a write.
create function academy_private.lock_teacher_student_pair(p_teacher uuid, p_student uuid)
returns void language plpgsql set search_path = '' as $$
begin
  if p_teacher is null or p_student is null then raise exception 'Invalid pair'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.teacher-student:' || p_teacher::text || ':' || p_student::text, 0));
end; $$;
revoke all on function academy_private.lock_teacher_student_pair(uuid,uuid) from public, anon, authenticated, service_role;

-- Relationship mutations also write an epoch under the pair lock. Advisory
-- locks do not refresh REPEATABLE READ snapshots; the write forces a stale
-- transaction to abort instead of resurrecting or missing a newer link.
create table academy_private.teacher_link_epochs (
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  primary key(teacher_id,student_id), check(teacher_id <> student_id)
);
alter table academy_private.teacher_link_epochs enable row level security;
revoke all on academy_private.teacher_link_epochs from public,anon,authenticated,service_role;
create function academy_private.advance_teacher_link_epoch(p_teacher uuid,p_student uuid)
returns void language plpgsql set search_path='' as $$
begin
  insert into academy_private.teacher_link_epochs(teacher_id,student_id) values(p_teacher,p_student)
    on conflict(teacher_id,student_id) do update set revision=academy_private.teacher_link_epochs.revision+1;
end; $$;
revoke all on function academy_private.advance_teacher_link_epoch(uuid,uuid) from public,anon,authenticated,service_role;

create or replace function public.teacher_classroom_add_student(p_id uuid, p_student_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; occupied bigint;
begin
  -- Avoid allowing unrelated users to take arbitrary pair locks. Check again
  -- after acquiring locks; this early check alone is not authorization.
  if not academy_private.has_role('teacher') or not exists (select 1 from public.classrooms where id=p_id and teacher_id=(select auth.uid()) and archived_at is null) then raise exception 'Not authorized or unavailable'; end if;
  perform academy_private.lock_teacher_student_pair((select auth.uid()), p_student_id);
  select * into c from public.classrooms where id = p_id and teacher_id = (select auth.uid()) and archived_at is null for update;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'teacher' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  -- Lock existing role/link rows for the duration of this transaction. Revocation
  -- after commit still needs the reviewed relationship lifecycle described in docs.
  perform 1 from public.teacher_students ts where ts.teacher_id = c.teacher_id and ts.student_id = p_student_id for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles r where r.user_id = p_student_id and r.role = 'student' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  if exists(select 1 from public.classroom_students cs where cs.classroom_id = c.id and cs.student_id = p_student_id) then return true; end if;
  if academy_private.classroom_has_inactive_members(c.id, c.teacher_id) then raise exception 'Membership review required'; end if;
  select count(*) into occupied from public.classroom_students cs where cs.classroom_id = c.id;
  if c.capacity is not null and occupied >= c.capacity then raise exception 'Classroom full'; end if;
  insert into public.classroom_students(classroom_id,student_id) values(c.id,p_student_id);
  return true;
end; $$;

create or replace function public.classroom_code_redeem(p_actor uuid, p_code_digest text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; i academy_private.classroom_invites%rowtype; target uuid; target_teacher uuid; occupied bigint;
begin
  if p_actor is null or p_code_digest is null or p_code_digest !~ '^[a-f0-9]{64}$' then return false; end if;
  -- Initial lookup obtains only the class ID; recheck the invite after locking class.
  select ci.classroom_id, c0.teacher_id into target, target_teacher from academy_private.classroom_invites ci join public.classrooms c0 on c0.id=ci.classroom_id where ci.code_digest=p_code_digest;
  if not found then return false; end if;
  perform academy_private.lock_teacher_student_pair(target_teacher, p_actor);
  select * into c from public.classrooms where id=target and teacher_id=target_teacher and archived_at is null for update;
  if not found then return false; end if;
  select * into i from academy_private.classroom_invites where code_digest=p_code_digest and classroom_id=c.id and revoked_at is null and expires_at > clock_timestamp() for update;
  if not found or c.capacity is null then return false; end if;
  perform 1 from public.user_roles where user_id=c.teacher_id and role='teacher' for key share;
  if not found then return false; end if;
  perform 1 from public.teacher_students where teacher_id=c.teacher_id and student_id=p_actor for key share;
  if not found then return false; end if;
  perform 1 from public.user_roles where user_id=p_actor and role='student' for key share;
  if not found then return false; end if;
  if academy_private.classroom_has_inactive_members(c.id,c.teacher_id) then return false; end if;
  if exists(select 1 from public.classroom_students where classroom_id=c.id and student_id=p_actor) then return true; end if;
  select count(*) into occupied from public.classroom_students where classroom_id=c.id;
  if occupied >= c.capacity then return false; end if;
  insert into public.classroom_students(classroom_id,student_id) values(c.id,p_actor);
  insert into academy_private.classroom_invite_redemptions(invite_id,classroom_id,student_id) values(i.id,c.id,p_actor);
  return true;
end; $$;

create or replace function public.admin_establish_teacher_link(p_teacher uuid, p_student uuid, p_authorization_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); role_count integer;
begin
  if actor is null or p_teacher is null or p_student is null or p_teacher=p_student
    or p_authorization_reference is null or p_authorization_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' then
    raise exception 'Not authorized or invalid request';
  end if;
  if not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
  perform academy_private.lock_teacher_student_pair(p_teacher, p_student);
  perform academy_private.advance_teacher_link_epoch(p_teacher,p_student);
  -- Lock and recheck involved roles, in deterministic order. Revocation workflows
  -- must follow a compatible locking protocol before this can be released.
  perform 1 from public.user_roles r
    where (r.user_id=actor and r.role='admin') or (r.user_id=p_teacher and r.role='teacher') or (r.user_id=p_student and r.role='student')
    order by r.user_id,r.role for share;
  select count(*) into role_count from public.user_roles r
    where (r.user_id=actor and r.role='admin') or (r.user_id=p_teacher and r.role='teacher') or (r.user_id=p_student and r.role='student');
  if role_count <> 3 then raise exception 'Not authorized or invalid request'; end if;

  -- Do not resurrect a hidden classroom membership on relinking. A reviewed
  -- administrative resolution procedure is required before retrying.
  if exists(select 1 from public.classroom_students cs join public.classrooms c on c.id=cs.classroom_id
            where c.teacher_id=p_teacher and cs.student_id=p_student)
     and not exists(select 1 from public.teacher_students ts where ts.teacher_id=p_teacher and ts.student_id=p_student) then
    raise exception 'Membership review required';
  end if;
  insert into public.teacher_students(teacher_id,student_id) values(p_teacher,p_student) on conflict do nothing;
  if not found then return false; end if;
  insert into academy_private.teacher_link_audit(admin_id,teacher_id,student_id,authorization_reference)
    values(actor,p_teacher,p_student,p_authorization_reference);
  return true;
end; $$;

create table academy_private.teacher_link_revocation_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  link_removed boolean not null,
  memberships_removed integer not null check (memberships_removed >= 0),
  created_at timestamptz not null default clock_timestamp(),
  check (teacher_id <> student_id)
);
alter table academy_private.teacher_link_revocation_audit enable row level security;
revoke all on academy_private.teacher_link_revocation_audit from public, anon, authenticated, service_role;
revoke all on sequence academy_private.teacher_link_revocation_audit_id_seq from public, anon, authenticated, service_role;

-- Remove all of this pair's memberships (including archived classes), then the
-- link, atomically. Also cleans legacy hidden memberships if the link is absent.
-- Other students, teachers, parents and historical attempts are untouched.
create function public.admin_revoke_teacher_link(p_teacher uuid, p_student uuid, p_authorization_reference text)
returns table(link_removed boolean, memberships_removed integer)
language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); removed integer; deleted integer;
begin
  if actor is null or p_teacher is null or p_student is null or p_teacher=p_student
    or p_authorization_reference is null or p_authorization_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' then
    raise exception 'Not authorized or invalid request';
  end if;
  if not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
  perform academy_private.lock_teacher_student_pair(p_teacher, p_student);
  perform academy_private.advance_teacher_link_epoch(p_teacher,p_student);
  perform 1 from public.user_roles r where r.user_id=actor and r.role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  -- Same pair lock is held by add/redeem/establish. Stable order avoids cycles
  -- when two administrators remove students from overlapping sets of classes.
  perform 1 from public.classrooms c where c.teacher_id=p_teacher and exists
    (select 1 from public.classroom_students cs where cs.classroom_id=c.id and cs.student_id=p_student)
    order by c.id for update;
  delete from public.classroom_students cs using public.classrooms c
    where cs.classroom_id=c.id and c.teacher_id=p_teacher and cs.student_id=p_student;
  get diagnostics removed = row_count;
  delete from public.teacher_students ts where ts.teacher_id=p_teacher and ts.student_id=p_student;
  get diagnostics deleted = row_count;
  if deleted > 0 or removed > 0 then
    insert into academy_private.teacher_link_revocation_audit(admin_id,teacher_id,student_id,authorization_reference,link_removed,memberships_removed)
      values(actor,p_teacher,p_student,p_authorization_reference,deleted>0,removed);
  end if;
  return query select deleted>0, removed;
end; $$;
revoke all on function public.admin_revoke_teacher_link(uuid,uuid,text) from public, anon, authenticated, service_role;
grant execute on function public.admin_revoke_teacher_link(uuid,uuid,text) to authenticated;
commit;
