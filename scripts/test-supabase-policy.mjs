import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users (id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$; grant usage on schema auth to authenticated, anon; grant execute on function auth.uid() to authenticated, anon;`);
await db.exec(fs.readFileSync('supabase/migrations/20261120154717_initial_academy.sql','utf8'));
await db.exec(fs.readFileSync('supabase/curriculum-seed.sql','utf8'));
const counts = await db.query('select (select count(*) from public.curriculum_subunits) as subunits, (select count(*) from public.exercise_templates) as templates');
assert.ok(counts.rows[0].subunits > 0 && counts.rows[0].templates > 0);
const student='00000000-0000-4000-8000-000000000001', other='00000000-0000-4000-8000-000000000002', teacher='00000000-0000-4000-8000-000000000003', parent='00000000-0000-4000-8000-000000000004', stranger='00000000-0000-4000-8000-000000000005';
const teacher2='00000000-0000-4000-8000-000000000006';
const users=[student,other,teacher,parent,stranger,teacher2];
for(const u of users) { await db.query('insert into auth.users(id) values ($1)',[u]); await db.query('insert into public.profiles(id,display_name,first_name) values ($1,$2,$2)',[u,u]); }
for(const [u,role] of [[student,'student'],[other,'student'],[teacher,'teacher'],[parent,'parent'],[stranger,'parent'],[teacher2,'teacher']]) await db.query('insert into public.user_roles(user_id,role) values ($1,$2)',[u,role]);
await db.query('insert into public.teacher_students(teacher_id,student_id) values($1,$2)',[teacher,student]); await db.query('insert into public.teacher_students(teacher_id,student_id) values($1,$2)',[teacher2,student]); await db.query('insert into public.parent_students(parent_id,student_id) values($1,$2)',[parent,student]);
await db.exec("insert into public.curriculum_topics values(1,'topic','topic',0); insert into public.curriculum_units values(1,'topic','unit','unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','sub',0); insert into public.curriculum_subunits values(1,'topic','unit','sub2','sub2',1);");
const assign='10000000-0000-4000-8000-000000000001';
await db.query("insert into public.homework_assignments(id,student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,$3,1,'topic','sub',now()+interval '1 day')",[assign,student,teacher]);
async function as(u){ await db.exec('reset role; set role authenticated'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[u]); }
async function denied(q,p=[]){try{await db.query(q,p); throw new Error('operation unexpectedly succeeded');}catch(e){if(e.message==='operation unexpectedly succeeded') throw e;}}
await as(student); assert.equal((await db.query('select * from public.profiles')).rows.length,1); assert.equal((await db.query('select * from public.homework_assignments')).rows.length,1);
await denied("insert into public.user_roles values($1,'teacher')",[student]); await denied('update public.student_grades set grade=7'); await denied("insert into public.earned_rewards values($1,'anything',now())",[student]);
await db.query("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,assignment_id,result) values ($1,'a',1,'topic','sub',$2,'{}')",[student,assign]);
await denied("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values ($1,'b',1,'topic','sub','{}')",[other]);
await denied("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,assignment_id,result) values ($1,'bad-ref',1,'topic','sub2',$2,'{}')",[student,assign]);
await denied("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result,created_at) values ($1,'time',1,'topic','sub','{}',now())",[student]);
await as(other); assert.equal((await db.query('select * from public.homework_assignments')).rows.length,0); assert.equal((await db.query('select * from public.exercise_attempts')).rows.length,0);
await denied("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,assignment_id,result) values ($1,'b',1,'topic','sub',$2,'{}')",[other,assign]);
await as(teacher); assert.equal((await db.query('select * from public.exercise_attempts')).rows.length,1); await denied("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',now()+interval '1 day')",[other,teacher]);
// A different teacher may view their linked student's work, but cannot alter another teacher's assignment.
await as(teacher2);
assert.equal((await db.query('select * from public.homework_assignments where id=$1',[assign])).rows.length,1);
assert.equal((await db.query("update public.homework_assignments set due_at=now()+interval '2 days' where id=$1 returning id",[assign])).rows.length,0);
assert.equal((await db.query('delete from public.homework_assignments where id=$1 returning id',[assign])).rows.length,0);
await denied("insert into public.user_roles values($1,'admin')",[teacher2]);
await denied('insert into public.teacher_students(teacher_id,student_id) values($1,$2)',[teacher2,other]);
// An assigning teacher cannot retarget to a student outside their authorised roster.
await as(teacher);
await denied('update public.homework_assignments set student_id=$1 where id=$2',[other,assign]);
await as(parent); assert.equal((await db.query('select * from public.exercise_attempts')).rows.length,1); await denied("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',now()+interval '1 day')",[student,parent]);
await as(stranger); assert.equal((await db.query('select * from public.exercise_attempts')).rows.length,0);
await db.exec('reset role; set role anon'); await denied('select * from public.profiles');
console.log('Local PostgreSQL-compatible policy smoke test: passed.'); await db.close();
