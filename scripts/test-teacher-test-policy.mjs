import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
for(const f of (process.env.ROLE_LIFECYCLE_REVIEW === '1' ? ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'] : ['202611200001_initial_academy.sql','202611240001_teacher_tests_review.sql'])) await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
const [teacher,other,student,parent]=[1,2,3,4].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
for (const [id,role] of [[teacher,'teacher'],[other,'teacher'],[student,'student'],[parent,'parent']]) { await db.query('insert into auth.users values($1)',[id]); await db.query('insert into public.profiles(id,display_name,first_name) values($1,$2,$2)',[id,'სახელი']); await db.query('insert into public.user_roles values($1,$2)',[id,role]); }
await db.exec("insert into public.curriculum_topics values(1,'topic','topic',0); insert into public.curriculum_units values(1,'topic','unit','unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','sub',0); insert into public.exercise_templates(template_id,grade,topic_id,subunit_id) values('template',1,'topic','sub');");
const as=async(id)=>{await db.exec('reset role; set role authenticated'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
const save=(id,rev,content)=>db.query('select * from public.teacher_test_save($1,$2,$3)',[id,rev,JSON.stringify(content)]);
const list=()=>db.query('select * from public.teacher_tests_list()');
const del=(id,rev)=>db.query('select public.teacher_test_delete($1,$2)',[id,rev]);
const q={id:'template~2',templateId:'template',seed:2,grade:1,topicId:'topic',subtopicId:'sub',prompt:'2 + 2 = ?',answer:'4',options:['3','4','5','6']};
const section={id:'section-1',grade:1,topicId:'topic',unitId:'unit',subtopicId:'sub',templateId:'template',quantity:2};
const content={title:'ტესტი',instructions:'',grade:null,minutes:null,nameField:true,dateField:true,branding:true,questions:[{question:q,points:2}],sections:[section]};
await as(teacher); await assert.rejects(()=>db.query('select * from public.teacher_tests'));
await assert.rejects(()=>save(null,null,{...content,questions:[{question:q,points:0}]}));
await assert.rejects(()=>save(null,null,{...content,questions:[{question:{...q,templateId:'unknown'},points:2}]}));
await assert.rejects(()=>save(null,null,{...content,defaultPoints:0}));
await assert.rejects(()=>save(null,null,{...content,sections:[{...section,quantity:0}]}));
await assert.rejects(()=>save(null,null,{...content,sections:[{...section,quantity:1.5}]}));
await assert.rejects(()=>save(null,null,{...content,sections:[{...section,templateId:'unknown'}]}));
await assert.rejects(()=>save(null,null,{...content,sections:[section,section]}));
await assert.rejects(()=>save(null,null,{...content,sections:[{...section,quantity:100},{...section,id:'two',quantity:1}]}));
const row=(await save(null,null,content)).rows[0]; assert.equal(row.content.questions[0].question.answer,'4'); assert.deepEqual(row.content.sections,[section]);
assert.equal((await list()).rows.length,1);
// Old drafts without section metadata remain valid and readable.
const legacy = {...content}; delete legacy.sections;
const oldRow=(await save(null,null,legacy)).rows[0]; assert.equal(oldRow.content.questions[0].question.answer,'4'); await del(oldRow.id,1);
await as(other); assert.equal((await list()).rows.length,0); await assert.rejects(()=>save(row.id,1,content)); await assert.rejects(()=>del(row.id,1));
for(const id of [student,parent]) { await as(id); await assert.rejects(()=>list()); await assert.rejects(()=>save(null,null,content)); await assert.rejects(()=>del(row.id,1)); }
await as(teacher); const updated=(await save(row.id,1,{...content,title:'ახალი'})).rows[0]; assert.equal(updated.revision,2); await assert.rejects(()=>save(row.id,1,content)); await assert.rejects(()=>del(row.id,1));
await del(row.id,2); assert.equal((await list()).rows.length,0);
await db.exec('reset role; set role anon'); await assert.rejects(()=>list());
await db.close(); console.log('Teacher test database authorization tests: passed.');
