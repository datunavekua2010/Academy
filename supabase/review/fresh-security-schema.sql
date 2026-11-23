-- REVIEW ONLY. Fresh, empty synthetic Supabase TEST project ONLY; NOT an upgrade.
-- This does not record Supabase migration history. Do not apply to existing/live projects.
-- Review all migrations, owner/bypass privileges, Auth and retention before any deployment.
-- Denied operations intentionally have no policy/grant; absence is default-deny.
-- No subscription entitlement or real payment flow is implemented.
begin;
do $preflight$ begin
  if to_regclass('auth.users') is null then raise exception 'Supabase Auth schema required'; end if;
  if exists(select 1 from auth.users) then raise exception 'Refusing nonempty Auth project'; end if;
  if exists(select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','f')) then raise exception 'Refusing nonempty public schema'; end if;
  if exists(select 1 from pg_catalog.pg_namespace where nspname='academy_private') then raise exception 'Refusing existing academy_private schema'; end if;
end $preflight$;

-- ===== 202611200001_initial_academy.sql =====
-- REVIEW ONLY. Do not apply until the schema, permissions and project are approved.
-- Student-submitted attempts are UNVERIFIED. Do not use them to grant rewards.

create schema academy_private;
revoke all on schema academy_private from public, anon, authenticated;
grant usage on schema academy_private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 200),
  first_name text not null check (length(first_name) between 1 and 100),
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'parent', 'admin')),
  primary key (user_id, role)
);
create table public.student_grades (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  grade smallint not null check (grade between 1 and 7),
  assigned_at timestamptz not null default now()
);
create table public.teacher_students (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (teacher_id, student_id), check (teacher_id <> student_id)
);
create table public.parent_students (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (parent_id, student_id), check (parent_id <> student_id)
);

