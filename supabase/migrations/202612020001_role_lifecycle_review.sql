-- REVIEW ONLY, never applied remotely. Depends on the full review chain including
-- teacher tests, classrooms, codes, linking, revocation, write locks and homework.
-- This is access suspension, NOT Auth session revocation or data deletion.
begin;

-- A student role must exist for relationship-based access to that student's
-- data. Self-profile visibility remains unchanged. No historical data is erased.
create or replace function academy_private.can_teach(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select academy_private.has_role('teacher')
   and exists(select 1 from public.user_roles where user_id=target_student and role='student')
   and exists(select 1 from public.teacher_students where teacher_id=(select auth.uid()) and student_id=target_student);
$$;
create or replace function academy_private.can_view_student(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id=target_student and role='student') and (
   target_student=(select auth.uid()) or academy_private.can_teach(target_student) or
   (academy_private.has_role('parent') and exists(select 1 from public.parent_students where parent_id=(select auth.uid()) and student_id=target_student))
 );
$$;
drop policy teachers_read on public.teacher_students;
create policy teachers_read on public.teacher_students for select to authenticated using (teacher_id=(select auth.uid()) and academy_private.can_teach(student_id));
drop policy parents_read on public.parent_students;
create policy parents_read on public.parent_students for select to authenticated using (parent_id=(select auth.uid()) and academy_private.has_role('parent') and academy_private.can_view_student(student_id));

create or replace function public.parent_published_lesson_notes(p_student_id uuid)
returns table(note_text text, created_at timestamptz, author_name text)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('parent') or not academy_private.can_view_student(p_student_id) or not exists (
    select 1 from public.parent_students ps where ps.parent_id=(select auth.uid()) and ps.student_id=p_student_id
  ) then raise exception 'Not authorized'; end if;
  return query select n.note_text,n.created_at,p.display_name from public.tutor_lesson_notes n
    join public.profiles p on p.id=n.author_id
    where n.student_id=p_student_id and n.visibility='parent' and n.published_at is not null
      and exists(select 1 from public.teacher_students ts join public.user_roles r on r.user_id=ts.teacher_id and r.role='teacher' where ts.teacher_id=n.author_id and ts.student_id=n.student_id)
    order by n.created_at desc,n.id;
end; $$;

create table academy_private.role_lifecycle_audit (
 id bigint generated always as identity primary key,
 admin_id uuid not null references public.profiles(id) on delete restrict,
 target_id uuid not null references public.profiles(id) on delete restrict,
 action text not null check (action in ('role_revoked','parent_link_revoked','teacher_codes_retired')),
 target_role text check (target_role in ('teacher','student','parent')),
 related_student_id uuid references public.profiles(id) on delete restrict,
 affected integer not null check (affected > 0),
 authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
 created_at timestamptz not null default clock_timestamp()
);
alter table academy_private.role_lifecycle_audit enable row level security;
revoke all on academy_private.role_lifecycle_audit from public,anon,authenticated,service_role;
revoke all on sequence academy_private.role_lifecycle_audit_id_seq from public,anon,authenticated,service_role;

-- Role insertion and retirement share this role-specific transaction lock.
create function academy_private.lock_role_lifecycle(p_id uuid,p_role text)
returns void language plpgsql set search_path = '' as $$
begin
  if p_id is null or p_role is null then raise exception 'Invalid role'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.role:' || p_id::text || ':' || p_role,0));
end; $$;
revoke all on function academy_private.lock_role_lifecycle(uuid,text) from public,anon,authenticated,service_role;

-- A versioned row forces stale REPEATABLE READ/SERIALIZABLE transactions to
-- abort if a prior grant or deletion committed after their snapshot. Advisory
-- locks alone do not refresh a transaction snapshot.
create table academy_private.role_lifecycle_epochs (
 user_id uuid not null references public.profiles(id) on delete restrict,
 role text not null check (role in ('teacher','student','parent')),
 revision bigint not null default 1 check (revision > 0),
 primary key(user_id,role)
);
alter table academy_private.role_lifecycle_epochs enable row level security;
revoke all on academy_private.role_lifecycle_epochs from public,anon,authenticated,service_role;

-- Reinstatement is an explicit privileged action, not implemented here. A stale
-- role cannot be recreated while relationships/memberships/codes would silently
-- reappear. Reauthorization and relinking are separate decisions. Duplicate
-- inserts can also fail when retained relationships exist; use a separate read.
create function academy_private.guard_role_reinstatement()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_id uuid; target_role text;
begin
  if tg_op='UPDATE' then
    if new.user_id is distinct from old.user_id or new.role is distinct from old.role then raise exception 'Role identity is immutable'; end if;
    return new;
  end if;
  if tg_op='DELETE' then target_id:=old.user_id; target_role:=old.role; else target_id:=new.user_id; target_role:=new.role; end if;
  if target_role not in ('teacher','student','parent') then if tg_op='DELETE' then return old; else return new; end if; end if;
  perform academy_private.lock_role_lifecycle(target_id,target_role);
  insert into academy_private.role_lifecycle_epochs(user_id,role,revision) values(target_id,target_role,1)
    on conflict (user_id,role) do update set revision=academy_private.role_lifecycle_epochs.revision+1;
  if tg_op='DELETE' then return old; end if;
  if new.role='teacher' and (
    exists(select 1 from public.teacher_students where teacher_id=new.user_id) or
    exists(select 1 from public.classroom_students cs join public.classrooms c on c.id=cs.classroom_id where c.teacher_id=new.user_id) or
    exists(select 1 from academy_private.classroom_invites i join public.classrooms c on c.id=i.classroom_id where c.teacher_id=new.user_id and i.revoked_at is null)
  ) then raise exception 'Role reinstatement requires relationship and code review'; end if;
  if new.role='student' and (
    exists(select 1 from public.teacher_students where student_id=new.user_id) or
    exists(select 1 from public.parent_students where student_id=new.user_id) or
    exists(select 1 from public.classroom_students where student_id=new.user_id)
  ) then raise exception 'Role reinstatement requires relationship review'; end if;
  if new.role='parent' and exists(select 1 from public.parent_students where parent_id=new.user_id) then raise exception 'Role reinstatement requires relationship review'; end if;
  return new;
end; $$;
revoke all on function academy_private.guard_role_reinstatement() from public,anon,authenticated,service_role;
create trigger guard_role_reinstatement before insert or update or delete on public.user_roles for each row execute function academy_private.guard_role_reinstatement();

-- Recheck role under row lock after the RLS snapshot; deletion waits for already
-- accepted writes, and later writes fail after the role-removal transaction commits.
create function academy_private.guard_student_attempt_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.student_id is distinct from (select auth.uid()) then raise exception 'Not authorized'; end if;
  perform 1 from public.user_roles where user_id=new.student_id and role='student' for key share;
  if not found then raise exception 'Not authorized'; end if;
  return new;
end; $$;
revoke all on function academy_private.guard_student_attempt_role() from public,anon,authenticated,service_role;
create trigger guard_student_attempt_role before insert on public.exercise_attempts for each row execute function academy_private.guard_student_attempt_role();

-- These owner-scoped writes previously only checked the role before writing.
-- Also works for the service-only code issuer, which has no user JWT: the RPC
-- is responsible for authorizing the teacher identity and the trigger holds the
-- teacher role, not impersonation. Direct privileged writes still need review.
create function academy_private.guard_teacher_owned_row_role()
returns trigger language plpgsql security definer set search_path = '' as $$
declare owner_id uuid;
begin
  if tg_op='INSERT' then owner_id:=new.teacher_id;
  else
    owner_id:=old.teacher_id;
    if tg_op='UPDATE' and new.teacher_id is distinct from old.teacher_id then raise exception 'Teacher identity is immutable'; end if;
  end if;
  perform 1 from public.user_roles where user_id=owner_id and role='teacher' for key share;
  if not found then raise exception 'Teacher role unavailable'; end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function academy_private.guard_teacher_owned_row_role() from public,anon,authenticated,service_role;
create trigger guard_classroom_teacher_role before insert or update or delete on public.classrooms for each row execute function academy_private.guard_teacher_owned_row_role();
create trigger guard_test_teacher_role before insert or update or delete on public.teacher_tests for each row execute function academy_private.guard_teacher_owned_row_role();

-- Membership removal also participates in the pair/role lock order. It does
-- not substitute for the admin cleanup path when either role is already absent.
create or replace function public.teacher_classroom_remove_student(p_id uuid,p_student_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; teacher uuid := (select auth.uid());
begin
  if teacher is null or p_student_id is null or not academy_private.has_role('teacher') or not exists(select 1 from public.classrooms where id=p_id and teacher_id=teacher and archived_at is null) then raise exception 'Not authorized or unavailable'; end if;
  perform academy_private.lock_teacher_student_pair(teacher,p_student_id);
  select * into c from public.classrooms where id=p_id and teacher_id=teacher and archived_at is null for update;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles where user_id=teacher and role='teacher' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.teacher_students where teacher_id=teacher and student_id=p_student_id for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles where user_id=p_student_id and role='student' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  delete from public.classroom_students where classroom_id=p_id and student_id=p_student_id;
  if not found then raise exception 'Membership unavailable'; end if;
  return true;
end; $$;

-- Suspend exactly one non-admin role, without collecting all pair locks. Existing
-- pair operations hold role rows and finish before DELETE; new ones fail. Retained
-- relationships are hidden and block reinstatement until explicitly cleaned up.
create function public.admin_revoke_academy_role(p_target uuid,p_role text,p_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); removed integer;
begin
  if actor is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent') or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
  perform academy_private.lock_role_lifecycle(p_target,p_role);
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  -- Force old transaction snapshots to conflict with a newer grant/revocation,
  -- including when a role was absent at the caller's snapshot.
  insert into academy_private.role_lifecycle_epochs(user_id,role,revision) values(p_target,p_role,1)
    on conflict (user_id,role) do update set revision=academy_private.role_lifecycle_epochs.revision+1;
  delete from public.user_roles where user_id=p_target and role=p_role;
  get diagnostics removed = row_count;
  if removed=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,target_role,affected,authorization_reference) values(actor,p_target,'role_revoked',p_role,removed,p_reference);
  return true;
end; $$;

-- Explicit unlink for retained parent relationships. Parent creation/regrant and
-- its legal authorization are outside this migration and must be independently reviewed.
create function public.admin_revoke_parent_link(p_parent uuid,p_student uuid,p_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); removed integer;
begin
  if actor is null or p_parent is null or p_student is null or p_parent=p_student or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  delete from public.parent_students where parent_id=p_parent and student_id=p_student;
  get diagnostics removed = row_count;
  if removed=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,related_student_id,affected,authorization_reference) values(actor,p_parent,'parent_link_revoked',p_student,removed,p_reference);
  return true;
