// Forced races in ephemeral local PostgreSQL, never remote Supabase.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {createServer} from 'node:net';import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/provision-');const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});let started=false;const clients=[];
try{
 await pg.initialise();await pg.start();started=true;for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,m]=clients;await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'])await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [admin,s1,s2,s3,s4,s5]=[1,2,3,4,5,6].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,s1,s2,s3,s4,s5])await a.query('insert into auth.users values($1)',[id]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'Admin','Admin')",[admin]);await a.query("insert into public.user_roles values($1,'admin')",[admin]);
 for(const c of [a,b]){await c.query('set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);}
 const wait=async c=>{for(let i=0;i<150;i++){if((await m.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('No lock wait');};
 const request=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 const provision=(c,n,target,display='Name')=>c.query("select public.admin_provision_academy_profile($1,$2,'student',$3,'First',2::smallint,'AUTH') as id",[request(n),target,display]);
 // Identical retries wait, then return the same ID and create one record.
 await a.query('begin');assert.equal((await provision(a,1,s1)).rows[0].id,s1);const same=provision(b,1,s1);await wait(b);await a.query('commit');assert.equal((await same).rows[0].id,s1);
 assert.equal(Number((await m.query('select count(*) n from academy_private.profile_provision_audit')).rows[0].n),1);
 // Same key but changed payload must not count as success.
 await a.query('begin');await provision(a,2,s2);const conflict=provision(b,2,s2,'Different').then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await conflict,true);
 // Different keys for the same target cannot overwrite the created profile.
 await a.query('begin');await provision(a,3,s3);const otherKey=provision(b,4,s3).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await otherKey,true);
 // Stale REPEATABLE READ must not acknowledge or overwrite an invisible newer record.
 await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.profiles');await provision(a,5,s4);
 await assert.rejects(()=>provision(b,5,s4),e=>e.code==='40001' || e.code==='23505');await b.query('rollback');
 // Admin role removal waits for an accepted provision. A later call then fails.
 await a.query('begin');assert.equal((await provision(a,1,s1)).rows[0].id,s1);const removeAdmin=m.query("delete from public.user_roles where user_id=$1 and role='admin'",[admin]);
 // monitor cannot inspect itself while busy; connection b monitors as owner.
 await b.query('reset role');
 for(let i=0;i<150;i++){const state=await b.query('select wait_event_type from pg_stat_activity where pid=$1',[m.processID]);if(state.rows[0]?.wait_event_type==='Lock')break;if(i===149)throw new Error('No admin role lock wait');await new Promise(r=>setTimeout(r,20));}
 await a.query('commit');await removeAdmin;await assert.rejects(()=>provision(a,1,s1));
 // Conversely an admin deletion that wins prevents a new profile from being created.
 await m.query("insert into public.user_roles values($1,'admin')",[admin]);await m.query('begin');await m.query("delete from public.user_roles where user_id=$1 and role='admin'",[admin]);
 const denied=provision(a,6,s5).then(()=>false,()=>true);await wait(a);await m.query('commit');assert.equal(await denied,true);
 assert.equal(Number((await m.query('select count(*) n from public.profiles where id=$1',[s5])).rows[0].n),0);
 assert.equal(Number((await m.query('select count(*) n from academy_private.profile_provision_audit')).rows[0].n),4);
 console.log('Profile provision duplicate, stale-snapshot and admin-role races: passed on local PostgreSQL.');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
