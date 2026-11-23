-- REVIEW ONLY. Do not apply until classroom authorization, retention and rollout are approved.
-- Deliberately excludes invite codes and enrollment-by-code: no verified enrollment policy or abuse controls exist yet.
begin;
create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) <= 100 and name ~ '[^[:space:]]'),
  grade smallint check (grade between 1 and 7),
  description text not null default '' check (char_length(description) <= 500),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 1 check (revision > 0)
);
create index classrooms_teacher_created on public.classrooms(teacher_id, created_at desc, id);
create table public.classroom_students (
  classroom_id uuid not null references public.classrooms(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);
create index classroom_students_student on public.classroom_students(student_id, classroom_id);
alter table public.classrooms enable row level security;
alter table public.classroom_students enable row level security;
-- Deny direct reads and writes: all operations go through scoped RPCs.
revoke all on public.classrooms, public.classroom_students from public, anon, authenticated;

create function public.teacher_classrooms_list()
returns table(id uuid, name text, grade smallint, description text, archived_at timestamptz, created_at timestamptz, revision bigint, student_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  return query select c.id,c.name,c.grade,c.description,c.archived_at,c.created_at,c.revision,
    (select count(*) from public.classroom_students cs
       join public.teacher_students ts on ts.student_id = cs.student_id and ts.teacher_id = c.teacher_id
       join public.user_roles r on r.user_id = cs.student_id and r.role = 'student'
       where cs.classroom_id = c.id)
    from public.classrooms c where c.teacher_id = (select auth.uid()) order by c.created_at desc,c.id;
end; $$;

create function public.teacher_classroom_save(p_id uuid, p_name text, p_grade smallint, p_description text, p_revision bigint)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  if p_name is null or p_name !~ '[^[:space:]]' or char_length(p_name) > 100 or p_description is null or char_length(p_description) > 500 or (p_grade is not null and (p_grade < 1 or p_grade > 7)) then raise exception 'Invalid classroom'; end if;
  if p_id is null then
    if p_revision is not null then raise exception 'Invalid revision'; end if;
    insert into public.classrooms(teacher_id,name,grade,description) values ((select auth.uid()),p_name,p_grade,p_description) returning id into result;
  else
    update public.classrooms c set name=p_name,grade=p_grade,description=p_description,updated_at=clock_timestamp(),revision=c.revision+1
      where c.id=p_id and c.teacher_id=(select auth.uid()) and c.archived_at is null and c.revision=p_revision returning c.id into result;
    if not found then raise exception 'Classroom unavailable or changed'; end if;
  end if;
  return result;
end; $$;

create function public.teacher_classroom_archive(p_id uuid, p_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  update public.classrooms c set archived_at=clock_timestamp(),updated_at=clock_timestamp(),revision=c.revision+1
    where c.id=p_id and c.teacher_id=(select auth.uid()) and c.archived_at is null and c.revision=p_revision;
  if not found then raise exception 'Classroom unavailable or changed'; end if;
  return true;
end; $$;

create function public.teacher_classroom_students(p_id uuid)
returns table(student_id uuid, display_name text)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('teacher') or not exists(select 1 from public.classrooms c where c.id=p_id and c.teacher_id=(select auth.uid())) then raise exception 'Not authorized'; end if;
  return query select p.id,p.display_name from public.classroom_students cs
    join public.profiles p on p.id=cs.student_id
    join public.teacher_students ts on ts.student_id=cs.student_id and ts.teacher_id=(select auth.uid())
    join public.user_roles r on r.user_id=cs.student_id and r.role='student'
    where cs.classroom_id=p_id order by p.display_name,p.id;
end; $$;

create function public.teacher_classroom_add_student(p_id uuid, p_student_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  -- Lock the classroom so archive and add cannot race.
  perform 1 from public.classrooms c where c.id=p_id and c.teacher_id=(select auth.uid()) and c.archived_at is null for update;
  if not found or not academy_private.can_teach(p_student_id) or not exists(select 1 from public.user_roles r where r.user_id=p_student_id and r.role='student') then raise exception 'Not authorized or unavailable'; end if;
  insert into public.classroom_students(classroom_id,student_id) values(p_id,p_student_id) on conflict do nothing;
  return true;
end; $$;

create function public.teacher_classroom_remove_student(p_id uuid, p_student_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.classrooms c where c.id=p_id and c.teacher_id=(select auth.uid()) and c.archived_at is null for update;
  if not found or not academy_private.can_teach(p_student_id) or not exists(select 1 from public.user_roles r where r.user_id=p_student_id and r.role='student') then raise exception 'Not authorized or unavailable'; end if;
  delete from public.classroom_students cs where cs.classroom_id=p_id and cs.student_id=p_student_id;
  if not found then raise exception 'Membership unavailable'; end if;
  return true;
end; $$;
revoke all on function public.teacher_classrooms_list(), public.teacher_classroom_save(uuid,text,smallint,text,bigint), public.teacher_classroom_archive(uuid,bigint), public.teacher_classroom_students(uuid), public.teacher_classroom_add_student(uuid,uuid), public.teacher_classroom_remove_student(uuid,uuid) from public, anon, authenticated;
grant execute on function public.teacher_classrooms_list(), public.teacher_classroom_save(uuid,text,smallint,text,bigint), public.teacher_classroom_archive(uuid,bigint), public.teacher_classroom_students(uuid), public.teacher_classroom_add_student(uuid,uuid), public.teacher_classroom_remove_student(uuid,uuid) to authenticated;
commit;