end; $$;

-- Only after teacher suspension. No plaintext codes are exposed. Old codes stay
-- revoked on eventual regrant; teachers must issue new ones explicitly.
create function public.admin_retire_suspended_teacher_codes(p_teacher uuid,p_reference text)
returns integer language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); removed integer;
begin
  if actor is null or p_teacher is null or actor=p_teacher or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
  perform academy_private.lock_role_lifecycle(p_teacher,'teacher');
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  -- Refresh-sensitive epoch write makes stale REPEATABLE READ attempts fail if
  -- the role was regranted after their snapshot, even for legacy absent roles.
  insert into academy_private.role_lifecycle_epochs(user_id,role,revision) values(p_teacher,'teacher',1)
    on conflict (user_id,role) do update set revision=academy_private.role_lifecycle_epochs.revision+1;
  if exists(select 1 from public.user_roles where user_id=p_teacher and role='teacher') then raise exception 'Not authorized or unavailable'; end if;
  update academy_private.classroom_invites i set revoked_at=clock_timestamp() from public.classrooms c where i.classroom_id=c.id and c.teacher_id=p_teacher and i.revoked_at is null;
  get diagnostics removed = row_count;
  if removed>0 then insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,target_role,affected,authorization_reference) values(actor,p_teacher,'teacher_codes_retired','teacher',removed,p_reference); end if;
  return removed;
