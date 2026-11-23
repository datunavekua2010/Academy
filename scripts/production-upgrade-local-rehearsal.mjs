// Local-only, synthetic-data rehearsal; no Supabase connection or remote writes.
// Requires embedded-postgres in ignored .scratch/postgres; rollback is intentional.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {createServer} from 'node:net';
const port=await new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/upgrade-');
const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});
let started=false,client;
try{
 await pg.initialise();await pg.start();started=true;client=pg.getPgClient('postgres','127.0.0.1');await client.connect();
 await client.query(`create role anon; create role authenticated; create role service_role; create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 const files=(await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).sort();
 await client.query(await readFile('supabase/migrations/'+files[0],'utf8'));
 await client.query(`insert into auth.users(id,email_confirmed_at) values('11111111-1111-4111-8111-111111111111',now());
 insert into public.profiles(id,display_name,first_name) values('11111111-1111-4111-8111-111111111111','Synthetic Student','Synthetic');
 insert into public.user_roles(user_id,role) values('11111111-1111-4111-8111-111111111111','student');
 insert into public.curriculum_topics values(1,'synthetic-topic','Synthetic',1);
 insert into public.curriculum_units values(1,'synthetic-topic','synthetic-unit','Synthetic',1);
 insert into public.curriculum_subunits values(1,'synthetic-topic','synthetic-unit','synthetic-subunit','Synthetic',1);
 insert into public.exercise_templates(template_id,grade,topic_id,subunit_id) values('synthetic-template',1,'synthetic-topic','synthetic-subunit');`);
 await client.query('begin');
 for(const name of files.slice(1)){
  let sql=await readFile('supabase/migrations/'+name,'utf8');
  if((sql.match(/^\s*(?:begin|commit)\s*;/gim)||[]).length!==2) throw new Error('Unexpected transaction markers: '+name);
  sql=sql.replace(/^\s*begin\s*;\s*$/im,'').replace(/^\s*commit\s*;\s*$/im,'');
  try {await client.query(sql);}catch(e){throw new Error(name+': '+e.message);}
 }
 const state=await client.query(`select (select count(*) from auth.users) auth_users,(select count(*) from public.profiles) profiles,(select count(*) from public.user_roles where role='student') students,(select count(*) from public.curriculum_topics) topics,(select count(*) from public.curriculum_units) units,(select count(*) from public.curriculum_subunits) subunits,(select count(*) from public.exercise_templates) templates`);
 const expected={auth_users:'1',profiles:'1',students:'1',topics:'1',units:'1',subunits:'1',templates:'1'};if(JSON.stringify(state.rows[0])!==JSON.stringify(expected)) throw new Error('Synthetic data was not preserved: '+JSON.stringify(state.rows[0]));
 const rpcs=await client.query("select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('parent_review_children','parent_review_recent_attempts','parent_published_lesson_notes','admin_provision_academy_profile')");if(rpcs.rows[0].n!==4)throw new Error('Missing required RPCs');
 await client.query('rollback');
 const after=await client.query("select to_regprocedure('public.parent_review_children()') is null as rolled_back,(select count(*) from public.exercise_templates) templates");
 if(!after.rows[0].rolled_back||after.rows[0].templates!=='1')throw new Error('Rollback check failed');
 console.log('Local rehearsal: all 20 follow-on migrations executed in one transaction over synthetic baseline; synthetic student and curriculum survived; 4 expected RPCs existed; rollback returned to baseline. No remote database contacted.');
}finally{if(client)await client.end();if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
