-- REVIEW ONLY. Not deployed, exposed, or used to award badges/streaks.
-- Service-only, single-choice practice persistence pilot. The service MUST derive
-- actor from verified Auth and question material from its trusted generator,
-- never from browser JSON. These RPCs cannot authenticate a supplied actor or
-- prove a student worked independently. No legacy attempt is accepted.
begin;
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
commit;
