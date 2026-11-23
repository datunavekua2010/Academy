import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['20261120154717_initial_academy.sql','202611230001_classrooms_review.sql','202611280001_admin_teacher_links_review.sql']) await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
 const [admin,teacher,student,other,missing]=[1,2,3,4,5].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,teacher,student,other,missing]) {await db.query('insert into auth.users values($1)',[id]); await db.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[teacher,'teacher'],[student,'student'],[other,'student']]) await db.query('insert into public.user_roles values($1,$2)',[id,role]);
 const q=(s,a=[])=>db.query(s,a); const as=async id=>{await db.exec('reset role; set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const link=(t,s,ref='AUTH-42')=>q('select public.admin_establish_teacher_link($1,$2,$3) as created',[t,s,ref]);
 for(const user of [teacher,student,other,missing]) {await as(user);await assert.rejects(()=>link(teacher,student)); await assert.rejects(()=>q('select * from academy_private.teacher_link_audit')); await assert.rejects(()=>q('insert into public.teacher_students values($1,$2)',[teacher,student]));}
 await db.exec('reset role; set role anon'); await assert.rejects(()=>link(teacher,student));
 await as(teacher); assert.equal((await q('select id from public.profiles where id=$1',[student])).rows.length,0);
 await as(admin); await assert.rejects(()=>link(missing,student));await assert.rejects(()=>link(teacher,missing));await assert.rejects(()=>link(teacher,teacher));await assert.rejects(()=>link(teacher,student,'')); await assert.rejects(()=>link(teacher,student,'email@example.com'));
 assert.equal((await link(teacher,student)).rows[0].created,true);assert.equal((await link(teacher,student,'AUTH-42')).rows[0].created,false);
 await as(teacher); assert.equal((await q('select id from public.profiles where id=$1',[student])).rows.length,1); assert.equal((await q('select id from public.profiles where id=$1',[other])).rows.length,0);
 await db.exec('reset role'); assert.equal(Number((await q('select count(*) as n from academy_private.teacher_link_audit')).rows[0].n),1);
 const room=(await q("insert into public.classrooms(teacher_id,name) values($1,'Room') returning id",[teacher])).rows[0].id;
 await q('insert into public.classroom_students(classroom_id,student_id) values($1,$2)',[room,student]);
 await q('delete from public.teacher_students where teacher_id=$1 and student_id=$2',[teacher,student]);
 await as(admin);await assert.rejects(()=>link(teacher,student));
 await db.exec('reset role');await q('delete from public.classroom_students where classroom_id=$1 and student_id=$2',[room,student]);
 await as(admin);assert.equal((await link(teacher,student,'AUTH-43')).rows[0].created,true);
 await db.exec('reset role');assert.equal(Number((await q('select count(*) as n from academy_private.teacher_link_audit')).rows[0].n),2);
 await q("delete from public.user_roles where user_id=$1 and role='admin'",[admin]);await as(admin);await assert.rejects(()=>link(teacher,other));
 console.log('Teacher link local policy tests: passed.');
} finally { await db.close(); }