-- Keep the app's stable grade/topic/subtopic IDs; unit IDs are scoped to a topic.
create table public.curriculum_topics (
  grade smallint not null check (grade between 1 and 7),
  topic_id text not null, title text not null, position integer not null check (position >= 0),
  primary key (grade, topic_id)
);
create table public.curriculum_units (
  grade smallint not null, topic_id text not null, unit_id text not null,
  title text not null, position integer not null check (position >= 0),
  primary key (grade, topic_id, unit_id),
  foreign key (grade, topic_id) references public.curriculum_topics(grade, topic_id)
);
create table public.curriculum_subunits (
  grade smallint not null, topic_id text not null, unit_id text not null,
  subunit_id text not null, title text not null, position integer not null check (position >= 0),
  primary key (grade, topic_id, subunit_id),
  foreign key (grade, topic_id, unit_id) references public.curriculum_units(grade, topic_id, unit_id)
);
create table public.exercise_templates (
  template_id text primary key, grade smallint not null, topic_id text not null, subunit_id text not null,
  version integer not null default 1 check (version > 0),
  foreign key (grade, topic_id, subunit_id) references public.curriculum_subunits(grade, topic_id, subunit_id)
);
create table public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  assigned_by uuid not null references public.profiles(id),
  grade smallint not null, topic_id text not null, subunit_id text not null,
  assigned_at timestamptz not null default now(), due_at timestamptz not null,
  foreign key (grade, topic_id, subunit_id) references public.curriculum_subunits(grade, topic_id, subunit_id),
  check (due_at >= assigned_at)
);
create index homework_assignments_student on public.homework_assignments(student_id, grade);
create table public.exercise_attempts (
  student_id uuid not null references public.profiles(id),
  attempt_id text not null check (length(attempt_id) between 1 and 100),
  grade smallint not null, topic_id text not null, subunit_id text not null,
  assignment_id uuid references public.homework_assignments(id),
  result jsonb not null check (jsonb_typeof(result) = 'object' and pg_column_size(result) <= 262144),
  created_at timestamptz not null default now(),
  primary key (student_id, attempt_id),
  foreign key (grade, topic_id, subunit_id) references public.curriculum_subunits(grade, topic_id, subunit_id)
);
create table public.student_progress (
  student_id uuid not null references public.profiles(id),
  grade smallint not null, topic_id text not null, subunit_id text not null,
  summary jsonb not null default '{}'::jsonb check (jsonb_typeof(summary) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (student_id, grade, topic_id, subunit_id),
  foreign key (grade, topic_id, subunit_id) references public.curriculum_subunits(grade, topic_id, subunit_id)
);
create table public.achievements (
  id text primary key, title text not null, description text not null
);
create table public.earned_rewards (
  student_id uuid not null references public.profiles(id),
  achievement_id text not null references public.achievements(id),
  awarded_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

-- Functions read academy-managed membership tables without RLS recursion.
-- They return only a boolean, accept no user identity argument, and use a fixed search path.
create function academy_private.has_role(required_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = required_role);
$$;
create function academy_private.can_teach(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select academy_private.has_role('teacher') and exists (
    select 1 from public.teacher_students where teacher_id = (select auth.uid()) and student_id = target_student
  );
$$;
create function academy_private.can_view_student(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select (target_student = (select auth.uid()) and academy_private.has_role('student'))
    or academy_private.can_teach(target_student)
    or (academy_private.has_role('parent') and exists (
      select 1 from public.parent_students where parent_id = (select auth.uid()) and student_id = target_student
    ));
$$;
revoke all on all functions in schema academy_private from public, anon;
grant execute on all functions in schema academy_private to authenticated;

-- Explicit privileges as well as RLS: no anonymous table access; no user-managed roles,
-- links, grades, summaries, or rewards. Administration uses a trusted backend/dashboard.
revoke all on public.profiles, public.user_roles, public.student_grades, public.teacher_students,
  public.parent_students, public.curriculum_topics, public.curriculum_units, public.curriculum_subunits,
  public.exercise_templates, public.homework_assignments, public.exercise_attempts,
  public.student_progress, public.achievements, public.earned_rewards from public, anon, authenticated;
grant select on public.profiles, public.user_roles, public.student_grades, public.teacher_students,
  public.parent_students, public.curriculum_topics, public.curriculum_units, public.curriculum_subunits,
  public.exercise_templates, public.homework_assignments, public.exercise_attempts,
  public.student_progress, public.achievements, public.earned_rewards to authenticated;
grant insert, update, delete on public.homework_assignments to authenticated;
grant insert (student_id, attempt_id, grade, topic_id, subunit_id, assignment_id, result) on public.exercise_attempts to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.student_grades enable row level security;
alter table public.teacher_students enable row level security;
alter table public.parent_students enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.curriculum_units enable row level security;
alter table public.curriculum_subunits enable row level security;
alter table public.exercise_templates enable row level security;
alter table public.homework_assignments enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.student_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.earned_rewards enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (id = (select auth.uid()) or academy_private.can_view_student(id));
create policy roles_read on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
create policy grades_read on public.student_grades for select to authenticated using (academy_private.can_view_student(student_id));
create policy teachers_read on public.teacher_students for select to authenticated using (teacher_id = (select auth.uid()) and academy_private.has_role('teacher'));
create policy parents_read on public.parent_students for select to authenticated using (parent_id = (select auth.uid()) and academy_private.has_role('parent'));
create policy topics_read on public.curriculum_topics for select to authenticated using (true);
create policy units_read on public.curriculum_units for select to authenticated using (true);
create policy subunits_read on public.curriculum_subunits for select to authenticated using (true);
create policy templates_read on public.exercise_templates for select to authenticated using (true);
create policy achievements_read on public.achievements for select to authenticated using (true);
create policy assignments_read on public.homework_assignments for select to authenticated using (academy_private.can_view_student(student_id));
create policy assignments_insert on public.homework_assignments for insert to authenticated with check (assigned_by = (select auth.uid()) and academy_private.can_teach(student_id));
create policy assignments_update on public.homework_assignments for update to authenticated using (assigned_by = (select auth.uid()) and academy_private.can_teach(student_id)) with check (assigned_by = (select auth.uid()) and academy_private.can_teach(student_id));
create policy assignments_delete on public.homework_assignments for delete to authenticated using (assigned_by = (select auth.uid()) and academy_private.can_teach(student_id));
create policy attempts_read on public.exercise_attempts for select to authenticated using (academy_private.can_view_student(student_id));
create policy attempts_insert on public.exercise_attempts for insert to authenticated with check (
  student_id = (select auth.uid()) and academy_private.has_role('student') and
  (assignment_id is null or exists (
    select 1 from public.homework_assignments a where a.id = exercise_attempts.assignment_id and a.student_id = exercise_attempts.student_id
      and a.grade = exercise_attempts.grade and a.topic_id = exercise_attempts.topic_id and a.subunit_id = exercise_attempts.subunit_id
  ))
);
create policy progress_read on public.student_progress for select to authenticated using (academy_private.can_view_student(student_id));
create policy rewards_read on public.earned_rewards for select to authenticated using (academy_private.can_view_student(student_id));

-- ===== 202611220001_tutor_lesson_notes.sql =====
-- REVIEW ONLY. Do not apply until the schema, RLS, retention and rollout are approved.
-- All access is through narrowly scoped functions; no client may read the table directly.

create table public.tutor_lesson_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  note_text text not null check (char_length(note_text) <= 2000 and note_text ~ '[^[:space:]]'),
  visibility text not null check (visibility in ('tutor', 'parent')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 1 check (revision > 0),
  check (visibility = 'parent' or published_at is null)
);
create index tutor_lesson_notes_author_student_created on public.tutor_lesson_notes(author_id, student_id, created_at desc, id);
create index tutor_lesson_notes_parent_student_created on public.tutor_lesson_notes(student_id, created_at desc) where visibility = 'parent' and published_at is not null;
alter table public.tutor_lesson_notes enable row level security;
-- No table grants or policies: parents must never be able to request private columns.
revoke all on public.tutor_lesson_notes from public, anon, authenticated;

create function public.tutor_lesson_notes_list(p_student_id uuid)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  return query select n.* from public.tutor_lesson_notes n
    where n.student_id = p_student_id and n.author_id = (select auth.uid())
    order by n.created_at desc, n.id;
end;
$$;

-- Saves always create a draft. Any edit of published content revokes its publication.
create function public.tutor_lesson_note_save(p_student_id uuid, p_note_id uuid, p_note_text text, p_visibility text, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  if p_note_text is null or char_length(p_note_text) > 2000 or p_note_text !~ '[^[:space:]]' or p_visibility is null or p_visibility not in ('tutor', 'parent') then raise exception 'Invalid note'; end if;
  if p_note_id is null then
    if p_expected_revision is not null then raise exception 'Invalid revision'; end if;
    insert into public.tutor_lesson_notes(student_id, author_id, note_text, visibility)
      values(p_student_id, (select auth.uid()), p_note_text, p_visibility) returning * into result;
  else
    update public.tutor_lesson_notes n set note_text = p_note_text, visibility = p_visibility,
      published_at = null, updated_at = clock_timestamp(), revision = n.revision + 1
      where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) and n.revision = p_expected_revision
      returning n.* into result;
    if not found then raise exception 'Note unavailable or changed'; end if;
  end if;
  return next result;
end;
$$;

create function public.tutor_lesson_note_set_publication(p_student_id uuid, p_note_id uuid, p_publish boolean, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  if p_publish is null then raise exception 'Invalid action'; end if;
  select n.* into result from public.tutor_lesson_notes n
    where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) for update;
  if not found or result.revision <> p_expected_revision or p_expected_revision is null then raise exception 'Note unavailable or changed'; end if;
  if p_publish and result.visibility <> 'parent' then raise exception 'Note not parent-visible'; end if;
  if (p_publish and result.published_at is null) or (not p_publish and result.published_at is not null) then
    update public.tutor_lesson_notes n set published_at = case when p_publish then clock_timestamp() else null end,
      updated_at = clock_timestamp(), revision = n.revision + 1 where n.id = result.id returning n.* into result;
  end if;
  return next result;
end;
$$;

create function public.tutor_lesson_note_delete(p_student_id uuid, p_note_id uuid, p_expected_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  delete from public.tutor_lesson_notes n where n.id = p_note_id and n.student_id = p_student_id
    and n.author_id = (select auth.uid()) and n.revision = p_expected_revision;
  if not found then raise exception 'Note unavailable or changed'; end if;
  return true;
end;
$$;

-- This is the only parent-facing API. No IDs, draft content or internal metadata are returned.
create function public.parent_published_lesson_notes(p_student_id uuid)
returns table(note_text text, created_at timestamptz, author_name text)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('parent') or not exists (
    select 1 from public.parent_students ps where ps.parent_id = (select auth.uid()) and ps.student_id = p_student_id
  ) then raise exception 'Not authorized'; end if;
  return query select n.note_text, n.created_at, p.display_name from public.tutor_lesson_notes n
    join public.profiles p on p.id = n.author_id
    where n.student_id = p_student_id and n.visibility = 'parent' and n.published_at is not null
      and exists (select 1 from public.teacher_students ts join public.user_roles r on r.user_id = ts.teacher_id and r.role = 'teacher' where ts.teacher_id = n.author_id and ts.student_id = n.student_id)
    order by n.created_at desc, n.id;
end;
$$;

revoke all on function public.tutor_lesson_notes_list(uuid), public.tutor_lesson_note_save(uuid,uuid,text,text,bigint), public.tutor_lesson_note_set_publication(uuid,uuid,boolean,bigint), public.tutor_lesson_note_delete(uuid,uuid,bigint), public.parent_published_lesson_notes(uuid) from public, anon, authenticated;
grant execute on function public.tutor_lesson_notes_list(uuid), public.tutor_lesson_note_save(uuid,uuid,text,text,bigint), public.tutor_lesson_note_set_publication(uuid,uuid,boolean,bigint), public.tutor_lesson_note_delete(uuid,uuid,bigint), public.parent_published_lesson_notes(uuid) to authenticated;

-- ===== 202611230001_classrooms_review.sql =====
-- REVIEW ONLY. Do not apply until classroom authorization, retention and rollout are approved.
-- Deliberately excludes invite codes and enrollment-by-code: no verified enrollment policy or abuse controls exist yet.

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

-- ===== 202611240001_teacher_tests_review.sql =====
-- REVIEW ONLY. No production application is authorized by this file.
-- Frozen questions are teacher-authored snapshots; the DB validates IDs and shapes,
-- not mathematical correctness of browser-generated content.

create table public.teacher_tests (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references public.profiles(id) on delete restrict,
 content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 262144),
 revision bigint not null default 1 check (revision > 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index teacher_tests_owner_updated on public.teacher_tests(teacher_id,updated_at desc,id);
alter table public.teacher_tests enable row level security;
revoke all on public.teacher_tests from public,anon,authenticated;

create function public.teacher_tests_list() returns setof public.teacher_tests
language plpgsql security definer set search_path = '' as $$
begin
 if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
 return query select t.* from public.teacher_tests t where t.teacher_id=(select auth.uid()) order by t.updated_at desc,t.id;
end; $$;

create function public.teacher_test_save(p_id uuid,p_revision bigint,p_content jsonb) returns setof public.teacher_tests
language plpgsql security definer set search_path = '' as $$
declare t public.teacher_tests; item jsonb; question jsonb; section jsonb; requested integer := 0; section_ids text[] := array[]::text[];
begin
 if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
 if p_content is null or jsonb_typeof(p_content) <> 'object' or pg_column_size(p_content)>262144
   or jsonb_typeof(p_content->'title') is distinct from 'string' or char_length(p_content->>'title') not between 1 and 150
   or (p_content->>'title') !~ '[^[:space:]]'
   or jsonb_typeof(p_content->'instructions') is distinct from 'string' or char_length(p_content->>'instructions')>2000
   or jsonb_typeof(p_content->'nameField') is distinct from 'boolean'
   or jsonb_typeof(p_content->'dateField') is distinct from 'boolean'
   or jsonb_typeof(p_content->'branding') is distinct from 'boolean'
   or coalesce(jsonb_typeof(p_content->'grade'),'missing') not in ('null','number')
   or (jsonb_typeof(p_content->'grade')='number' and ((p_content->>'grade') !~ '^[1-7]$'))
   or coalesce(jsonb_typeof(p_content->'minutes'),'missing') not in ('null','number')
   or (jsonb_typeof(p_content->'minutes')='number' and ((p_content->>'minutes') !~ '^[0-9]{1,3}$' or (p_content->>'minutes')::int not between 1 and 600))
   or jsonb_typeof(p_content->'questions') is distinct from 'array' then raise exception 'Invalid test'; end if;
 if p_content ? 'defaultPoints' and (jsonb_typeof(p_content->'defaultPoints') is distinct from 'number' or (p_content->>'defaultPoints') !~ '^[0-9]{1,3}$' or (p_content->>'defaultPoints')::int not between 1 and 100) then raise exception 'Invalid points'; end if;
 if p_content ? 'sections' then
   if jsonb_typeof(p_content->'sections') is distinct from 'array' then raise exception 'Invalid sections'; end if;
   if jsonb_array_length(p_content->'sections') > 100 then raise exception 'Too many sections'; end if;
   for section in select * from jsonb_array_elements(p_content->'sections') loop
     if jsonb_typeof(section) is distinct from 'object'
       or jsonb_typeof(section->'id') is distinct from 'string' or char_length(section->>'id') not between 1 and 100
       or (section->>'id') = any(section_ids)
       or jsonb_typeof(section->'grade') is distinct from 'number' or (section->>'grade') !~ '^[1-7]$'
       or jsonb_typeof(section->'quantity') is distinct from 'number' or (section->>'quantity') !~ '^[0-9]{1,3}$' or (section->>'quantity')::int not between 1 and 100
       or jsonb_typeof(section->'topicId') is distinct from 'string' or char_length(section->>'topicId') > 200
       or jsonb_typeof(section->'unitId') is distinct from 'string' or char_length(section->>'unitId') > 200
       or jsonb_typeof(section->'subtopicId') is distinct from 'string' or char_length(section->>'subtopicId') > 200
       or jsonb_typeof(section->'templateId') is distinct from 'string' or char_length(section->>'templateId') > 200
       or (section->>'topicId' <> '' and not exists (select 1 from public.curriculum_topics c where c.grade::text=section->>'grade' and c.topic_id=section->>'topicId'))
       or (section->>'unitId' <> '' and not exists (select 1 from public.curriculum_units u where u.grade::text=section->>'grade' and u.topic_id=section->>'topicId' and u.unit_id=section->>'unitId'))
       or (section->>'subtopicId' <> '' and not exists (select 1 from public.curriculum_subunits s where s.grade::text=section->>'grade' and s.topic_id=section->>'topicId' and s.unit_id=section->>'unitId' and s.subunit_id=section->>'subtopicId'))
       or (section->>'templateId' <> '' and not exists (select 1 from public.exercise_templates e where e.grade::text=section->>'grade' and e.topic_id=section->>'topicId' and e.subunit_id=section->>'subtopicId' and e.template_id=section->>'templateId'))
       then raise exception 'Invalid section'; end if;
     section_ids := array_append(section_ids, section->>'id');
     requested := requested + (section->>'quantity')::int;
   end loop;
   if requested > 100 then raise exception 'Too many requested questions'; end if;
 end if;
 if jsonb_array_length(p_content->'questions')>100 then raise exception 'Too many questions'; end if;
 for item in select * from jsonb_array_elements(p_content->'questions') loop
   question := item->'question';
   if jsonb_typeof(item) is distinct from 'object' or jsonb_typeof(question) is distinct from 'object'
     or jsonb_typeof(item->'points') is distinct from 'number' or (item->>'points') !~ '^[0-9]{1,3}$' or (item->>'points')::int not between 1 and 100
     or jsonb_typeof(question->'templateId') is distinct from 'string'
     or jsonb_typeof(question->'id') is distinct from 'string'
     or jsonb_typeof(question->'seed') is distinct from 'number' or (question->>'seed') !~ '^[0-9]{1,10}$'
     or question->>'id' <> (question->>'templateId') || '~' || (question->>'seed')
     or jsonb_typeof(question->'prompt') is distinct from 'string' or char_length(question->>'prompt') not between 1 and 3000
     or jsonb_typeof(question->'answer') is distinct from 'string' or char_length(question->>'answer') not between 1 and 1000
     or jsonb_typeof(question->'options') is distinct from 'array'
     or not exists (select 1 from public.exercise_templates e where e.template_id=question->>'templateId'
       and e.grade::text=question->>'grade' and e.topic_id=question->>'topicId' and e.subunit_id=question->>'subtopicId')
     then raise exception 'Invalid exercise'; end if;
 end loop;
 if p_id is null then
   if p_revision is not null then raise exception 'Invalid revision'; end if;
   insert into public.teacher_tests(teacher_id,content) values((select auth.uid()),p_content) returning * into t;
 else
   update public.teacher_tests x set content=p_content,revision=x.revision+1,updated_at=clock_timestamp()
    where x.id=p_id and x.teacher_id=(select auth.uid()) and x.revision=p_revision returning x.* into t;
   if not found then raise exception 'Test unavailable or changed'; end if;
 end if;
 return next t;
end; $$;
create function public.teacher_test_delete(p_id uuid,p_revision bigint) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
 if not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
 delete from public.teacher_tests t where t.id=p_id and t.teacher_id=(select auth.uid()) and t.revision=p_revision;
 if not found then raise exception 'Test unavailable or changed'; end if;
 return true;
end; $$;
revoke all on function public.teacher_tests_list(),public.teacher_test_save(uuid,bigint,jsonb),public.teacher_test_delete(uuid,bigint) from public,anon,authenticated;
grant execute on function public.teacher_tests_list(),public.teacher_test_save(uuid,bigint,jsonb),public.teacher_test_delete(uuid,bigint) to authenticated;

-- ===== 202611250001_classroom_capacity_review.sql =====
-- REVIEW ONLY. Not a production migration. Depends on 202611230001_classrooms_review.sql.
-- No codes or enrollment-by-code: trusted abuse controls and real sessions are not ready.
-- Existing classrooms remain uncapped until a tutor deliberately sets a capacity.

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

-- ===== 202611260001_classroom_abuse_review.sql =====
-- REVIEW ONLY: never apply to production without security and retention review.
-- Rate buckets hold only keyed digests, never codes, IP addresses or account IDs.
-- Requires the academy_private schema from the initial migration.

create table academy_private.classroom_code_rate_buckets (
  scope text not null check (scope in ('account', 'network')),
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts between 1 and 1000000000),
  primary key(scope,subject_hash)
);
revoke all on academy_private.classroom_code_rate_buckets from public, anon, authenticated, service_role;

-- Fixed windows: at most 10 attempts/account and 60/network per 10 minutes.
-- Both counters are incremented even when blocked. An invalid attempt is charged
-- by the gateway in a separate committed call BEFORE validation or redemption.
-- The deployment must restrict this RPC to the trusted backend's service role.
create function public.classroom_code_consume_rate(p_account_hash text, p_network_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare now_at timestamptz := clock_timestamp(); account_attempts integer; network_attempts integer;
begin
  if p_account_hash is null or p_network_hash is null or p_account_hash !~ '^[a-f0-9]{64}$' or p_network_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid rate key'; end if;
  insert into academy_private.classroom_code_rate_buckets(scope,subject_hash,window_start,attempts)
    values ('account',p_account_hash,now_at,1)
    on conflict (scope,subject_hash) do update set
      window_start = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then now_at else classroom_code_rate_buckets.window_start end,
      attempts = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then 1 else least(classroom_code_rate_buckets.attempts + 1,1000000000) end
    returning attempts into account_attempts;
  insert into academy_private.classroom_code_rate_buckets(scope,subject_hash,window_start,attempts)
    values ('network',p_network_hash,now_at,1)
    on conflict (scope,subject_hash) do update set
      window_start = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then now_at else classroom_code_rate_buckets.window_start end,
      attempts = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then 1 else least(classroom_code_rate_buckets.attempts + 1,1000000000) end
    returning attempts into network_attempts;
  return account_attempts <= 10 and network_attempts <= 60;
end; $$;
-- Trusted scheduled maintenance can remove inactive keys; never remove an active window.
create function public.classroom_code_clean_rate_buckets()
returns bigint language plpgsql security definer set search_path = '' as $$
declare deleted bigint;
begin
  delete from academy_private.classroom_code_rate_buckets where window_start < clock_timestamp() - interval '24 hours';
  get diagnostics deleted = row_count;
  return deleted;
end; $$;
revoke all on function public.classroom_code_consume_rate(text,text), public.classroom_code_clean_rate_buckets() from public, anon, authenticated, service_role;
grant execute on function public.classroom_code_consume_rate(text,text), public.classroom_code_clean_rate_buckets() to service_role;

-- ===== 202611270001_classroom_codes_review.sql =====
-- REVIEW ONLY: not deployed. Depends on classrooms and capacity review migrations.
-- Only a trusted backend that independently verifies auth and enforces rate limits
-- may call these functions. Never expose a service-role credential to a browser.

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

-- ===== 202611280001_admin_teacher_links_review.sql =====
-- REVIEW ONLY, not applied. Depends on 202611200001 and 202611230001.
-- A teacher_students link grants access to student data. Only an academy admin
-- may create one, after authorization has been established OUTSIDE this RPC.
-- This draft does not implement revocation or establish legal consent.

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

-- ===== 202611290001_teacher_link_revoke_review.sql =====
-- REVIEW ONLY. Depends on classroom/capacity/code and admin-link review migrations.
-- This protocol must be used by EVERY authorized link/membership mutation path.
-- Privileged direct writes, role revocation and auth-token/session races remain
-- independent release blockers; do not apply without a full security review.

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

-- ===== 202611300001_teacher_write_lock_review.sql =====
-- REVIEW ONLY. No deployment. Depends on initial, lesson-note, classroom,
-- classroom capacity, classroom codes, link and revocation review migrations.
-- Only the participating operations below use this protocol. Independent privacy,
-- RLS and concurrency review is required before handling real data.

-- Only invoked inside definer-owned operations; do not expose it as an RPC.
-- Always validate again after the pair lock: revocation may have committed while
-- this operation waited. Hold role/link rows against concurrent row deletion.
create function academy_private.lock_authorized_teacher_pair(p_teacher uuid, p_student uuid)
returns void language plpgsql set search_path = '' as $$
begin
  if p_teacher is null or p_student is null or p_teacher <> (select auth.uid()) or not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  perform academy_private.lock_teacher_student_pair(p_teacher, p_student);
  perform 1 from public.user_roles where user_id=p_teacher and role='teacher' for key share;
  if not found then raise exception 'Not authorized'; end if;
  perform 1 from public.teacher_students where teacher_id=p_teacher and student_id=p_student for key share;
  if not found then raise exception 'Not authorized'; end if;
  perform 1 from public.user_roles where user_id=p_student and role='student' for key share;
  if not found then raise exception 'Not authorized'; end if;
end; $$;
revoke all on function academy_private.lock_authorized_teacher_pair(uuid,uuid) from public, anon, authenticated, service_role;

-- RLS continues to apply. This row trigger serializes authenticated assignment
-- writes with link revocation and forbids changing author or student by UPDATE.
-- Null auth.uid (including unimpersonated service/superuser writes) fails closed;
-- controlled imports require a separately reviewed administrative workflow.
create function academy_private.guard_teacher_assignment_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare teacher uuid; student uuid;
begin
  if tg_op = 'INSERT' then
    teacher := new.assigned_by; student := new.student_id;
  else
    teacher := old.assigned_by; student := old.student_id;
    if tg_op = 'UPDATE' and (new.assigned_by is distinct from old.assigned_by or new.student_id is distinct from old.student_id) then
      raise exception 'Assignment owner and student cannot be changed';
    end if;
  end if;
  perform academy_private.lock_authorized_teacher_pair(teacher,student);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function academy_private.guard_teacher_assignment_write() from public, anon, authenticated, service_role;
create trigger guard_teacher_assignment_write before insert or update or delete on public.homework_assignments
for each row execute function academy_private.guard_teacher_assignment_write();

create or replace function public.tutor_lesson_note_save(p_student_id uuid, p_note_id uuid, p_note_text text, p_visibility text, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
  if p_note_text is null or char_length(p_note_text) > 2000 or p_note_text !~ '[^[:space:]]' or p_visibility is null or p_visibility not in ('tutor', 'parent') then raise exception 'Invalid note'; end if;
  if p_note_id is null then
    if p_expected_revision is not null then raise exception 'Invalid revision'; end if;
    insert into public.tutor_lesson_notes(student_id, author_id, note_text, visibility)
      values(p_student_id, (select auth.uid()), p_note_text, p_visibility) returning * into result;
  else
    update public.tutor_lesson_notes n set note_text = p_note_text, visibility = p_visibility,
      published_at = null, updated_at = clock_timestamp(), revision = n.revision + 1
      where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) and n.revision = p_expected_revision
      returning n.* into result;
    if not found then raise exception 'Note unavailable or changed'; end if;
  end if;
  return next result;
end;
$$;

create or replace function public.tutor_lesson_note_set_publication(p_student_id uuid, p_note_id uuid, p_publish boolean, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
  if p_publish is null then raise exception 'Invalid action'; end if;
  select n.* into result from public.tutor_lesson_notes n
    where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) for update;
  if not found or result.revision <> p_expected_revision or p_expected_revision is null then raise exception 'Note unavailable or changed'; end if;
  if p_publish and result.visibility <> 'parent' then raise exception 'Note not parent-visible'; end if;
  if (p_publish and result.published_at is null) or (not p_publish and result.published_at is not null) then
    update public.tutor_lesson_notes n set published_at = case when p_publish then clock_timestamp() else null end,
      updated_at = clock_timestamp(), revision = n.revision + 1 where n.id = result.id returning n.* into result;
  end if;
  return next result;
end;
$$;

create or replace function public.tutor_lesson_note_delete(p_student_id uuid, p_note_id uuid, p_expected_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
  delete from public.tutor_lesson_notes n where n.id = p_note_id and n.student_id = p_student_id
    and n.author_id = (select auth.uid()) and n.revision = p_expected_revision;
  if not found then raise exception 'Note unavailable or changed'; end if;
  return true;
end;
$$;

-- ===== 202612010001_homework_review.sql =====
-- REVIEW ONLY. Not deployed. Depends on initial, notes, classroom, capacity,
-- codes, admin linking, link revocation and teacher write-lock migrations.
-- The result of an exercise attempt remains CLIENT-SCORED AND UNVERIFIED.

alter table public.homework_assignments
  add column title text not null default 'დავალება' check (char_length(title) between 1 and 120 and title ~ '[^[:space:]]'),
  add column instructions text not null default '' check (char_length(instructions) <= 1000),
  add column status text not null default 'published' check (status in ('published','cancelled')),
  add column revision bigint not null default 1 check (revision > 0),
  add column cancelled_at timestamptz,
  add constraint homework_cancel_consistent check ((status='cancelled') = (cancelled_at is not null));
-- Legacy rows remain published; their title is the neutral default above.
-- Existing attempts are preserved. Direct mutations are replaced by RPCs.
revoke insert, update, delete on public.homework_assignments from public, anon, authenticated;
drop policy assignments_insert on public.homework_assignments;
drop policy assignments_update on public.homework_assignments;
drop policy assignments_delete on public.homework_assignments;
drop policy assignments_read on public.homework_assignments;
create policy assignments_read on public.homework_assignments for select to authenticated using (
  (assigned_by=(select auth.uid()) and academy_private.can_teach(student_id)) or
  (status='published' and academy_private.can_view_student(student_id))
);

create table academy_private.homework_requests (
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  request_id uuid not null,
  state text not null check (state in ('published','abandoned')),
  payload_digest bytea,
  assignment_ids uuid[],
  constraint homework_request_state_consistent check (
    (state='published' and payload_digest is not null and octet_length(payload_digest)=32 and assignment_ids is not null and cardinality(assignment_ids) between 1 and 50) or
    (state='abandoned' and payload_digest is null and assignment_ids is null)
  ),
  created_at timestamptz not null default clock_timestamp(),
  primary key(teacher_id,request_id)
);
alter table academy_private.homework_requests enable row level security;
revoke all on academy_private.homework_requests from public, anon, authenticated, service_role;

-- REVIEW LIMITS: at most 30 new request records per fixed ten-minute
-- window and 10,000 lifetime records per teacher. This bounds retained records,
-- but a full quota can also delay recovery. Product/abuse/retention review and
-- a safe operational remediation process are required before release.
-- Counters and ledger rows commit or roll back together. Existing-key retries
-- and resolutions do not consume another slot. No cleanup is performed.
create table academy_private.homework_request_quotas (
  teacher_id uuid primary key references public.profiles(id) on delete restrict,
  window_started_at timestamptz not null,
  window_count integer not null check (window_count between 0 and 30),
  lifetime_count integer not null check (lifetime_count between 0 and 10000)
);
alter table academy_private.homework_request_quotas enable row level security;
revoke all on academy_private.homework_request_quotas from public, anon, authenticated, service_role;

-- Called only after the caller has locked/rechecked its teacher role. Locking a
-- single per-teacher row makes simultaneous distinct requests share one quota.
-- Repeatable-read conflicts fail rather than acting on a stale counter snapshot.
create function academy_private.reserve_homework_request_slot(p_teacher uuid)
returns void language plpgsql set search_path = '' as $$
declare quota academy_private.homework_request_quotas%rowtype; current_time_at_lock timestamptz;
begin
  if p_teacher is null or p_teacher <> (select auth.uid()) or not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  insert into academy_private.homework_request_quotas(teacher_id,window_started_at,window_count,lifetime_count)
    values(p_teacher,clock_timestamp(),0,0) on conflict (teacher_id) do nothing;
  select * into quota from academy_private.homework_request_quotas where teacher_id=p_teacher for update;
  if not found then raise exception 'Quota unavailable'; end if;
  current_time_at_lock := clock_timestamp();
  if quota.lifetime_count >= 10000 or (current_time_at_lock < quota.window_started_at + interval '10 minutes' and quota.window_count >= 30) then
    raise exception using errcode='54000', message='Homework request limit reached';
  end if;
  update academy_private.homework_request_quotas set
    window_started_at = case when current_time_at_lock >= quota.window_started_at + interval '10 minutes' then current_time_at_lock else quota.window_started_at end,
    window_count = case when current_time_at_lock >= quota.window_started_at + interval '10 minutes' then 1 else quota.window_count + 1 end,
    lifetime_count = quota.lifetime_count + 1 where teacher_id=p_teacher;
end; $$;
revoke all on function academy_private.reserve_homework_request_slot(uuid) from public, anon, authenticated, service_role;

-- One request atomically publishes a batch of 1..50 separate assignments for
-- one already-linked student. Same request ID + same payload safely retries.
create function public.teacher_homework_create(p_request uuid, p_student uuid, p_title text, p_instructions text, p_due timestamptz, p_subtopics jsonb)
returns uuid[] language plpgsql security definer set search_path = '' as $$
declare teacher uuid := (select auth.uid()); payload jsonb; digest bytea; prior academy_private.homework_requests%rowtype;
  item jsonb; g integer; topic text; sub text; ids uuid[] := '{}'; new_id uuid; seen text[] := '{}'; refkey text;
begin
  if teacher is null or p_request is null or p_student is null or not academy_private.has_role('teacher') then raise exception 'Not authorized or invalid request'; end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 120 or p_instructions is null or char_length(btrim(p_instructions)) > 1000 or p_due is null or not isfinite(p_due) or p_subtopics is null or jsonb_typeof(p_subtopics) <> 'array' or jsonb_array_length(p_subtopics) not between 1 and 50 or pg_column_size(p_subtopics) > 16000 then raise exception 'Invalid request'; end if;
  payload := jsonb_build_object('student',p_student,'title',btrim(p_title),'instructions',btrim(p_instructions),'due_epoch',extract(epoch from p_due),'subtopics',p_subtopics);
  -- Keep only a canonical SHA-256 digest in the retry ledger, not a second
  -- copy of student details/instructions. This is not encryption.
  digest := pg_catalog.sha256(pg_catalog.convert_to(payload::text,'UTF8'));
  -- Serialize request-key reuse before pair locks. Revocation never acquires this
  -- request lock. A reused key with different content fails rather than duplicating.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.homework-request:' || teacher::text || ':' || p_request::text,0));
  perform academy_private.lock_authorized_teacher_pair(teacher,p_student);
  select * into prior from academy_private.homework_requests where teacher_id=teacher and request_id=p_request;
  if found then
    if prior.state <> 'published' or prior.payload_digest <> digest then raise exception 'Request already used'; end if;
    return prior.assignment_ids;
  end if;
  if p_due <= clock_timestamp() then raise exception 'Invalid request'; end if;
  perform academy_private.reserve_homework_request_slot(teacher);
  for item in select value from jsonb_array_elements(p_subtopics) loop
    if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'grade') <> 'number' or (item->>'grade') !~ '^[1-7]$' or jsonb_typeof(item->'topicId') <> 'string' or jsonb_typeof(item->'subtopicId') <> 'string' or (select count(*) from jsonb_object_keys(item)) <> 3 then raise exception 'Invalid curriculum'; end if;
    g := (item->>'grade')::integer; topic := item->>'topicId'; sub := item->>'subtopicId';
    if char_length(topic) not between 1 and 120 or char_length(sub) not between 1 and 120 then raise exception 'Invalid curriculum'; end if;
    refkey := jsonb_build_array(g,topic,sub)::text;
    if refkey = any(seen) or not exists(select 1 from public.exercise_templates e where e.grade=g and e.topic_id=topic and e.subunit_id=sub) then raise exception 'Invalid curriculum'; end if;
    seen := array_append(seen,refkey);
    insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at,title,instructions,status)
      values(p_student,teacher,g,topic,sub,p_due,btrim(p_title),btrim(p_instructions),'published') returning id into new_id;
    ids := array_append(ids,new_id);
  end loop;
  insert into academy_private.homework_requests(teacher_id,request_id,state,payload_digest,assignment_ids) values(teacher,p_request,'published',digest,ids);
  return ids;
end; $$;

-- Resolve an uncertain create without resending its private payload. If no create
-- committed, permanently fence this request key, including a delayed create that
-- has not reached the server yet. Repeated calls return the same terminal state.
-- No assignment details or student identifiers are returned by this function.
create function public.teacher_homework_resolve(p_request uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare teacher uuid := (select auth.uid()); request_state text;
begin
  if teacher is null or p_request is null or not academy_private.has_role('teacher') then raise exception 'Not authorized or invalid request'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.homework-request:' || teacher::text || ':' || p_request::text,0));
  perform 1 from public.user_roles where user_id=teacher and role='teacher' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  select state into request_state from academy_private.homework_requests where teacher_id=teacher and request_id=p_request;
  if found then return request_state; end if;
  perform academy_private.reserve_homework_request_slot(teacher);
  insert into academy_private.homework_requests(teacher_id,request_id,state) values(teacher,p_request,'abandoned');
  return 'abandoned';
end; $$;

create function public.teacher_homework_cancel(p_id uuid, p_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare teacher uuid := (select auth.uid()); target uuid; row public.homework_assignments%rowtype;
begin
  if teacher is null or p_id is null or p_revision is null or not academy_private.has_role('teacher') then raise exception 'Not authorized or unavailable'; end if;
  select student_id into target from public.homework_assignments where id=p_id and assigned_by=teacher;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  perform academy_private.lock_authorized_teacher_pair(teacher,target);
  select * into row from public.homework_assignments where id=p_id and assigned_by=teacher and student_id=target for update;
  if not found then raise exception 'Not authorized or unavailable'; end if;
  -- Safe to retry after a lost response; never reactivate a cancelled assignment.
  if row.status='cancelled' then return true; end if;
  if row.revision <> p_revision then raise exception 'Assignment changed'; end if;
  update public.homework_assignments set status='cancelled',cancelled_at=clock_timestamp(),revision=revision+1 where id=p_id;
  return true;
end; $$;

-- The student may finish an already-started session after cancellation. Without
-- a trusted start event the server cannot distinguish that from a later forged
-- attempt, so this is unverified activity and must never prove completion.
create function academy_private.student_attempt_assignment_matches(p_assignment uuid, p_student uuid, p_grade smallint, p_topic text, p_subunit text)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_student=(select auth.uid()) and academy_private.has_role('student') and exists(
    select 1 from public.homework_assignments a where a.id=p_assignment and a.student_id=p_student
      and a.grade=p_grade and a.topic_id=p_topic and a.subunit_id=p_subunit
  );
$$;
revoke all on function academy_private.student_attempt_assignment_matches(uuid,uuid,smallint,text,text) from public, anon, authenticated, service_role;
grant execute on function academy_private.student_attempt_assignment_matches(uuid,uuid,smallint,text,text) to authenticated;
drop policy attempts_insert on public.exercise_attempts;
create policy attempts_insert on public.exercise_attempts for insert to authenticated with check (
 student_id=(select auth.uid()) and academy_private.has_role('student') and
 (assignment_id is null or academy_private.student_attempt_assignment_matches(assignment_id,student_id,grade,topic_id,subunit_id))
);
revoke all on function public.teacher_homework_create(uuid,uuid,text,text,timestamptz,jsonb),public.teacher_homework_cancel(uuid,bigint),public.teacher_homework_resolve(uuid) from public,anon,authenticated,service_role;
grant execute on function public.teacher_homework_create(uuid,uuid,text,text,timestamptz,jsonb),public.teacher_homework_cancel(uuid,bigint),public.teacher_homework_resolve(uuid) to authenticated;

-- ===== 202612020001_role_lifecycle_review.sql =====
-- REVIEW ONLY, never applied remotely. Depends on the full review chain including
-- teacher tests, classrooms, codes, linking, revocation, write locks and homework.
-- This is access suspension, NOT Auth session revocation or data deletion.

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

-- ===== 202612030001_parent_link_review.sql =====
-- REVIEW ONLY. Not deployed. Depends on the complete role-lifecycle review chain.
-- An external reference is NOT proof of parental authority, consent or legal basis.

-- Both supported parent-link mutations serialize on the same pair. An epoch
-- write also makes a stale REPEATABLE READ/SERIALIZABLE snapshot fail rather
-- than recreate a newer removed link or miss a newer established one.
create table academy_private.parent_link_epochs (
  parent_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  primary key (parent_id, student_id), check (parent_id <> student_id)
);
alter table academy_private.parent_link_epochs enable row level security;
revoke all on academy_private.parent_link_epochs from public,anon,authenticated,service_role;
create function academy_private.lock_parent_student_pair(p_parent uuid,p_student uuid)
returns void language plpgsql set search_path='' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-student:' || p_parent::text || ':' || p_student::text,0));
  insert into academy_private.parent_link_epochs(parent_id,student_id) values(p_parent,p_student)
  on conflict (parent_id,student_id) do update set revision=academy_private.parent_link_epochs.revision+1;
end; $$;
revoke all on function academy_private.lock_parent_student_pair(uuid,uuid) from public,anon,authenticated,service_role;

create table academy_private.parent_link_establishment_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  parent_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  created_at timestamptz not null default clock_timestamp(),
  check (parent_id <> student_id)
);
alter table academy_private.parent_link_establishment_audit enable row level security;
revoke all on academy_private.parent_link_establishment_audit from public,anon,authenticated,service_role;
revoke all on sequence academy_private.parent_link_establishment_audit_id_seq from public,anon,authenticated,service_role;

-- Admin must independently establish authority before calling. Existing parent
-- visibility is broad; linking can re-expose retained records and parent notes.
create function public.admin_establish_parent_link(p_parent uuid,p_student uuid,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); role_count integer;
begin
  if actor is null or p_parent is null or p_student is null or p_parent=p_student or p_reference is null
     or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_parent_student_pair(p_parent,p_student);
  -- Participant role deletion waits for accepted writes; sorted locking avoids
  -- an avoidable cycle if the actor also has another role.
  perform 1 from public.user_roles r where (r.user_id=actor and r.role='admin')
    or (r.user_id=p_parent and r.role='parent') or (r.user_id=p_student and r.role='student')
    order by r.user_id,r.role for share;
  select count(*) into role_count from public.user_roles r where (r.user_id=actor and r.role='admin')
    or (r.user_id=p_parent and r.role='parent') or (r.user_id=p_student and r.role='student');
  if role_count <> 3 then raise exception 'Not authorized or invalid request'; end if;
  insert into public.parent_students(parent_id,student_id) values(p_parent,p_student) on conflict do nothing;
  if not found then return false; end if;
  insert into academy_private.parent_link_establishment_audit(admin_id,parent_id,student_id,authorization_reference)
    values(actor,p_parent,p_student,p_reference);
  return true;
end; $$;

-- Replace the earlier unlink with the same pair/epoch protocol. Cleanup remains
-- possible after either participant role has been suspended. Absent links are
-- idempotent; absent profiles fail closed (the epoch holds FKs).
create or replace function public.admin_revoke_parent_link(p_parent uuid,p_student uuid,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); removed integer;
begin
  if actor is null or p_parent is null or p_student is null or p_parent=p_student or p_reference is null
     or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_parent_student_pair(p_parent,p_student);
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  delete from public.parent_students where parent_id=p_parent and student_id=p_student;
  get diagnostics removed = row_count;
  if removed=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,related_student_id,affected,authorization_reference)
    values(actor,p_parent,'parent_link_revoked',p_student,removed,p_reference);
  return true;
end; $$;
revoke all on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) to authenticated;

-- ===== 202612040001_role_regrant_review.sql =====
-- REVIEW ONLY. Depends on role-lifecycle and parent-link drafts. No Auth user
-- is created or unbanned; caller must independently verify authorization.

alter table academy_private.role_lifecycle_audit drop constraint role_lifecycle_audit_action_check;
alter table academy_private.role_lifecycle_audit add constraint role_lifecycle_audit_action_check
  check (action in ('role_revoked','role_restored','parent_link_revoked','teacher_codes_retired'));

-- This only restores one Academy role. The existing trigger still blocks it if
-- retained links, memberships or live codes could silently reappear. Cleanup
-- and later relationship authorization must be separate explicit actions.
create function public.admin_restore_academy_role(p_target uuid,p_role text,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); inserted integer;
begin
  if actor is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent')
     or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_role_lifecycle(p_target,p_role);
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  -- Detect stale snapshots even if this role is absent in the old snapshot or
  -- already exists now. The reinstatement trigger also updates the epoch.
  insert into academy_private.role_lifecycle_epochs(user_id,role,revision) values(p_target,p_role,1)
    on conflict (user_id,role) do update set revision=academy_private.role_lifecycle_epochs.revision+1;
  if exists(select 1 from public.user_roles where user_id=p_target and role=p_role) then return false; end if;
  -- This RPC is restoration, not arbitrary initial role provisioning. Refuse
  -- untracked direct deletions or roles which were never suspended by the
  -- audited RPC. Privileged out-of-band changes still need a separate review.
  if coalesce((select action from academy_private.role_lifecycle_audit
    where target_id=p_target and target_role=p_role and action in ('role_revoked','role_restored')
    order by id desc limit 1),'') <> 'role_revoked' then
    raise exception 'Audited suspension required';
  end if;
  insert into public.user_roles(user_id,role) values(p_target,p_role) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,target_role,affected,authorization_reference)
    values(actor,p_target,'role_restored',p_role,inserted,p_reference);
  return true;
end; $$;
revoke all on function public.admin_restore_academy_role(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_restore_academy_role(uuid,text,text) to authenticated;

-- ===== 202612050001_profile_provision_review.sql =====
-- REVIEW ONLY. Never applied remotely. Requires the full prior review chain.
-- Only profiles for Auth users that already exist may be provisioned. This
-- does NOT create Auth users, send credentials, collect consent, or set billing.

create table academy_private.profile_provision_audit (
  admin_id uuid not null references public.profiles(id) on delete restrict,
  request_id uuid not null,
  target_id uuid not null references public.profiles(id) on delete restrict,
  payload_digest bytea not null check(octet_length(payload_digest)=32),
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  created_at timestamptz not null default clock_timestamp(),
  primary key(admin_id,request_id)
);
alter table academy_private.profile_provision_audit enable row level security;
revoke all on academy_private.profile_provision_audit from public,anon,authenticated,service_role;

-- Admin independently confirms the Auth identity and authorization first.
-- A request ID and exact normalized payload are required for safe retry. An
-- existing profile cannot be overwritten; use separate reviewed workflows.
create function public.admin_provision_academy_profile(p_request uuid,p_target uuid,p_role text,p_display_name text,p_first_name text,p_grade smallint,p_reference text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); digest bytea; prior academy_private.profile_provision_audit%rowtype;
begin
  if actor is null or p_request is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent')
    or p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 200
    or p_first_name is null or char_length(btrim(p_first_name)) not between 1 and 100
    or (p_role='student' and (p_grade is null or p_grade not between 1 and 7)) or (p_role<>'student' and p_grade is not null)
    or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  -- A digest is for equality checking only; it is not anonymization.
  digest := pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_target,p_role,btrim(p_display_name),btrim(p_first_name),p_grade,p_reference)::text,'UTF8'));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-request:' || actor::text || ':' || p_request::text,0));
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  select * into prior from academy_private.profile_provision_audit where admin_id=actor and request_id=p_request;
  if found then
    if prior.payload_digest<>digest or prior.target_id<>p_target then raise exception 'Request already used'; end if;
    return prior.target_id;
  end if;
  -- Different request IDs for the same target must not both create a profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-target:' || p_target::text,0));
  perform 1 from auth.users where id=p_target for key share;
  if not found then raise exception 'Auth account unavailable'; end if;
  insert into public.profiles(id,display_name,first_name) values(p_target,btrim(p_display_name),btrim(p_first_name));
  insert into public.user_roles(user_id,role) values(p_target,p_role);
  if p_role='student' then insert into public.student_grades(student_id,grade) values(p_target,p_grade); end if;
  insert into academy_private.profile_provision_audit(admin_id,request_id,target_id,payload_digest,authorization_reference)
    values(actor,p_request,p_target,digest,p_reference);
  return p_target;
end; $$;
revoke all on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text) to authenticated;

