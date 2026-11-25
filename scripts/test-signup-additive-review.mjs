// Synthetic local schema only: never connects to Supabase.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync,readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { createServer } from 'node:net';
let pg, dir, client, started=false;
let db;
if(process.env.SIGNUP_TEST_POSTGRES==='1') {
 const {default:EmbeddedPostgres}=await import('../.scratch/postgres/node_modules/embedded-postgres/dist/index.js');
 const port=await new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(e=>e?reject(e):resolve(p));});});
 dir=await mkdtemp('.scratch/postgres/signup-additive-');
 pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
 await pg.initialise();await pg.start();started=true;client=pg.getPgClient('postgres','127.0.0.1');await client.connect();
 db={exec:sql=>client.query(sql),query:(sql,args)=>client.query(sql,args)};
} else db=new PGlite();
const q=(sql,args=[])=>db.query(sql,args);
try {
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
 create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
 create table auth.identities(user_id uuid references auth.users(id),provider text,provider_id text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth to authenticated,anon;grant execute on function auth.uid(),auth.jwt() to authenticated,anon;`);
 for(const f of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(readFileSync(`supabase/migrations/${f}`,'utf8'));
 const student='00000000-0000-4000-8000-000000000001',sid='10000000-0000-4000-8000-000000000001';
 await q('insert into auth.users(id) values($1)',[student]);await q('insert into auth.sessions(id,user_id) values($1,$2)',[sid,student]);
 await q("insert into public.profiles(id,display_name,first_name) values($1,'Existing','Existing')",[student]);
 await q("insert into public.user_roles(user_id,role) values($1,'student')",[student]);
 await q('insert into public.student_grades(student_id,grade) values($1,3)',[student]);
 const before=(await q("select pg_get_functiondef('academy_private.has_role(text)'::regprocedure) as def")).rows[0].def;
 const policies=Number((await q("select count(*) n from pg_policies where schemaname='public'")).rows[0].n);
 const migration=readFileSync('supabase/review/release/202612120001_signup_additive.sql','utf8');
 const probe=readFileSync('supabase/review/release/signup_staging_rollback_probe.sql','utf8');
 await db.exec(probe);
 assert.equal((await q("select to_regclass('academy_private.signup_release_control') as value")).rows[0].value,null);
 assert.equal((await q("select to_regprocedure('academy_private.role_session_method_allows(text)') as value")).rows[0].value,null);
 assert.equal((await q("select pg_get_functiondef('academy_private.has_role(text)'::regprocedure) as def")).rows[0].def,before);
 // A collision part way through must roll back earlier tables and functions.
 await db.exec('create table academy_private.google_session_proofs (sentinel text)');
 await assert.rejects(()=>db.exec(migration)); await db.exec('rollback');
 assert.equal((await q("select to_regclass('academy_private.signup_release_control') as value")).rows[0].value,null);
 assert.equal((await q("select to_regprocedure('academy_private.role_session_method_allows(text)') as value")).rows[0].value,null);
 assert.notEqual((await q("select to_regclass('academy_private.google_session_proofs') as value")).rows[0].value,null);
 await db.exec('drop table academy_private.google_session_proofs');
 await db.exec(migration);
 assert.equal((await q("select pg_get_functiondef('academy_private.has_role(text)'::regprocedure) as def")).rows[0].def,before);
 assert.equal(Number((await q("select count(*) n from pg_policies where schemaname='public'")).rows[0].n),policies);
 assert.equal((await q('select display_name from public.profiles where id=$1',[student])).rows[0].display_name,'Existing');
 assert.equal((await q('select grade from public.student_grades where student_id=$1',[student])).rows[0].grade,3);
 assert.equal((await q('select count(*)::int n from academy_private.signup_release_control where enabled')).rows[0].n,0);
 await db.exec('set role authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[student]);
 await q("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({session_id:sid,amr:[{method:'oauth'}]})]);
 assert.equal((await q("select academy_private.has_role('student') as ok")).rows[0].ok,true);
 assert.equal((await q('select public.review_google_proof_status() as ok')).rows[0].ok,false);
 await assert.rejects(()=>q('select public.review_student_self_enroll($1,$2,3::smallint)',[student,'Test']),/Unavailable/);
 await assert.rejects(()=>q('select public.review_parent_self_enroll($1,$2)',[student,'Test']),/Unavailable/);
 await assert.rejects(()=>q('select public.review_parent_link_my_requests()'),/Unavailable/);
 await assert.rejects(()=>q("update academy_private.signup_release_control set enabled=true"),/permission denied/);
 await assert.rejects(()=>q('select academy_private.signup_cleanup_expired(500)'),/permission denied/);
 await db.exec('reset role; set role service_role');
 await assert.rejects(()=>q("select public.review_google_proof_rate_limit('network',$1)",['a'.repeat(64)]),/Unavailable/);
 await assert.rejects(()=>q('select public.review_google_proof_begin($1,$2,$3,$4,$5,$6)',[student,sid,'a'.repeat(64),'b'.repeat(64),'N'.repeat(43),'V'.repeat(43)]),/Unavailable/);
 await assert.rejects(()=>q('select academy_private.signup_cleanup_expired(500)'),/permission denied/);
 await db.exec('reset role');
 // Even if an operator opens the application gate without installing global
 // enforcement, parent-facing application RPCs must independently need proof.
 await q("update academy_private.signup_release_control set enabled=true where gate in ('parent_link','proof')");
 await q("insert into public.user_roles(user_id,role) values($1,'parent')",[student]);
 await db.exec('set role authenticated');
 await assert.rejects(()=>q('select public.review_parent_link_my_requests()'),/Unavailable/);
 await db.exec('reset role');
 // Simulate the operator's authorization readiness approval. This does not
 // install or verify method enforcement; it is only a test of gate behavior.
 await q("update academy_private.signup_release_control set enabled=true where gate='authorization'");
 await db.exec('set role authenticated');
 await assert.rejects(()=>q('select public.review_parent_link_my_requests()'),/Request unavailable/);
 await assert.rejects(()=>q('select public.review_parent_link_request($1,$2,$3)',[sid,student,'00000000-0000-4000-8000-000000000002']),/Request unavailable/);
 await db.exec('reset role');
 // Bounded, non-browser cleanup deletes only expired ephemeral records.
 await q("insert into academy_private.google_session_proofs values($1,$2,'subject',now()-interval '1 hour')",[sid,student]);
 await q("insert into academy_private.google_proof_ingress_limits values('network',$1,now()-interval '2 days',1),('account',$2,now(),1)",['a'.repeat(64),'b'.repeat(64)]);
 const cleanup=(await q('select * from academy_private.signup_cleanup_expired(1)')).rows[0];
 assert.deepEqual(Object.fromEntries(Object.entries(cleanup).map(([key,value])=>[key,Number(value)])),{challenges:0,proofs:1,rate_limits:1});
 assert.equal((await q('select count(*)::int n from academy_private.google_proof_ingress_limits')).rows[0].n,1);
 await assert.rejects(()=>q('select * from academy_private.signup_cleanup_expired(5001)'),/Invalid batch/);
 // Duplicate install must fail rather than silently adopting unknown objects.
 await assert.rejects(()=>db.exec(readFileSync('supabase/review/release/202612120001_signup_additive.sql','utf8')));
 await db.exec('rollback');
 console.log('Gated additive signup migration: pre-existing data/policies preserved, gates and cleanup verified locally.');
} finally {
 if(client)await client.end().catch(()=>{});
 if(started)await pg.stop();
 if(dir)await rm(dir,{recursive:true,force:true});
 if(!pg)await db.close();
}
