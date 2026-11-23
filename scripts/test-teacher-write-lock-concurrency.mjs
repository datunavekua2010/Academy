// Isolated local Postgres. See docs/account-and-linking-review.md for setup.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {createServer} from 'node:net';
import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/write-cluster-');
const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
let started=false;const clients=[];
try {
 await pg.initialise();await pg.start();started=true;
 for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,monitor]=clients;
 await a.query(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['20261120154717_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql']) await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [admin,t,s,s2]=[1,2,3,4].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,t,s,s2]){await a.query('insert into auth.users values($1)',[id]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[s,'student'],[s2,'student']]) await a.query('insert into public.user_roles values($1,$2)',[id,role]);
 await a.query("insert into public.curriculum_topics values(1,'topic','Topic',0); insert into public.curriculum_units values(1,'topic','unit','Unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0)");
 await a.query('insert into public.teacher_students values($1,$2),($1,$3)',[t,s,s2]);
 const actor=async(c,id)=>{await c.query('reset role; set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const establish=async c=>{await actor(c,admin);await c.query('select public.admin_establish_teacher_link($1,$2,$3)',[t,s,'AUTH-1']);};
 const revoke=c=>c.query('select * from public.admin_revoke_teacher_link($1,$2,$3)',[t,s,'REQ-1']);
 const waitBlocked=async c=>{for(let i=0;i<100;i++){const state=await monitor.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID]);if(state.rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('Expected transaction to wait on a lock');};
 // Create each fixture before the test; revocation intentionally retains history.
 const note=async c=>(await c.query("select * from public.tutor_lesson_note_save($1,null,'original','parent',null)",[s])).rows[0];
 const assignment=async c=>(await c.query("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',clock_timestamp()+interval '1 day') returning id",[s,t])).rows[0].id;
 const cases=[
  {name:'note-create',prepare:async()=>null,write:(c)=>c.query("select * from public.tutor_lesson_note_save($1,null,'new','tutor',null)",[s])},
  {name:'note-edit',prepare:note,write:(c,n)=>c.query("select * from public.tutor_lesson_note_save($1,$2,'changed','parent',$3)",[s,n.id,n.revision])},
  {name:'note-publish',prepare:note,write:(c,n)=>c.query('select * from public.tutor_lesson_note_set_publication($1,$2,true,$3)',[s,n.id,n.revision])},
  {name:'note-delete',prepare:note,write:(c,n)=>c.query('select public.tutor_lesson_note_delete($1,$2,$3)',[s,n.id,n.revision])},
  {name:'assignment-create',prepare:async()=>null,write:(c)=>assignment(c)},
  {name:'assignment-update',prepare:assignment,write:(c,id)=>c.query("update public.homework_assignments set due_at=due_at+interval '1 hour' where id=$1 returning id",[id])},
  {name:'assignment-delete',prepare:assignment,write:(c,id)=>c.query('delete from public.homework_assignments where id=$1 returning id',[id])},
 ];
 for(const test of cases){
  // A teacher mutation that owns the pair lock must finish before revoke can commit.
  await establish(a);await actor(a,t);const fixture=await test.prepare(a);await a.query('begin');await test.write(a,fixture);await actor(b,admin);const revokeAfter=revoke(b);await waitBlocked(b);await a.query('commit');assert.equal((await revokeAfter).rows[0].link_removed,true,test.name+' write-first');
  // The same write begun during revocation must not succeed on the old snapshot.
  await establish(a);await actor(a,t);const fixture2=await test.prepare(a);await actor(a,admin);await a.query('begin');await revoke(a);await actor(b,t);
  const blockedWrite=test.write(b,fixture2).then(result=>({ok:true,result}),error=>({ok:false,error}));await waitBlocked(b);await a.query('commit');const after=await blockedWrite;
  // RLS may return zero affected rows, or the post-lock recheck may raise.
  assert.ok(!after.ok || (after.result && 'rowCount' in after.result && after.result.rowCount===0),test.name+' revoke-first must not mutate');
 }
 // Repeatable-read transactions with an old snapshot must fail, rather than
 // relying on a stale link observed before the committed revocation.
 for(const test of [cases[1],cases[4]]) {
  await establish(a);await actor(a,t);const fixture=await test.prepare(a);
  await a.query('begin isolation level repeatable read');await a.query('select count(*) from public.teacher_students');
  await actor(b,admin);assert.equal((await revoke(b)).rows[0].link_removed,true);
  await assert.rejects(()=>test.write(a,fixture),undefined,test.name+' stale snapshot');await a.query('rollback');
 }
 // Role and identity checks, including administrative direct writes, are enforced.
 await establish(a);await actor(a,t);const id=await assignment(a);
 await assert.rejects(()=>a.query('update public.homework_assignments set student_id=$1 where id=$2',[s2,id]));
 await assert.rejects(()=>a.query('update public.homework_assignments set assigned_by=$1 where id=$2',[admin,id]));
 await a.query('reset role');await a.query("select set_config('request.jwt.claim.sub','',false)");
 await assert.rejects(()=>a.query("insert into public.homework_assignments(student_id,assigned_by,grade,topic_id,subunit_id,due_at) values($1,$2,1,'topic','sub',clock_timestamp()+interval '1 day')",[s,t]));
 console.log('Teacher assignment and note races: passed on local PostgreSQL with separate connections.');
} finally {for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