-- ===== 202612060001_parent_dashboard_review.sql =====
-- REVIEW ONLY; not deployed. Depends on the complete role/link review chain.
-- Parent data is sensitive. Authenticated parent role + current link + current
-- student role are checked on every call. Results are not trusted assessments.

-- Default to summary-only access for the parent role. Subscription entitlements
-- are deliberately not implemented. A user who separately holds a qualifying
-- student/teacher role may still read through that independent authorization.
drop policy attempts_read on public.exercise_attempts;
create policy attempts_read on public.exercise_attempts for select to authenticated using (
  (student_id=(select auth.uid()) and academy_private.has_role('student'))
  or academy_private.can_teach(student_id)
);
create function public.parent_review_children()
returns table(student_id uuid, display_name text, grade smallint)
language plpgsql stable security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or not academy_private.has_role('parent') then raise exception 'Not authorized'; end if;
  return query select p.id,p.display_name,g.grade from public.parent_students ps
    join public.profiles p on p.id=ps.student_id
    join public.user_roles r on r.user_id=ps.student_id and r.role='student'
    left join public.student_grades g on g.student_id=ps.student_id
    where ps.parent_id=(select auth.uid()) order by p.display_name,p.id;
end; $$;

create function public.parent_review_recent_attempts(p_student uuid)
returns table(attempt_id text, created_at timestamptz, grade smallint, topic_id text, subunit_id text, score numeric)
language plpgsql stable security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or p_student is null or not academy_private.has_role('parent')
    or not exists(select 1 from public.parent_students ps join public.user_roles r on r.user_id=ps.student_id and r.role='student'
                  where ps.parent_id=(select auth.uid()) and ps.student_id=p_student) then raise exception 'Not authorized'; end if;
  return query select a.attempt_id,a.created_at,a.grade,a.topic_id,a.subunit_id,
    case when pg_catalog.jsonb_typeof(a.result->'score')='number' then
      case when (a.result->>'score')::numeric between 0 and 100 then (a.result->>'score')::numeric else null::numeric end
      else null::numeric end
    from public.exercise_attempts a where a.student_id=p_student order by a.created_at desc,a.attempt_id desc limit 30;
