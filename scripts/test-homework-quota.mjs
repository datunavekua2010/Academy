// Local-only synthetic quota tests; never connects to a Supabase project.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  for (const f of (process.env.ROLE_LIFECYCLE_REVIEW === '1' ? ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'] : ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql'])) await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
  const [t,t2,s]=[1,2,3].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
  const q=(sql,args=[])=>db.query(sql,args);
  const as=async id=>{await db.exec('reset role;set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
  for(const id of [t,t2,s]){await q('insert into auth.users values($1)',[id]);await q("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
  for(const [id,role] of [[t,'teacher'],[t2,'teacher'],[s,'student']])await q('insert into public.user_roles values($1,$2)',[id,role]);
  await q('insert into public.teacher_students values($1,$2)',[t,s]);
  await db.exec("insert into public.curriculum_topics values(1,'topic','Topic',0);insert into public.curriculum_units values(1,'topic','unit','Unit',0);insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0),(1,'topic','unit','empty','Empty',1);insert into public.exercise_templates(template_id,grade,topic_id,subunit_id) values('template',1,'topic','sub')");
  const id=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
  const ref={grade:1,topicId:'topic',subtopicId:'sub'};
  const create=(n,refs=[ref])=>q("select public.teacher_homework_create($1,$2,'Title','', '9998-01-01T00:00:00Z',$3::jsonb) as ids",[id(n),s,JSON.stringify(refs)]);
  const resolve=n=>q('select public.teacher_homework_resolve($1) as state',[id(n)]);
  const rateError=e=>e.code==='54000';
  await as(t);
  await assert.rejects(()=>q('select * from academy_private.homework_request_quotas'));
  await assert.rejects(()=>q('select academy_private.reserve_homework_request_slot($1)',[t]));
  // A late failure after the first assignment insert rolls back both rows and quota.
  await assert.rejects(()=>create(1,[ref,{...ref,subtopicId:'empty'}]));
  await db.exec('reset role');assert.equal((await q('select * from academy_private.homework_request_quotas')).rows.length,0);assert.equal((await q('select * from public.homework_assignments')).rows.length,0);
  await as(t);const first=(await create(1)).rows[0].ids;assert.deepEqual((await create(1)).rows[0].ids,first);
  for(let n=2;n<=30;n++) assert.equal((await resolve(n)).rows[0].state,'abandoned');
  // Both mutation paths share one quota; retries of recorded keys remain available.
  await assert.rejects(()=>create(31),rateError);await assert.rejects(()=>resolve(31),rateError);
  assert.equal((await resolve(2)).rows[0].state,'abandoned');assert.equal((await resolve(1)).rows[0].state,'published');assert.deepEqual((await create(1)).rows[0].ids,first);
  await db.exec('reset role');let quota=(await q('select * from academy_private.homework_request_quotas where teacher_id=$1',[t])).rows[0];assert.equal(quota.window_count,30);assert.equal(quota.lifetime_count,30);assert.equal((await q('select count(*)::int as n from public.homework_assignments')).rows[0].n,1);assert.equal((await q('select count(*)::int as n from academy_private.homework_requests where teacher_id=$1',[t])).rows[0].n,30);
  // Expire only the synthetic test window; lifetime usage is not reset.
  await q("update academy_private.homework_request_quotas set window_started_at=clock_timestamp()-interval '11 minutes' where teacher_id=$1",[t]);await as(t);assert.equal((await resolve(31)).rows[0].state,'abandoned');
  await db.exec('reset role');quota=(await q('select * from academy_private.homework_request_quotas where teacher_id=$1',[t])).rows[0];assert.equal(quota.window_count,1);assert.equal(quota.lifetime_count,31);
  // Synthetic lifetime ceiling: existing keys still resolve even when no new key can be fenced.
  await q('update academy_private.homework_request_quotas set lifetime_count=10000 where teacher_id=$1',[t]);await as(t);await assert.rejects(()=>resolve(32),rateError);await assert.rejects(()=>create(32),rateError);assert.equal((await resolve(31)).rows[0].state,'abandoned');assert.deepEqual((await create(1)).rows[0].ids,first);
  // Other teachers have independent counters and cannot access or reset anyone's quota.
  await as(t2);assert.equal((await resolve(32)).rows[0].state,'abandoned');await assert.rejects(()=>q('update academy_private.homework_request_quotas set lifetime_count=0 where teacher_id=$1',[t]));
  await as(s);await assert.rejects(()=>resolve(40));
  await db.exec('reset role;set role service_role');await assert.rejects(()=>q('select * from academy_private.homework_request_quotas'));
  console.log('Homework request quota local policy and rollback tests: passed.');
} finally {await db.close();}
