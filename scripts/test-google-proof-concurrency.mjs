// Synthetic local PostgreSQL races only; requires .scratch/postgres test dependency.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {createServer} from 'node:net';
import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/google-proof-');
const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
const clients=[];let started=false;
try {
  await pg.initialise();await pg.start();started=true;
  for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
  const [a,b,m]=clients;
  await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;create schema academy_private;
    grant usage on schema academy_private to authenticated;
    create table auth.users(id uuid primary key);create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create table auth.identities(user_id uuid references auth.users(id),provider text,provider_id text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create function academy_private.role_session_method_allows(text) returns boolean language sql stable as $$select true$$;`);
  await a.query(await readFile('supabase/review/google-session-proof-candidate.sql','utf8'));
  const user='00000000-0000-4000-8000-000000000001', session='00000000-0000-4000-8000-000000000002';
  const cookie='b'.repeat(64),nonce='N'.repeat(43),verifier='V'.repeat(43), hash=n=>n.repeat(64);
  await a.query('insert into auth.users values($1);',[user]);
  await a.query('insert into auth.sessions values($1,$2,null)',[session,user]);
  await a.query("insert into auth.identities values($1,'google','subject')",[user]);
  const begin=(c,state)=>c.query('select public.review_google_proof_begin($1,$2,$3,$4,$5,$6)',[user,session,state,cookie,nonce,verifier]);
  const finish=(c,state)=>c.query('select public.review_google_proof_finish($1,$2,$3,$4)',[state,cookie,nonce,'subject']);
  const wait=async c=>{for(let i=0;i<150;i++){if((await m.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw Error('No lock wait');};
  await a.query('set role service_role');await b.query('set role service_role');
  await begin(a,hash('a'));await a.query('begin');await finish(a,hash('a'));
  const duplicate=finish(b,hash('a')).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await duplicate,true);
  assert.equal(Number((await m.query('select count(*) as n from academy_private.google_session_proofs')).rows[0].n),1);
  // A session deletion before finish commits first and invalidates its challenge.
  await begin(a,hash('c'));await m.query('begin');await m.query('delete from auth.sessions where id=$1',[session]);
  const afterLogout=finish(a,hash('c')).then(()=>false,()=>true);await wait(a);await m.query('commit');assert.equal(await afterLogout,true);
  assert.equal(Number((await m.query('select count(*) as n from academy_private.google_session_proofs')).rows[0].n),0);
  // Concurrent unfinished starts cannot both pass the last per-session slot.
  await m.query('insert into auth.sessions values($1,$2,null)',[session,user]);
  await begin(a,hash('a'));
  await m.query('update academy_private.google_proof_challenges set start_count=4 where session_id=$1',[session]);
  await a.query('begin');await begin(a,hash('d'));
  const overLimit=begin(b,hash('e')).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await overLimit,true);
  assert.equal((await m.query('select start_count from academy_private.google_proof_challenges where session_id=$1',[session])).rows[0].start_count,5);
  console.log('Local PostgreSQL proof replay, sign-out and unfinished-start limit races passed.');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