end; $$;
revoke all on function public.parent_review_children(),public.parent_review_recent_attempts(uuid) from public,anon,authenticated,service_role;
grant execute on function public.parent_review_children(),public.parent_review_recent_attempts(uuid) to authenticated;

-- ===== 202612070001_evidence_pilot_review.sql =====
-- REVIEW ONLY. Not deployed, exposed, or used to award badges/streaks.
-- Service-only, single-choice practice persistence pilot. The service MUST derive
-- actor from verified Auth and question material from its trusted generator,
-- never from browser JSON. These RPCs cannot authenticate a supplied actor or
-- prove a student worked independently. No legacy attempt is accepted.

create table academy_private.evidence_pilot_sessions (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 created_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null default (clock_timestamp()+interval '15 minutes'),
 finished_at timestamptz,
 unique(student_id,request_id),
 check (expires_at > created_at)
);
create table academy_private.evidence_pilot_questions (
 session_id uuid not null references academy_private.evidence_pilot_sessions(id) on delete restrict,
 id uuid not null default gen_random_uuid(),
 request_id uuid not null,
 prompt text not null check (length(trim(prompt)) between 1 and 500),
 options text[] not null,
 correct_answer text not null,
 selected_answer text,
 primary key(session_id,id),
 unique(session_id,request_id), unique(session_id,prompt),
 check (cardinality(options) between 2 and 6),
 check (correct_answer = any(options)),
 check (selected_answer is null or selected_answer = any(options))
);
alter table academy_private.evidence_pilot_sessions enable row level security;
alter table academy_private.evidence_pilot_questions enable row level security;
revoke all on academy_private.evidence_pilot_sessions, academy_private.evidence_pilot_questions from public,anon,authenticated,service_role;