end; $$;
revoke all on function public.admin_revoke_academy_role(uuid,text,text),public.admin_revoke_parent_link(uuid,uuid,text),public.admin_retire_suspended_teacher_codes(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_revoke_academy_role(uuid,text,text),public.admin_revoke_parent_link(uuid,uuid,text),public.admin_retire_suspended_teacher_codes(uuid,text) to authenticated;
-- Explicitly deny service-role access to review-only private data and to
-- non-service RPCs, even when a project owner configured permissive default
-- privileges. Service code RPCs remain granted in the code migrations. This
-- does NOT constrain owners, superusers, inherited grants, or disabled triggers.
-- Defense in depth for code tables: they have no ordinary-user policies.
-- Owners and BYPASSRLS roles remain outside this boundary.
alter table academy_private.classroom_code_rate_buckets enable row level security;
alter table academy_private.classroom_invites enable row level security;
alter table academy_private.classroom_invite_redemptions enable row level security;
revoke all on academy_private.teacher_link_audit from service_role;
revoke all on sequence academy_private.teacher_link_audit_id_seq from service_role;
revoke all on public.tutor_lesson_notes, public.classrooms, public.classroom_students, public.teacher_tests from service_role;
revoke all on function academy_private.has_role(text), academy_private.can_teach(uuid), academy_private.can_view_student(uuid), academy_private.classroom_has_inactive_members(uuid,uuid) from service_role;
revoke all on function public.tutor_lesson_notes_list(uuid), public.tutor_lesson_note_save(uuid,uuid,text,text,bigint), public.tutor_lesson_note_set_publication(uuid,uuid,boolean,bigint), public.tutor_lesson_note_delete(uuid,uuid,bigint), public.parent_published_lesson_notes(uuid), public.teacher_classrooms_list(), public.teacher_classroom_save(uuid,text,smallint,text,bigint), public.teacher_classroom_archive(uuid,bigint), public.teacher_classroom_students(uuid), public.teacher_classroom_add_student(uuid,uuid), public.teacher_classroom_remove_student(uuid,uuid), public.teacher_classroom_capacity(uuid), public.teacher_classroom_set_capacity(uuid,integer,bigint), public.teacher_classroom_code_status(uuid), public.teacher_tests_list(), public.teacher_test_save(uuid,bigint,jsonb), public.teacher_test_delete(uuid,bigint), public.admin_establish_teacher_link(uuid,uuid,text) from service_role;
commit;
