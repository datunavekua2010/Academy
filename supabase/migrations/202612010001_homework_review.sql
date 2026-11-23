-- REVIEW ONLY. Not deployed. Depends on initial, notes, classroom, capacity,
-- codes, admin linking, link revocation and teacher write-lock migrations.
-- The result of an exercise attempt remains CLIENT-SCORED AND UNVERIFIED.
begin;
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
commit;