-- Serialize lifecycle and prevent stale repeatable-read snapshots bypassing caps
-- and revocation checks. Only service-owned, read-committed calls are supported.
create function academy_private.evidence_pilot_lock_student(p_student uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if current_setting('transaction_isolation') <> 'read committed' or p_student is null then raise exception 'Unavailable'; end if;
 perform academy_private.lock_role_lifecycle(p_student,'student');
 perform 1 from public.user_roles where user_id=p_student and role='student' for key share;
 if not found then raise exception 'Unavailable'; end if;
end; $$;
revoke all on function academy_private.evidence_pilot_lock_student(uuid) from public,anon,authenticated,service_role;

create function public.evidence_pilot_start(p_student uuid,p_request uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare s academy_private.evidence_pilot_sessions%rowtype;
begin
 if p_request is null then raise exception 'Unavailable'; end if;
 perform academy_private.evidence_pilot_lock_student(p_student);
 select * into s from academy_private.evidence_pilot_sessions where student_id=p_student and request_id=p_request;
 if found then return s.id; end if;
 if (select count(*) from academy_private.evidence_pilot_sessions where student_id=p_student and finished_at is null and expires_at>clock_timestamp()) >= 3 then raise exception 'Unavailable'; end if;
 insert into academy_private.evidence_pilot_sessions(student_id,request_id) values(p_student,p_request) returning * into s;
 return s.id;
end; $$;

-- Return only public question material; no answer or internal generator seed.
-- A repeated request id returns the already-issued public question. The server
-- must generate all NEW question data itself; the RPC is NOT a public API.
create function public.evidence_pilot_issue(p_student uuid,p_session uuid,p_request uuid,p_prompt text,p_options text[],p_answer text)
returns table(question_id uuid,prompt text,options text[]) language plpgsql security definer set search_path='' as $$
declare s academy_private.evidence_pilot_sessions%rowtype; q academy_private.evidence_pilot_questions%rowtype;
begin
 if p_session is null or p_request is null then raise exception 'Unavailable'; end if;
 perform academy_private.evidence_pilot_lock_student(p_student);
 select * into s from academy_private.evidence_pilot_sessions where id=p_session and student_id=p_student for update;
 if not found then raise exception 'Unavailable'; end if;
 select * into q from academy_private.evidence_pilot_questions where session_id=p_session and request_id=p_request;
 if found then return query select q.id,q.prompt,q.options;return; end if;
 if s.finished_at is not null or s.expires_at<=clock_timestamp() then raise exception 'Unavailable'; end if;
 if p_prompt is null or length(trim(p_prompt)) not between 1 and 500 or p_options is null or cardinality(p_options) not between 2 and 6 or array_ndims(p_options)<>1 or p_answer is null
    or exists(select 1 from unnest(p_options) v where v is null or length(trim(v)) not between 1 and 200)
    or (select count(distinct v) from unnest(p_options) v)<>cardinality(p_options) or not (p_answer=any(p_options)) then raise exception 'Unavailable'; end if;
 if (select count(*) from academy_private.evidence_pilot_questions where session_id=p_session)>=20
    or exists(select 1 from academy_private.evidence_pilot_questions where session_id=p_session and selected_answer is null)
    or exists(select 1 from academy_private.evidence_pilot_questions where session_id=p_session and evidence_pilot_questions.prompt=p_prompt) then raise exception 'Unavailable'; end if;
 insert into academy_private.evidence_pilot_questions(session_id,request_id,prompt,options,correct_answer) values(p_session,p_request,p_prompt,p_options,p_answer) returning * into q;
 return query select q.id,q.prompt,q.options;
end; $$;

create function public.evidence_pilot_submit(p_student uuid,p_session uuid,p_question uuid,p_choice text)
returns boolean language plpgsql security definer set search_path='' as $$
declare s academy_private.evidence_pilot_sessions%rowtype; q academy_private.evidence_pilot_questions%rowtype;
begin
 if p_session is null or p_question is null or p_choice is null then raise exception 'Unavailable'; end if;
 perform academy_private.evidence_pilot_lock_student(p_student);
 select * into s from academy_private.evidence_pilot_sessions where id=p_session and student_id=p_student for update;
 if not found then raise exception 'Unavailable'; end if;
 select * into q from academy_private.evidence_pilot_questions where session_id=p_session and id=p_question;
 if not found or not (p_choice=any(q.options)) then raise exception 'Unavailable'; end if;
 if q.selected_answer is not null then
   if q.selected_answer<>p_choice then raise exception 'Unavailable'; end if;
   return q.selected_answer=q.correct_answer;
 end if;
 if s.finished_at is not null or s.expires_at<=clock_timestamp() then raise exception 'Unavailable'; end if;
 update academy_private.evidence_pilot_questions set selected_answer=p_choice where session_id=p_session and id=p_question;
 return p_choice=q.correct_answer;
end; $$;

create function public.evidence_pilot_finish(p_student uuid,p_session uuid)
returns table(session_id uuid,answered bigint,correct bigint,finished_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare s academy_private.evidence_pilot_sessions%rowtype; n bigint; c bigint; pending bigint;
begin
 if p_session is null then raise exception 'Unavailable'; end if;
 perform academy_private.evidence_pilot_lock_student(p_student);
 select * into s from academy_private.evidence_pilot_sessions where id=p_session and student_id=p_student for update;
 if not found then raise exception 'Unavailable'; end if;
 select count(*),count(*) filter(where selected_answer=correct_answer),count(*) filter(where selected_answer is null)
 into n,c,pending from academy_private.evidence_pilot_questions where evidence_pilot_questions.session_id=p_session;
 if s.finished_at is null then
   if s.expires_at<=clock_timestamp() or n<10 or pending>0 then raise exception 'Unavailable'; end if;
   update academy_private.evidence_pilot_sessions set finished_at=clock_timestamp() where id=p_session returning * into s;
 end if;
 return query select s.id,n,c,s.finished_at;
end; $$;
revoke all on function public.evidence_pilot_start(uuid,uuid), public.evidence_pilot_issue(uuid,uuid,uuid,text,text[],text), public.evidence_pilot_submit(uuid,uuid,uuid,text), public.evidence_pilot_finish(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.evidence_pilot_start(uuid,uuid), public.evidence_pilot_issue(uuid,uuid,uuid,text,text[],text), public.evidence_pilot_submit(uuid,uuid,uuid,text), public.evidence_pilot_finish(uuid,uuid) to service_role;

-- ===== 202612080001_profile_reconcile_review.sql =====
-- REVIEW ONLY. Local provisioning reconciliation; not deployed.
-- Never abandons or undoes a committed profile. The request UUID must be saved
-- by the operator before transmission. Only READ COMMITTED is supported.

create table academy_private.profile_provision_fences (
 admin_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(admin_id,request_id)
);
create index profile_provision_fences_recent on academy_private.profile_provision_fences(admin_id,created_at);
alter table academy_private.profile_provision_fences enable row level security;
revoke all on academy_private.profile_provision_fences from public,anon,authenticated,service_role;

create or replace function public.admin_provision_academy_profile(p_request uuid,p_target uuid,p_role text,p_display_name text,p_first_name text,p_grade smallint,p_reference text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); digest bytea; prior academy_private.profile_provision_audit%rowtype;
begin
  if current_setting('transaction_isolation') <> 'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
  if actor is null or p_request is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent')
    or p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 200
    or p_first_name is null or char_length(btrim(p_first_name)) not between 1 and 100
    or (p_role='student' and (p_grade is null or p_grade not between 1 and 7)) or (p_role<>'student' and p_grade is not null)
    or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  -- A digest is for equality checking only; it is not anonymization.
  digest := pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_target,p_role,btrim(p_display_name),btrim(p_first_name),p_grade,p_reference)::text,'UTF8'));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-request:' || actor::text || ':' || p_request::text,0));
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  select * into prior from academy_private.profile_provision_audit where admin_id=actor and request_id=p_request;
  if found then
    if prior.payload_digest<>digest or prior.target_id<>p_target then raise exception 'Request already used'; end if;
    return prior.target_id;
  end if;
  if exists(select 1 from academy_private.profile_provision_fences where admin_id=actor and request_id=p_request) then raise exception 'Request abandoned'; end if;
  -- Different request IDs for the same target must not both create a profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-target:' || p_target::text,0));
  -- Require a confirmed, active non-anonymous Auth account at provision time.
  -- This is not identity/custody verification or ongoing session revocation.
  perform 1 from auth.users where id=p_target and email_confirmed_at is not null
    and (banned_until is null or banned_until<=clock_timestamp()) and deleted_at is null
    and not coalesce(is_anonymous,false) for share;
  if not found then raise exception 'Auth account unavailable'; end if;
  insert into public.profiles(id,display_name,first_name) values(p_target,btrim(p_display_name),btrim(p_first_name));
  insert into public.user_roles(user_id,role) values(p_target,p_role);
  if p_role='student' then insert into public.student_grades(student_id,grade) values(p_target,p_grade); end if;
  insert into academy_private.profile_provision_audit(admin_id,request_id,target_id,payload_digest,authorization_reference)
    values(actor,p_request,p_target,digest,p_reference);
  return p_target;
end; $$;

-- This uses the same request lock as provisioning. An absent request receives a
-- durable fence, so a late original cannot commit after an 'abandoned' result.
create function public.admin_resolve_profile_provision(p_request uuid)
returns table(state text,target_id uuid) language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.profile_provision_audit%rowtype;
begin
 if current_setting('transaction_isolation') <> 'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-request:' || actor::text || ':' || p_request::text,0));
 perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
 if not found then raise exception 'Not authorized or invalid request'; end if;
 select * into prior from academy_private.profile_provision_audit a where a.admin_id=actor and a.request_id=p_request;
 if found then return query select 'committed'::text,prior.target_id; return; end if;
 if exists(select 1 from academy_private.profile_provision_fences f where f.admin_id=actor and f.request_id=p_request) then return query select 'abandoned'::text,null::uuid;return; end if;
 -- Limit new tombstones without affecting exact retries.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-fence-quota:' || actor::text,0));
 if (select count(*) from academy_private.profile_provision_fences f where f.admin_id=actor and f.created_at>clock_timestamp()-interval '10 minutes')>=30
    or (select count(*) from academy_private.profile_provision_fences f where f.admin_id=actor)>=10000 then raise exception 'Request quota exceeded'; end if;
 insert into academy_private.profile_provision_fences(admin_id,request_id) values(actor,p_request);
 return query select 'abandoned'::text,null::uuid;
