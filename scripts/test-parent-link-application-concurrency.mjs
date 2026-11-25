// Separate-connection races on ephemeral local PostgreSQL, never remote Supabase.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {createServer} from 'node:net';import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/parent-link-');const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});let started=false;const clients=[];
try {
 await pg.initialise();await pg.start();started=true;for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,m]=clients;await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['20261120154717_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql']) await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [admin,parent,student]=[1,2,3].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,parent,student]){await a.query('insert into auth.users values($1)',[id]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[parent,'parent'],[student,'student']])await a.query('insert into public.user_roles values($1,$2)',[id,role]);

 await a.query("create function academy_private.review_google_proof_current() returns boolean language sql as $$select true$$");
 await a.query(await readFile('supabase/review/parent-link-application-candidate.sql','utf8'));
 const request='20000000-0000-4000-8000-000000000001';
 const wait=async c=>{for(let i=0;i<150;i++){if((await m.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('No lock wait');};
 const actor=async(c,id)=>{await c.query('set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 await actor(a,parent);await actor(b,parent);
 const submit=c=>c.query('select public.review_parent_link_request($1,$2,$3) as result',[request,parent,student]);
 await a.query('begin');await submit(a);const dupe=submit(b);await wait(b);await a.query('commit');assert.equal((await dupe).rows[0].result,'received');
 assert.equal(Number((await m.query('select count(*) n from academy_private.parent_link_applications')).rows[0].n),1);
 // Cancellation holds the application row; a concurrent approval cannot restore it.
 await a.query('begin');await a.query('select public.review_parent_link_cancel($1,$2)',[parent,request]);await actor(b,admin);
 const approval=b.query("select public.review_admin_parent_link_decide($1,$2,'approve','REF')",[admin,request]).then(()=>false,()=>true);
 await wait(b);await a.query('commit');assert.equal(await approval,true);
 assert.equal(Number((await m.query('select count(*) n from public.parent_students')).rows[0].n),0);
 // In the reverse order, approval wins and cancellation reports false.
 const next='20000000-0000-4000-8000-000000000002';await a.query('select public.review_parent_link_request($1,$2,$3)',[next,parent,student]);
 await b.query('begin');await b.query("select public.review_admin_parent_link_decide($1,$2,'approve','REF')",[admin,next]);
 const cancellation=a.query('select public.review_parent_link_cancel($1,$2) as result',[parent,next]);await wait(a);await b.query('commit');assert.equal((await cancellation).rows[0].result,false);
 assert.equal(Number((await m.query('select count(*) n from public.parent_students')).rows[0].n),1);
 console.log('Parent application duplicate, cancellation and approval races passed on local PostgreSQL (membership auth simulated).');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
