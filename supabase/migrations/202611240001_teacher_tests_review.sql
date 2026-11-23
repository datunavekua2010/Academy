-- REVIEW ONLY. No production application is authorized by this file.
-- Frozen questions are teacher-authored snapshots; the DB validates IDs and shapes,
-- not mathematical correctness of browser-generated content.
begin;
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
commit;