end; $$;
revoke all on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text),public.admin_resolve_profile_provision(uuid) from public,anon,authenticated,service_role;
grant execute on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text),public.admin_resolve_profile_provision(uuid) to authenticated;

-- ===== 202612090001_parent_link_requests_review.sql =====
-- REVIEW ONLY, unapplied. Idempotent admin parent-link commands with fencing.
-- References are not consent or evidence of parental authority.

create table academy_private.parent_link_requests (
 admin_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 state text not null check(state in ('committed','abandoned')),
 payload_digest bytea,
 parent_id uuid references public.profiles(id) on delete restrict,
 student_id uuid references public.profiles(id) on delete restrict,
 action text check(action in ('establish','revoke')),
 changed boolean,
 created_at timestamptz not null default clock_timestamp(),
 primary key(admin_id,request_id),
 check((state='abandoned' and payload_digest is null and parent_id is null and student_id is null and action is null and changed is null) or
       (state='committed' and payload_digest is not null and octet_length(payload_digest)=32 and parent_id is not null and student_id is not null and action is not null and changed is not null))
);
create index parent_link_requests_recent on academy_private.parent_link_requests(admin_id,created_at);
alter table academy_private.parent_link_requests enable row level security;
revoke all on academy_private.parent_link_requests from public,anon,authenticated,service_role;

