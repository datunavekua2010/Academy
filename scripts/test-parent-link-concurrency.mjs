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
 for(const c of [a,b]){await c.query('set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);}
 const wait=async c=>{for(let i=0;i<150;i++){if((await m.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('No lock wait');};
 const link=c=>c.query("select public.admin_establish_parent_link($1,$2,'AUTH') as ok",[parent,student]);
 const unlink=c=>c.query("select public.admin_revoke_parent_link($1,$2,'UNLINK') as ok",[parent,student]);
 const suspend=(c,id,role)=>c.query("select public.admin_revoke_academy_role($1,$2,'SUSPEND') as ok",[id,role]);
 const count=async()=>Number((await m.query('select count(*) n from public.parent_students where parent_id=$1 and student_id=$2',[parent,student])).rows[0].n);
 const grant=(id,role)=>m.query('insert into public.user_roles values($1,$2)',[id,role]);
 // Creation before removal: removal blocks, then removes the just-created link.
 await a.query('begin');assert.equal((await link(a)).rows[0].ok,true);const after=unlink(b);await wait(b);await a.query('commit');assert.equal((await after).rows[0].ok,true);assert.equal(await count(),0);
 // Removal before a new explicitly authorized creation: new creation blocks and wins after commit.
 await link(a);await a.query('begin');assert.equal((await unlink(a)).rows[0].ok,true);const relink=link(b);await wait(b);await a.query('commit');assert.equal((await relink).rows[0].ok,true);assert.equal(await count(),1);
 // Duplicate establishment is serialized and only one audit event is added.
 await unlink(a);const before=(await m.query('select count(*) n from academy_private.parent_link_establishment_audit')).rows[0].n;
 await a.query('begin');await link(a);const duplicate=link(b);await wait(b);await a.query('commit');assert.equal((await duplicate).rows[0].ok,false);assert.equal(Number((await m.query('select count(*) n from academy_private.parent_link_establishment_audit')).rows[0].n)-Number(before),1);
 // Snapshot taken before an unlink cannot re-establish that link afterward.
 await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.parent_students');await unlink(a);
 await assert.rejects(()=>link(b),e=>e.code==='40001');await b.query('rollback');assert.equal(await count(),0);
 // Likewise, an old absent-link snapshot cannot silently miss a newer link.
 await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.parent_students');await link(a);
 await assert.rejects(()=>unlink(b),e=>e.code==='40001');await b.query('rollback');assert.equal(await count(),1);
 // Each participant role deletion serializes against successful establishment.
 for(const [id,role] of [[parent,'parent'],[student,'student']]){
  await unlink(a);await a.query('begin');await link(a);const pending=suspend(b,id,role);await wait(b);await a.query('commit');assert.equal((await pending).rows[0].ok,true);assert.equal(await count(),1);
  await unlink(a);await grant(id,role);
  await a.query('begin');await suspend(a,id,role);const denied=link(b).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await denied,true);assert.equal(await count(),0);await grant(id,role);
 }
 console.log('Parent-link pair, stale snapshot and role suspension races: passed on local PostgreSQL.');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
