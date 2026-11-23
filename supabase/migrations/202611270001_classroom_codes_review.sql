-- REVIEW ONLY: not deployed. Depends on classrooms and capacity review migrations.
-- Only a trusted backend that independently verifies auth and enforces rate limits
-- may call these functions. Never expose a service-role credential to a browser.
begin;
create table academy_private.classroom_invites (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete restrict,
  code_digest text not null unique check (code_digest ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default clock_timestamp(),
  revoked_at timestamptz,
  unique (id, classroom_id),
  check (expires_at > created_at)
);
create unique index classroom_one_unrevoked_code on academy_private.classroom_invites(classroom_id) where revoked_at is null;
create table academy_private.classroom_invite_redemptions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null,
  classroom_id uuid not null,
  student_id uuid not null references public.profiles(id) on delete restrict,
  joined_at timestamptz not null default clock_timestamp(),
  foreign key (invite_id,classroom_id) references academy_private.classroom_invites(id,classroom_id) on delete restrict
);
revoke all on academy_private.classroom_invites, academy_private.classroom_invite_redemptions from public, anon, authenticated, service_role;

-- p_actor is supplied solely by the backend after verifying a real Auth session.
-- Code entropy is supplied by that same trusted backend, not by a browser.
create function public.classroom_code_issue(p_actor uuid, p_classroom uuid, p_revision bigint, p_expiry_date date, p_capacity integer, p_code_digest text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; expires timestamptz; occupied bigint;
begin
  if p_actor is null or p_capacity is null or p_capacity < 1 or p_expiry_date is null or p_expiry_date < date '2015-01-01' or p_expiry_date > date '9998-12-30' or p_code_digest is null or p_code_digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid request'; end if;
  expires := (p_expiry_date + 1)::timestamp at time zone 'Asia/Tbilisi';
  if expires <= clock_timestamp() then raise exception 'Invalid request'; end if;
  select * into c from public.classrooms where id=p_classroom and teacher_id=p_actor and archived_at is null and revision=p_revision for update;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles r where r.user_id=p_actor and r.role='teacher' for key share;
  if not found or academy_private.classroom_has_inactive_members(c.id,c.teacher_id) then raise exception 'Not authorized or unavailable'; end if;
  select count(*) into occupied from public.classroom_students where classroom_id=c.id;
  if occupied > p_capacity then raise exception 'Not authorized or unavailable'; end if;
  update public.classrooms set capacity=p_capacity, revision=revision+1, updated_at=clock_timestamp() where id=c.id;
  update academy_private.classroom_invites set revoked_at=clock_timestamp() where classroom_id=c.id and revoked_at is null;
  insert into academy_private.classroom_invites(classroom_id,code_digest,expires_at) values(c.id,p_code_digest,expires);
  return true;
end; $$;

create function public.classroom_code_revoke(p_actor uuid, p_classroom uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.classrooms where id=p_classroom and teacher_id=p_actor and archived_at is null for update;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform 1 from public.user_roles where user_id=p_actor and role='teacher' for key share;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  update academy_private.classroom_invites set revoked_at=clock_timestamp() where classroom_id=p_classroom and revoked_at is null;
  return true;
end; $$;

create function public.classroom_code_redeem(p_actor uuid, p_code_digest text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; i academy_private.classroom_invites%rowtype; target uuid; occupied bigint;
begin
  if p_actor is null or p_code_digest is null or p_code_digest !~ '^[a-f0-9]{64}$' then return false; end if;
  -- Initial lookup obtains only the class ID; recheck the invite after locking class.
  select classroom_id into target from academy_private.classroom_invites where code_digest=p_code_digest;
  if not found then return false; end if;
  select * into c from public.classrooms where id=target and archived_at is null for update;
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

-- A teacher can see code metadata and capacity for their own class, never the digest.
create function public.teacher_classroom_code_status(p_classroom uuid)
returns table(capacity integer, active_students bigint, needs_membership_review boolean, code_expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('teacher') or not exists(select 1 from public.classrooms c where c.id=p_classroom and c.teacher_id=(select auth.uid())) then raise exception 'Not authorized or unavailable'; end if;
  return query select c.capacity,
    (select count(*) from public.classroom_students cs join public.teacher_students ts on ts.teacher_id=c.teacher_id and ts.student_id=cs.student_id join public.user_roles r on r.user_id=cs.student_id and r.role='student' where cs.classroom_id=c.id),
    academy_private.classroom_has_inactive_members(c.id,c.teacher_id),
    (select i.expires_at from academy_private.classroom_invites i where i.classroom_id=c.id and i.revoked_at is null and i.expires_at > clock_timestamp() and c.archived_at is null limit 1)
    from public.classrooms c where c.id=p_classroom and c.teacher_id=(select auth.uid());
end; $$;
revoke all on function public.teacher_classroom_code_status(uuid) from public, anon, authenticated;
grant execute on function public.teacher_classroom_code_status(uuid) to authenticated;

revoke all on function public.classroom_code_issue(uuid,uuid,bigint,date,integer,text), public.classroom_code_revoke(uuid,uuid), public.classroom_code_redeem(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.classroom_code_issue(uuid,uuid,bigint,date,integer,text), public.classroom_code_revoke(uuid,uuid), public.classroom_code_redeem(uuid,text) to service_role;
commit;
