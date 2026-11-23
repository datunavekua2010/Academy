// Optional local PostgreSQL multi-connection test. Install the isolated dependency
// with: npm install --prefix .scratch/postgres embedded-postgres@18.7.0-beta.19
// This NEVER connects to Supabase or uses project data.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
const port = await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(err=>err?reject(err):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/cluster-');
const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
let started=false; const clients=[];
try {
 await pg.initialise();await pg.start();started=true;
 for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,monitor]=clients;
 await a.query(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['20261120154717_initial_academy.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql']) await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [admin,t,s,s2]=[1,2,3,4].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,t,s,s2]){await a.query('insert into auth.users values($1)',[id]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[s,'student'],[s2,'student']])await a.query('insert into public.user_roles values($1,$2)',[id,role]);
 await a.query('insert into public.teacher_students values($1,$2),($1,$3)',[t,s,s2]);
 const room=(await a.query("insert into public.classrooms(teacher_id,name,capacity) values($1,'room',1) returning id",[t])).rows[0].id;
 const digest='a'.repeat(64);
 await a.query("insert into academy_private.classroom_invites(classroom_id,code_digest,expires_at) values($1,$2,clock_timestamp()+interval '1 day')",[room,digest]);
 const actor=async(c,id)=>{await c.query('reset role; set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const service=async(c)=>{await c.query('reset role; set role service_role');};
 const revoke=c=>c.query('select * from public.admin_revoke_teacher_link($1,$2,$3)',[t,s,'REQ-1']);
 const redeem=(c,student=s)=>c.query('select public.classroom_code_redeem($1,$2) as ok',[student,digest]);
 const establish=c=>c.query('select public.admin_establish_teacher_link($1,$2,$3) as ok',[t,s,'AUTH-1']);
 const waitBlocked=async c=>{for(let i=0;i<100;i++){const state=await monitor.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID]);if(state.rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('Expected the other connection to block on a lock');};
 // A redemption starts before revocation: revocation waits, then cleans the committed membership.
 await service(a);await actor(b,admin);await a.query('begin');assert.equal((await redeem(a)).rows[0].ok,true);const r1=revoke(b);await waitBlocked(b);await a.query('commit');assert.deepEqual((await r1).rows[0],{link_removed:true,memberships_removed:1});
 assert.equal(Number((await monitor.query('select count(*) as n from public.classroom_students where student_id=$1',[s])).rows[0].n),0);
 // Revocation starts first: redemption must wait, then cannot join with a stale link.
 await actor(a,admin);await establish(a);await a.query('begin');await revoke(a);await service(b);const r2=redeem(b);await waitBlocked(b);await a.query('commit');assert.equal((await r2).rows[0].ok,false);
 // Establishment waits behind revoke and is a separate explicit reauthorization;
 // no prior class membership is restored.
 await actor(a,admin);await establish(a);await a.query('begin');await revoke(a);await actor(b,admin);const r3=establish(b);await waitBlocked(b);await a.query('commit');assert.equal((await r3).rows[0].ok,true);
 assert.equal(Number((await monitor.query('select count(*) as n from public.classroom_students where student_id=$1',[s])).rows[0].n),0);
 // Direct addition racing revocation uses the same pair lock.
 await actor(a,t);await a.query('begin');await a.query('select public.teacher_classroom_add_student($1,$2)',[room,s]);await actor(b,admin);const r4=revoke(b);await waitBlocked(b);await a.query('commit');assert.equal((await r4).rows[0].memberships_removed,1);
 // The reverse ordering: revocation waits for explicit establishment.
 await actor(a,admin);await a.query('begin');await establish(a);await actor(b,admin);const r6=revoke(b);await waitBlocked(b);await a.query('commit');assert.equal((await r6).rows[0].link_removed,true);
 // Direct add also fails when revocation takes the pair lock first.
 await establish(a);await a.query('begin');await revoke(a);await actor(b,t);
 const r7=b.query('select public.teacher_classroom_add_student($1,$2)',[room,s]).then(()=>false,()=>true);
 await waitBlocked(b);await a.query('commit');assert.equal(await r7,true);
 // Different students compete for the final slot: class row lock prevents overfill.
 await actor(a,admin);await establish(a);await service(a);await service(b);await a.query('begin');assert.equal((await redeem(a,s)).rows[0].ok,true);const r5=redeem(b,s2);await waitBlocked(b);await a.query('commit');assert.equal((await r5).rows[0].ok,false);
 assert.equal(Number((await monitor.query('select count(*) as n from public.classroom_students where classroom_id=$1',[room])).rows[0].n),1);
 // An old transaction must not silently undo a newer revoke or overlook a new link.
 await actor(a,admin);await actor(b,admin);
 await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.teacher_students');await revoke(a);
 await assert.rejects(()=>establish(b),e=>e.code==='40001');await b.query('rollback');
 await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.teacher_students');await establish(a);
 await assert.rejects(()=>revoke(b),e=>e.code==='40001');await b.query('rollback');
 console.log('Teacher link and classroom races: passed on local PostgreSQL with separate connections.');
} finally {for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
