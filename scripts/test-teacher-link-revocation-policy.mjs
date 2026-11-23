import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql']) await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
 const [admin,t,otherTeacher,s,other,parent]=[1,2,3,4,5,6].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 const q=(sql,args=[])=>db.query(sql,args); const as=async id=>{await db.exec('reset role; set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 for(const id of [admin,t,otherTeacher,s,other,parent]) {await q('insert into auth.users values($1)',[id]);await q("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[otherTeacher,'teacher'],[s,'student'],[other,'student'],[parent,'parent']]) await q('insert into public.user_roles values($1,$2)',[id,role]);
 await q('insert into public.teacher_students values($1,$2),($1,$3),($4,$2)',[t,s,other,otherTeacher]);await q('insert into public.parent_students values($1,$2)',[parent,s]);
 const rooms=[];for(const teacher of [t,t,otherTeacher]) rooms.push((await q("insert into public.classrooms(teacher_id,name) values($1,'room') returning id",[teacher])).rows[0].id);
 await q('update public.classrooms set archived_at=clock_timestamp() where id=$1',[rooms[1]]);
 await q("insert into public.tutor_lesson_notes(student_id,author_id,note_text,visibility,published_at) values($1,$2,'existing note','parent',clock_timestamp())",[s,t]);
 await db.exec("insert into public.curriculum_topics values(1,'topic','Topic',0); insert into public.curriculum_units values(1,'topic','unit','Unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0)");
 await q("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',clock_timestamp()+interval '1 day')",[s,t]);
 await q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values($1,'attempt',1,'topic','sub','{}')",[s]);
 for(const room of rooms) await q('insert into public.classroom_students(classroom_id,student_id) values($1,$2)',[room,s]);await q('insert into public.classroom_students(classroom_id,student_id) values($1,$2)',[rooms[0],other]);
 const revoke=(teacher,student,ref='REQ-1')=>q('select * from public.admin_revoke_teacher_link($1,$2,$3)',[teacher,student,ref]);
 for(const actor of [t,s,other,parent]) {await as(actor);await assert.rejects(()=>revoke(t,s));await assert.rejects(()=>q('select * from academy_private.teacher_link_revocation_audit'));}
 await db.exec('reset role; set role anon');await assert.rejects(()=>revoke(t,s));await db.exec('reset role; set role service_role');await assert.rejects(()=>revoke(t,s));
 // An audit failure must roll back the membership cleanup and link removal.
 await db.exec("reset role; create function public.fail_audit_test() returns trigger language plpgsql as $$ begin raise exception 'test rollback'; end $$; create trigger fail_audit_test before insert on academy_private.teacher_link_revocation_audit for each row execute function public.fail_audit_test()");
 await as(admin);await assert.rejects(()=>revoke(t,s));await db.exec('reset role');assert.equal(Number((await q('select count(*) as n from public.teacher_students where teacher_id=$1 and student_id=$2',[t,s])).rows[0].n),1);assert.equal(Number((await q('select count(*) as n from public.classroom_students where student_id=$1',[s])).rows[0].n),3);await db.exec('drop trigger fail_audit_test on academy_private.teacher_link_revocation_audit; drop function public.fail_audit_test()');
 await as(admin);await assert.rejects(()=>revoke(t,s,'bad@example.com'));assert.deepEqual((await revoke(t,s)).rows[0],{link_removed:true,memberships_removed:2});assert.deepEqual((await revoke(t,s)).rows[0],{link_removed:false,memberships_removed:0});
 await as(t); assert.equal((await q('select id from public.profiles where id=$1',[s])).rows.length,0);
 assert.equal((await q('select * from public.homework_assignments where student_id=$1',[s])).rows.length,0);assert.equal((await q('select * from public.exercise_attempts where student_id=$1',[s])).rows.length,0);await assert.rejects(()=>q('select * from public.tutor_lesson_notes_list($1)',[s]));
 assert.equal((await q('select id from public.profiles where id=$1',[other])).rows.length,1);await assert.rejects(()=>q('select public.teacher_classroom_add_student($1,$2)',[rooms[0],s]));
 await as(otherTeacher);assert.equal((await q('select id from public.profiles where id=$1',[s])).rows.length,1);
 await as(parent);assert.equal((await q('select id from public.profiles where id=$1',[s])).rows.length,1);assert.equal((await q('select * from public.parent_published_lesson_notes($1)',[s])).rows.length,0);
 await db.exec('reset role');assert.equal(Number((await q('select count(*) as n from public.classroom_students where classroom_id=$1 and student_id=$2',[rooms[0],other])).rows[0].n),1);assert.equal(Number((await q('select count(*) as n from public.classroom_students where classroom_id=$1 and student_id=$2',[rooms[2],s])).rows[0].n),1);assert.equal(Number((await q('select count(*) as n from academy_private.teacher_link_revocation_audit')).rows[0].n),1);
 await as(admin);assert.equal((await q('select public.admin_establish_teacher_link($1,$2,$3) as ok',[t,s,'AUTH-NEW'])).rows[0].ok,true);
 await as(parent);assert.equal((await q('select * from public.parent_published_lesson_notes($1)',[s])).rows.length,1);
 await as(t);assert.equal((await q('select * from public.tutor_lesson_notes_list($1)',[s])).rows.length,1);assert.equal((await q('select * from public.homework_assignments where student_id=$1',[s])).rows.length,1);assert.equal((await q('select * from public.teacher_classroom_students($1)',[rooms[0]])).rows.length,1);await q('select public.teacher_classroom_add_student($1,$2)',[rooms[0],s]);assert.equal((await q('select * from public.teacher_classroom_students($1)',[rooms[0]])).rows.length,2);
 // Cleanup still works for a legacy hidden membership when a link or role is already absent.
 await db.exec('reset role');await q('delete from public.teacher_students where teacher_id=$1 and student_id=$2',[t,s]);await q("delete from public.user_roles where user_id=$1 and role='student'",[s]);await as(admin);assert.deepEqual((await revoke(t,s,'REQ-2')).rows[0],{link_removed:false,memberships_removed:1});
 console.log('Teacher link revocation local policy tests: passed.');
} finally { await db.close(); }
