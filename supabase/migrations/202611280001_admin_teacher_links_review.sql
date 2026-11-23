-- REVIEW ONLY, not applied. Depends on 202611200001 and 202611230001.
-- A teacher_students link grants access to student data. Only an academy admin
-- may create one, after authorization has been established OUTSIDE this RPC.
-- This draft does not implement revocation or establish legal consent.
begin;
create table academy_private.teacher_link_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  created_at timestamptz not null default clock_timestamp(),
  check (teacher_id <> student_id)
);
alter table academy_private.teacher_link_audit enable row level security;
revoke all on academy_private.teacher_link_audit from public, anon, authenticated;
revoke all on sequence academy_private.teacher_link_audit_id_seq from public, anon, authenticated;

-- Reference is an opaque internal record ID, never evidence or student details.
-- The backend cannot verify the underlying authorization represented by it.
create function public.admin_establish_teacher_link(p_teacher uuid, p_student uuid, p_authorization_reference text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); role_count integer;
begin
  if actor is null or p_teacher is null or p_student is null or p_teacher=p_student
    or p_authorization_reference is null or p_authorization_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' then
    raise exception 'Not authorized or invalid request';
  end if;
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
revoke all on function public.admin_establish_teacher_link(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.admin_establish_teacher_link(uuid,uuid,text) to authenticated;
commit;
