import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 const names=(process.env.ROLE_LIFECYCLE_REVIEW === '1' ? ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'] : ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql']);
 for(const f of names) await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
 const [admin,t,t2,s,s2,parent]=[1,2,3,4,5,6].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 const q=(sql,args=[])=>db.query(sql,args); const as=async(id)=>{await db.exec('reset role;set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 for(const id of [admin,t,t2,s,s2,parent]){await q('insert into auth.users values($1)',[id]);await q("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[t2,'teacher'],[s,'student'],[s2,'student'],[parent,'parent']]) await q('insert into public.user_roles values($1,$2)',[id,role]);
 await q('insert into public.teacher_students values($1,$2),($3,$2)',[t,s,t2]);await q('insert into public.parent_students values($1,$2)',[parent,s]);
 await db.exec("insert into public.curriculum_topics values(1,'topic','Topic',0); insert into public.curriculum_units values(1,'topic','unit','Unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub1','Sub 1',0),(1,'topic','unit','sub2','Sub 2',1),(1,'topic','unit','sub3','Sub 3',2); insert into public.exercise_templates(template_id,grade,topic_id,subunit_id) values('template1',1,'topic','sub1'),('template2',1,'topic','sub2')");
 const refs=[{grade:1,topicId:'topic',subtopicId:'sub1'},{grade:1,topicId:'topic',subtopicId:'sub2'}];
 const request='10000000-0000-4000-8000-000000000001', r2='10000000-0000-4000-8000-000000000002';
 const create=(id=request,student=s,subtopics=refs,title='Title',due='9998-01-01T00:00:00Z')=>q('select public.teacher_homework_create($1,$2,$3,$4,$5,$6::jsonb) as ids',[id,student,title,'Instructions',due,JSON.stringify(subtopics)]);
 const resolve=id=>q('select public.teacher_homework_resolve($1) as state',[id]);
 const cancel=(id,revision=1)=>q('select public.teacher_homework_cancel($1,$2) as ok',[id,revision]);
 await as(t);await assert.rejects(()=>create(r2,s2));await assert.rejects(()=>create(r2,s,[...refs,refs[0]]));await assert.rejects(()=>create(r2,s,[...refs,{grade:1,topicId:'topic',subtopicId:'sub3'}]));await assert.rejects(()=>create(r2,s,refs,'Title','2015-01-01T00:00:00Z'));
 assert.equal((await q('select * from public.homework_assignments')).rows.length,0);
 const ids=(await create()).rows[0].ids;assert.equal(ids.length,2);assert.deepEqual((await create()).rows[0].ids,ids);assert.deepEqual((await create(request,s,refs,'Title','9998-01-01T04:00:00+04:00')).rows[0].ids,ids);await assert.rejects(()=>create(request,s,refs,'other'));assert.equal((await resolve(request)).rows[0].state,'published');
 assert.equal((await resolve(r2)).rows[0].state,'abandoned');assert.equal((await resolve(r2)).rows[0].state,'abandoned');await assert.rejects(()=>create(r2));
 await assert.rejects(()=>q("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub1',now()+interval '1 day')",[s,t]));
 await assert.rejects(()=>q('update public.homework_assignments set title=$1 where id=$2',['changed',ids[0]]));await assert.rejects(()=>q('delete from public.homework_assignments where id=$1',[ids[0]]));await assert.rejects(()=>q('select * from academy_private.homework_requests'));
 await assert.rejects(()=>cancel(ids[0],2));
 await as(t2);await assert.rejects(()=>cancel(ids[0]));assert.equal((await resolve(request)).rows[0].state,'abandoned'); // A different teacher cannot observe or fence the first teacher's request.
 await as(t);assert.equal((await resolve(request)).rows[0].state,'published');
 await as(s); assert.equal((await q('select * from public.homework_assignments')).rows.length,2);await assert.rejects(()=>cancel(ids[0]));await assert.rejects(()=>create(r2));await assert.rejects(()=>resolve(request));
 await as(s2);assert.equal((await q('select * from public.homework_assignments')).rows.length,0);await assert.rejects(()=>create(r2));
 await as(parent);assert.equal((await q('select * from public.homework_assignments')).rows.length,process.env.ROLE_LIFECYCLE_REVIEW === '1' ? 0 : 2);await assert.rejects(()=>cancel(ids[0]));
 await as(t);assert.equal((await cancel(ids[0])).rows[0].ok,true);assert.equal((await cancel(ids[0])).rows[0].ok,true);assert.equal((await q('select * from public.homework_assignments')).rows.length,2);
 await as(s);assert.equal((await q('select * from public.homework_assignments')).rows.length,1);
 await q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,assignment_id,result) values($1,'late',1,'topic','sub1',$2,'{}')",[s,ids[0]]);
 await assert.rejects(()=>q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,assignment_id,result) values($1,'wrong',1,'topic','sub2',$2,'{}')",[s,ids[0]]));
 await as(parent);assert.equal((await q('select * from public.homework_assignments')).rows.length,process.env.ROLE_LIFECYCLE_REVIEW === '1' ? 0 : 1);
 await as(t2);assert.equal((await q('select * from public.homework_assignments')).rows.length,1);
 await as(admin);await q('select public.admin_revoke_teacher_link($1,$2,$3)',[t,s,'REQ-1']);
 await as(t);assert.equal((await q('select * from public.homework_assignments')).rows.length,0);assert.equal((await resolve(request)).rows[0].state,'published');await assert.rejects(()=>create());await assert.rejects(()=>cancel(ids[1]));
 await as(s);assert.equal((await q('select * from public.homework_assignments')).rows.length,1);assert.equal((await q('select * from public.exercise_attempts')).rows.length,1);
 await db.exec('reset role');assert.equal(Number((await q('select count(*) as n from academy_private.homework_requests')).rows[0].n),3);
 const ledger=(await q('select * from academy_private.homework_requests where teacher_id=$1 and request_id=$2',[t,request])).rows[0];assert.equal(ledger.payload,undefined);assert.equal(ledger.payload_digest.length,32);assert.ok(!JSON.stringify(ledger).includes('Instructions'));
 await db.exec('set role anon');await assert.rejects(()=>create());await assert.rejects(()=>resolve(request));await assert.rejects(()=>q('select * from public.homework_assignments'));
 console.log('Homework local policy and lifecycle tests: passed.');
} finally {await db.close();}
