import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['20261120154717_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql']) await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
 const [admin,t,t2,s,s2,parent]=[1,2,3,4,5,6].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 const q=(s,a=[])=>db.query(s,a),as=async id=>{await db.exec('reset role;set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 for(const id of [admin,t,t2,s,s2,parent]){await q('insert into auth.users values($1)',[id]);await q("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[t2,'teacher'],[s,'student'],[s2,'student'],[parent,'parent']])await q('insert into public.user_roles values($1,$2)',[id,role]);
 await q('insert into public.teacher_students values($1,$2),($1,$3),($4,$2)',[t,s,s2,t2]);
 await db.exec("insert into public.curriculum_topics values(1,'topic','Topic',0); insert into public.curriculum_units values(1,'topic','unit','Unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0)");
 const insert=(student,teacher)=>q("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',clock_timestamp()+interval '1 day') returning id",[student,teacher]);
 const note=(student)=>q("select * from public.tutor_lesson_note_save($1,null,'note','parent',null)",[student]);
 await as(t);const assignment=(await insert(s,t)).rows[0].id;const n=(await note(s)).rows[0];
 await assert.rejects(()=>q('update public.homework_assignments set student_id=$1 where id=$2',[s2,assignment]));
 await assert.rejects(()=>q('update public.homework_assignments set assigned_by=$1 where id=$2',[t2,assignment]));
 assert.equal((await q("update public.homework_assignments set due_at=due_at+interval '1 hour' where id=$1 returning id",[assignment])).rows.length,1);
 await assert.rejects(()=>q('select academy_private.lock_authorized_teacher_pair($1,$2)',[t,s]));
 await as(t2);assert.equal((await q('update public.homework_assignments set due_at=due_at where id=$1 returning id',[assignment])).rows.length,0);await assert.rejects(()=>q("select * from public.tutor_lesson_note_save($1,$2,'attack','parent',$3)",[s,n.id,n.revision]));
 for(const actor of [s,parent]){await as(actor);await assert.rejects(()=>insert(s,t));await assert.rejects(()=>note(s));}
 await db.exec('reset role;set role service_role');await q("select set_config('request.jwt.claim.sub','',false)");await assert.rejects(()=>insert(s,t));
 await as(admin);await q('select * from public.admin_revoke_teacher_link($1,$2,$3)',[t,s,'REQ-1']);
 await as(t);await assert.rejects(()=>insert(s,t));await assert.rejects(()=>note(s));assert.equal((await q('delete from public.homework_assignments where id=$1 returning id',[assignment])).rows.length,0);
 await as(admin);await q('select public.admin_establish_teacher_link($1,$2,$3)',[t,s,'AUTH-1']);
 await db.exec('reset role');await q("delete from public.user_roles where user_id=$1 and role='student'",[s]);
 await as(t);await assert.rejects(()=>insert(s,t));await assert.rejects(()=>note(s));await assert.rejects(()=>q("update public.homework_assignments set due_at=due_at+interval '1 hour' where id=$1",[assignment]));
 console.log('Teacher write-lock local policy tests: passed.');
} finally {await db.close();}