create function academy_private.reserve_parent_link_request_slot(p_admin uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request-quota:' || p_admin::text,0));
 if (select count(*) from academy_private.parent_link_requests r where r.admin_id=p_admin and r.created_at>clock_timestamp()-interval '10 minutes')>=30
 or (select count(*) from academy_private.parent_link_requests r where r.admin_id=p_admin)>=10000 then raise exception 'Request quota exceeded'; end if;
end; $$;
revoke all on function academy_private.reserve_parent_link_request_slot(uuid) from public,anon,authenticated,service_role;

create function public.admin_parent_link_change(p_request uuid,p_parent uuid,p_student uuid,p_action text,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.parent_link_requests%rowtype; digest bytea; outcome boolean;
begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or p_parent is null or p_student is null or p_parent=p_student or p_action is null or p_action not in ('establish','revoke') or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request';end if;
 digest:=pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_parent,p_student,p_action,p_reference)::text,'UTF8'));
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request:' || actor::text || ':' || p_request::text,0));
 select * into prior from academy_private.parent_link_requests r where r.admin_id=actor and r.request_id=p_request;
 if found then
   -- Verify admin role even for a read/retry after suspension.
   perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
   if not found then raise exception 'Not authorized';end if;
   if prior.state='abandoned' or prior.payload_digest<>digest then raise exception 'Request unavailable';end if;
   return prior.changed;
 end if;
 perform academy_private.reserve_parent_link_request_slot(actor);
 if p_action='establish' then outcome:=public.admin_establish_parent_link(p_parent,p_student,p_reference);
 else outcome:=public.admin_revoke_parent_link(p_parent,p_student,p_reference);end if;
 insert into academy_private.parent_link_requests(admin_id,request_id,state,payload_digest,parent_id,student_id,action,changed)
 values(actor,p_request,'committed',digest,p_parent,p_student,p_action,outcome);
 return outcome;
