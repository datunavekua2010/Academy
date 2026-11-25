// Local-only separate-connection PostgreSQL races. Never connects to a hosted DB.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/role-choice-');
const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
const clients=[]; let started=false;
try {
 await pg.initialise();await pg.start();started=true;
 for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,m]=clients;
 await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
 create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
 create table auth.identities(user_id uuid references auth.users(id),provider text,provider_id text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth to authenticated,anon;grant execute on function auth.uid(),auth.jwt() to authenticated,anon;`);
 for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await a.query(await readFile(`supabase/migrations/${f}`,'utf8'));
 await a.query(await readFile('supabase/review/email-role-self-enrollment-candidate.sql','utf8'));
 const user='00000000-0000-4000-8000-000000000001',sid='10000000-0000-4000-8000-000000000001';
 await a.query('insert into auth.users(id) values($1)',[user]);await a.query('insert into auth.sessions(id,user_id) values($1,$2)',[sid,user]);
 const actor=async c=>{await c.query('set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await c.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({session_id:sid,amr:[{method:'password'}]})]);};
 const wait=async c=>{for(let i=0;i<150;i++){if((await m.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('Expected lock wait');};
 const choose=(c,role)=>c.query('select public.choose_email_role($1,$2) as result',[user,role]);
 await actor(a);await actor(b);
 // A double click must serialize and create exactly one role.
 await a.query('begin');assert.equal((await choose(a,'student')).rows[0].result,'created');
 const duplicate=choose(b,'student');await wait(b);await a.query('commit');assert.equal((await duplicate).rows[0].result,'already_enrolled');
 assert.equal(Number((await m.query("select count(*) n from public.user_roles where user_id=$1 and role='student'",[user])).rows[0].n),1);
 // A revocation in progress wins against a later self-service request.
 await m.query('begin');await m.query("delete from public.user_roles where user_id=$1 and role='student'",[user]);
 const retry=choose(b,'student').then(()=>false,()=>true);await wait(b);await m.query('commit');assert.equal(await retry,true);
 assert.equal(Number((await m.query("select count(*) n from public.user_roles where user_id=$1 and role='student'",[user])).rows[0].n),0);
 console.log('Email role duplicate and revoke races passed on local PostgreSQL.');
} finally {for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
