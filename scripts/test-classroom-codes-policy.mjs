import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of (process.env.ROLE_LIFECYCLE_REVIEW === '1' ? ['20261120154717_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'] : ['20261120154717_initial_academy.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql'])) await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8'));
 const [t,other,s1,s2,s3,outsider]=[1,2,3,4,5,6].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [t,other,s1,s2,s3,outsider]) {await db.query('insert into auth.users values($1)',[id]); await db.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[t,'teacher'],[other,'teacher'],[s1,'student'],[s2,'student'],[s3,'student'],[outsider,'student']]) await db.query('insert into public.user_roles values($1,$2)',[id,role]);
 await db.query('insert into public.teacher_students values($1,$2),($1,$3),($1,$4)',[t,s1,s2,s3]);
 const q=(s,a=[])=>db.query(s,a); const as=async id=>{await db.exec('reset role; set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 await as(t); const room=(await q("select public.teacher_classroom_save(null,'Room',1::smallint,'',null) as id")).rows[0].id;
 const d1='a'.repeat(64),d2='b'.repeat(64),d3='c'.repeat(64);
 const issue=(actor,rev,digest,cap=1,date='9998-01-01')=>q('select public.classroom_code_issue($1,$2,$3,$4::date,$5,$6) as ok',[actor,room,rev,date,cap,digest]);
 const redeem=(actor,digest)=>q('select public.classroom_code_redeem($1,$2) as ok',[actor,digest]);
 const revoke=actor=>q('select public.classroom_code_revoke($1,$2)',[actor,room]);
 await assert.rejects(()=>issue(t,1,d1)); await assert.rejects(()=>redeem(s1,d1)); await assert.rejects(()=>q('select * from academy_private.classroom_invites'));
 await db.exec('reset role; set role anon'); await assert.rejects(()=>redeem(s1,d1));
 await db.exec('reset role; set role service_role');
 await assert.rejects(()=>issue(other,1,d1)); await assert.rejects(()=>issue(t,1,d1,0)); await assert.rejects(()=>issue(t,1,d1,1,'2015-01-01'));
 assert.equal((await issue(t,1,d1)).rows[0].ok,true); await assert.rejects(()=>issue(t,1,d2));
 await as(t); const status=(await q('select * from public.teacher_classroom_code_status($1)',[room])).rows[0]; assert.equal(status.capacity,1); assert.ok(status.code_expires_at); await as(other); await assert.rejects(()=>q('select * from public.teacher_classroom_code_status($1)',[room]));
 await db.exec('reset role; set role service_role'); assert.equal((await redeem(outsider,d1)).rows[0].ok,false); assert.equal((await redeem(s1,d1)).rows[0].ok,true); assert.equal((await redeem(s1,d1)).rows[0].ok,true); assert.equal((await redeem(s2,d1)).rows[0].ok,false);
 await db.exec('reset role'); assert.equal(Number((await q('select count(*) as n from academy_private.classroom_invite_redemptions')).rows[0].n),1);
 await as(t); await q('select public.teacher_classroom_remove_student($1,$2)',[room,s1]);
 await db.exec('reset role; set role service_role'); assert.equal((await redeem(s2,d1)).rows[0].ok,true); assert.equal((await issue(t,2,d2,2)).rows[0].ok,true); assert.equal((await redeem(s1,d1)).rows[0].ok,false); assert.equal((await redeem(s1,d2)).rows[0].ok,true); await assert.rejects(()=>revoke(other)); await revoke(t); assert.equal((await redeem(s3,d2)).rows[0].ok,false);
 await db.exec('reset role'); const relations=(await q('select count(*) as n from public.teacher_students')).rows[0].n; assert.equal(Number(relations),3);
 await db.exec('set role service_role'); assert.equal((await issue(t,3,d3,2)).rows[0].ok,true);
 await db.exec('reset role'); await q("update academy_private.classroom_invites set expires_at=clock_timestamp()-interval '1 second',created_at=clock_timestamp()-interval '2 days' where code_digest=$1",[d3]);
 await db.exec('set role service_role'); assert.equal((await redeem(s2,d3)).rows[0].ok,false);
 await as(t); await q('select public.teacher_classroom_archive($1,$2)',[room,4]);
 await db.exec('reset role; set role service_role'); await assert.rejects(()=>issue(t,5,'d'.repeat(64))); assert.equal((await redeem(s1,d3)).rows[0].ok,false);
 console.log('Classroom code local policy tests: passed.');
} finally {await db.close();}