end; $$;

create function public.admin_parent_link_resolve(p_request uuid)
returns table(state text,parent_id uuid,student_id uuid,action text,changed boolean)
language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.parent_link_requests%rowtype;
begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request:' || actor::text || ':' || p_request::text,0));
 select * into prior from academy_private.parent_link_requests r where r.admin_id=actor and r.request_id=p_request;
 if found then
   perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
   if not found then raise exception 'Not authorized';end if;
   return query select prior.state,prior.parent_id,prior.student_id,prior.action,prior.changed;return;
 end if;
 perform academy_private.reserve_parent_link_request_slot(actor);
 perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
 if not found then raise exception 'Not authorized';end if;
 insert into academy_private.parent_link_requests(admin_id,request_id,state) values(actor,p_request,'abandoned');
 return query select 'abandoned'::text,null::uuid,null::uuid,null::text,null::boolean;
end; $$;
revoke all on function public.admin_parent_link_change(uuid,uuid,uuid,text,text),public.admin_parent_link_resolve(uuid) from public,anon,authenticated,service_role;
grant execute on function public.admin_parent_link_change(uuid,uuid,uuid,text,text),public.admin_parent_link_resolve(uuid) to authenticated;

-- ===== 202612100001_parent_data_minimization_review.sql =====
-- REVIEW ONLY. Parent-only users receive child data through the narrow dashboard
-- RPCs, not direct reads of mutable JSON, profiles or assignments. Independent
-- student/linked-teacher roles retain their own rights. Subscription entitlements
-- are deliberately not implemented. Never applied to live by this file.

drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or academy_private.can_teach(id));
drop policy grades_read on public.student_grades;
create policy grades_read on public.student_grades for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
drop policy assignments_read on public.homework_assignments;
create policy assignments_read on public.homework_assignments for select to authenticated using (
 (assigned_by=(select auth.uid()) and academy_private.can_teach(student_id)) or
 (status='published' and ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id)))
);
drop policy progress_read on public.student_progress;
create policy progress_read on public.student_progress for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
drop policy rewards_read on public.earned_rewards;
create policy rewards_read on public.earned_rewards for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
-- Bound the existing parent-visible note feed; tutor-only and unlinked-author
-- notes are still excluded. Grants from the earlier migration stay unchanged.
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
    order by n.created_at desc,n.id limit 100;
end; $$;

-- ===== 202612110001_parent_link_rpc_privileges_review.sql =====
-- REVIEW ONLY. Funnel ordinary admin requests through the fenced/idempotent
-- wrapper; only the owning security-definer may invoke the legacy primitives.
-- This is not a defense against DB owners, direct SQL, or altered ownership.

revoke all on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) from public,anon,authenticated,service_role;

commit;
