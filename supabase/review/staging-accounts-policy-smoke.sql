-- Isolated synthetic staging only. Execute as a privileged test operator against
-- wxxgwayrieasrzngpuul; never production. All fixtures are rolled back.
-- Simulated DB roles/JWT subjects do not test Supabase Auth or PostgREST.
begin;
insert into auth.users(id) values
 ('b1fc612e-fca5-4b23-a635-89a073100001'), -- admin
 ('b1fc612e-fca5-4b23-a635-89a073100002'), -- parent A
 ('b1fc612e-fca5-4b23-a635-89a073100003'), -- student A
 ('b1fc612e-fca5-4b23-a635-89a073100004'), -- parent B
 ('b1fc612e-fca5-4b23-a635-89a073100005'); -- student B
insert into public.profiles(id,display_name,first_name)
 select id,'Synthetic','Synthetic' from auth.users where id in
 ('b1fc612e-fca5-4b23-a635-89a073100001','b1fc612e-fca5-4b23-a635-89a073100002',
  'b1fc612e-fca5-4b23-a635-89a073100003','b1fc612e-fca5-4b23-a635-89a073100004',
  'b1fc612e-fca5-4b23-a635-89a073100005');
insert into public.user_roles(user_id,role) values
 ('b1fc612e-fca5-4b23-a635-89a073100001','admin'),
 ('b1fc612e-fca5-4b23-a635-89a073100002','parent'),
 ('b1fc612e-fca5-4b23-a635-89a073100003','student'),
 ('b1fc612e-fca5-4b23-a635-89a073100004','parent'),
 ('b1fc612e-fca5-4b23-a635-89a073100005','student');
insert into public.curriculum_topics values (1,'synthetic-account-topic','Synthetic',0);
insert into public.curriculum_units values (1,'synthetic-account-topic','synthetic-account-unit','Synthetic',0);
insert into public.curriculum_subunits values (1,'synthetic-account-topic','synthetic-account-unit','synthetic-account-sub','Synthetic',0);
set local role authenticated;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100001',true);
do $$ begin
 if not public.admin_parent_link_change('b1fc612e-fca5-4b23-a635-89a073110001','b1fc612e-fca5-4b23-a635-89a073100002','b1fc612e-fca5-4b23-a635-89a073100003','establish','SYNTHETIC') then raise exception 'link A failed'; end if;
 if not public.admin_parent_link_change('b1fc612e-fca5-4b23-a635-89a073110002','b1fc612e-fca5-4b23-a635-89a073100004','b1fc612e-fca5-4b23-a635-89a073100005','establish','SYNTHETIC') then raise exception 'link B failed'; end if;
end $$;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100003',true);
insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values
 ('b1fc612e-fca5-4b23-a635-89a073100003','synthetic-A',1,'synthetic-account-topic','synthetic-account-sub','{"score":42,"answers":["private A"]}');
do $$ begin
 begin
  insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values
  ('b1fc612e-fca5-4b23-a635-89a073100005','forged',1,'synthetic-account-topic','synthetic-account-sub','{}');
  raise exception 'forged attempt accepted';
 exception when insufficient_privilege or check_violation then null;
           when raise_exception then if sqlerrm <> 'Not authorized' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100005',true);
insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values
 ('b1fc612e-fca5-4b23-a635-89a073100005','synthetic-B',1,'synthetic-account-topic','synthetic-account-sub','{"score":73,"answers":["private B"]}');
do $$ declare changed integer; begin
 if (select count(*) from public.exercise_attempts)<>1 or exists(select 1 from public.exercise_attempts where attempt_id='synthetic-A') then raise exception 'cross-student attempt leaked'; end if;
 begin
  update public.profiles set display_name='Forged' where id='b1fc612e-fca5-4b23-a635-89a073100003';
  get diagnostics changed = row_count;
  if changed<>0 then raise exception 'cross-student profile update accepted'; end if;
 exception when insufficient_privilege then null; end;
 begin
  insert into public.user_roles(user_id,role) values ('b1fc612e-fca5-4b23-a635-89a073100005','admin');
  raise exception 'role escalation accepted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100002',true);
do $$ begin
 if (select count(*) from public.parent_review_children())<>1 or not exists(select 1 from public.parent_review_children() where student_id='b1fc612e-fca5-4b23-a635-89a073100003') then raise exception 'family list incorrect'; end if;
 if (select count(*) from public.exercise_attempts)<>0 then raise exception 'parent raw attempt leaked'; end if;
 if (select score from public.parent_review_recent_attempts('b1fc612e-fca5-4b23-a635-89a073100003')) is distinct from 42 then raise exception 'linked summary incorrect'; end if;
 if exists(select 1 from public.profiles where id in ('b1fc612e-fca5-4b23-a635-89a073100003','b1fc612e-fca5-4b23-a635-89a073100005')) then raise exception 'child profile leaked'; end if;
 begin perform * from public.parent_review_recent_attempts('b1fc612e-fca5-4b23-a635-89a073100005'); raise exception 'other family summary accepted'; exception when raise_exception then if sqlerrm='other family summary accepted' then raise; end if; end;
 begin perform public.admin_parent_link_change('b1fc612e-fca5-4b23-a635-89a073110003','b1fc612e-fca5-4b23-a635-89a073100002','b1fc612e-fca5-4b23-a635-89a073100005','establish','SYNTHETIC'); raise exception 'parent mutation accepted'; exception when raise_exception then if sqlerrm='parent mutation accepted' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100001',true);
do $$ begin if not public.admin_parent_link_change('b1fc612e-fca5-4b23-a635-89a073110004','b1fc612e-fca5-4b23-a635-89a073100002','b1fc612e-fca5-4b23-a635-89a073100003','revoke','SYNTHETIC') then raise exception 'unlink failed'; end if; end $$;
select set_config('request.jwt.claim.sub','b1fc612e-fca5-4b23-a635-89a073100002',true);
do $$ begin
 if (select count(*) from public.parent_review_children())<>0 then raise exception 'revoked child visible'; end if;
 begin perform * from public.parent_review_recent_attempts('b1fc612e-fca5-4b23-a635-89a073100003'); raise exception 'revoked summary accepted'; exception when raise_exception then if sqlerrm='revoked summary accepted' then raise; end if; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform * from public.parent_review_children(); raise exception 'anonymous RPC accepted'; exception when insufficient_privilege then null; end;
 begin perform * from public.exercise_attempts; raise exception 'anonymous attempts accepted'; exception when insufficient_privilege then null; end;
end $$;
rollback;
