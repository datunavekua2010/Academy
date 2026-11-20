-- REVIEW ONLY. Do not apply until the schema, permissions and project are approved.
-- Student-submitted attempts are UNVERIFIED. Do not use them to grant rewards.
begin;

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
commit;
