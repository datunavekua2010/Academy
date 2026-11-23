// Forced interleavings on ephemeral local PostgreSQL, never Supabase.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {createServer} from 'node:net';import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/evidence-');const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});let started=false;const clients=[];
try{
 await pg.initialise();await pg.start();started=true;for(let i=0;i<4;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,m,monitor]=clients;await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'])await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [student,admin]=[1,2].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`),id=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 for(const x of [student,admin]){await a.query('insert into auth.users values($1)',[x]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'Name','Name')",[x]);}await a.query("insert into public.user_roles values($1,'student'),($2,'admin')",[student,admin]);
 for(const c of [a,b])await c.query('set role service_role');await m.query('set role authenticated');await m.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);
 const start=async(c,n)=>(await c.query('select public.evidence_pilot_start($1,$2) as id',[student,id(n)])).rows[0].id;
 const issue=async(c,s,n)=>(await c.query("select * from public.evidence_pilot_issue($1,$2,$3,$4,array['yes','no'],'yes')",[student,s,id(n+100),`Question ${n}`])).rows[0];
 const submit=(c,s,q,choice)=>c.query('select public.evidence_pilot_submit($1,$2,$3,$4) as correct',[student,s,q,choice]);
 const finish=c=>c.query('select * from public.evidence_pilot_finish($1,$2)',[student,s]);
 const wait=async(c)=>{for(let i=0;i<150;i++){const row=await monitor.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID]);if(row.rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('No lock wait');};
 await a.query('begin');const s=await start(a,1);const same=start(b,1);await wait(b);await a.query('commit');assert.equal(await same,s);
 await a.query('begin');const first=await issue(a,s,1);const duplicate=issue(b,s,1);await wait(b);await a.query('commit');assert.deepEqual(await duplicate,first);
 await a.query('begin');await submit(a,s,first.question_id,'yes');const conflict=submit(b,s,first.question_id,'no').then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await conflict,true);
 for(let i=2;i<=10;i++){const question=await issue(a,s,i);await submit(a,s,question.question_id,'yes');}
 await a.query('begin');const done=(await finish(a)).rows[0];const retry=finish(b);await wait(b);await a.query('commit');assert.deepEqual((await retry).rows[0],done);
 // Transactions with stale snapshots cannot process evidence or bypass capacity.
 await b.query('begin isolation level repeatable read');await assert.rejects(()=>start(b,2));await b.query('rollback');
 // Role suspension waits for an already-accepted operation, then later calls fail.
 await a.query('begin');await start(a,2);const remove=m.query("select public.admin_revoke_academy_role($1,'student','suspend')",[student]);await wait(m);await a.query('commit');await remove;await assert.rejects(()=>start(b,3));
 await m.query('reset role');assert.equal(Number((await m.query('select count(*) n from academy_private.evidence_pilot_sessions where student_id=$1',[student])).rows[0].n),2);
 console.log('Evidence pilot retry, answer, finish, isolation and role races: passed on local PostgreSQL.');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
