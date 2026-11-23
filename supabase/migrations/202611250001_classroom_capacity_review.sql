-- REVIEW ONLY. Not a production migration. Depends on 202611230001_classrooms_review.sql.
-- No codes or enrollment-by-code: trusted abuse controls and real sessions are not ready.
-- Existing classrooms remain uncapped until a tutor deliberately sets a capacity.
begin;

alter table public.classrooms add column capacity integer check (capacity is null or capacity > 0);

-- A revoked teacher link or student role leaves a retained membership hidden by
-- the current roster. Fail closed rather than silently treating that seat as free
-- or reporting it as an active student. Resolution requires a reviewed lifecycle.
create function academy_private.classroom_has_inactive_members(p_id uuid, p_teacher_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classroom_students cs
    where cs.classroom_id = p_id and (
      not exists (select 1 from public.teacher_students ts where ts.teacher_id = p_teacher_id and ts.student_id = cs.student_id)
      or not exists (select 1 from public.user_roles r where r.user_id = cs.student_id and r.role = 'student')
    )
  );
$$;
revoke all on function academy_private.classroom_has_inactive_members(uuid,uuid) from public, anon, authenticated;

-- Returns aggregate occupancy only; no otherwise-hidden student identities.
create function public.teacher_classroom_capacity(p_id uuid)
returns table(capacity integer, active_students bigint, needs_membership_review boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  if not exists(select 1 from public.classrooms c where c.id = p_id and c.teacher_id = (select auth.uid())) then raise exception 'Not authorized or unavailable'; end if;
  return query select c.capacity,
    (select count(*) from public.classroom_students cs
      join public.teacher_students ts on ts.teacher_id = c.teacher_id and ts.student_id = cs.student_id
      join public.user_roles r on r.user_id = cs.student_id and r.role = 'student'
      where cs.classroom_id = c.id),
    academy_private.classroom_has_inactive_members(c.id, c.teacher_id)
    from public.classrooms c where c.id = p_id and c.teacher_id = (select auth.uid());
end; $$;

-- Lock classroom for capacity edits, archive, add and remove, serializing them.
create function public.teacher_classroom_set_capacity(p_id uuid, p_capacity integer, p_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; occupied bigint;
begin
  if p_capacity is null or p_capacity < 1 then raise exception 'Not authorized or invalid capacity'; end if;
  select * into c from public.classrooms where id = p_id and teacher_id = (select auth.uid()) and archived_at is null and revision = p_revision for update;
  if not found then raise exception 'Classroom unavailable or changed'; end if;
  perform 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'teacher' for key share;
  if not found then raise exception 'Not authorized or invalid capacity'; end if;
  if academy_private.classroom_has_inactive_members(c.id, c.teacher_id) then raise exception 'Membership review required'; end if;
  select count(*) into occupied from public.classroom_students cs where cs.classroom_id = c.id;
  if occupied > p_capacity then raise exception 'Capacity below current occupancy'; end if;
  update public.classrooms set capacity = p_capacity, revision = revision + 1, updated_at = clock_timestamp() where id = c.id;
  return true;
end; $$;

create or replace function public.teacher_classroom_add_student(p_id uuid, p_student_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; occupied bigint;
begin
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

revoke all on function public.teacher_classroom_capacity(uuid), public.teacher_classroom_set_capacity(uuid,integer,bigint) from public, anon, authenticated;
grant execute on function public.teacher_classroom_capacity(uuid), public.teacher_classroom_set_capacity(uuid,integer,bigint) to authenticated;
commit;
