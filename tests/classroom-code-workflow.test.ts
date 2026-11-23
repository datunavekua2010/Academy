import { expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { codeDigest, createClassroomAdminGateway, type AdminDeps } from '../server/classroom-code-admin';
import { createClassroomCodeGateway, databaseRateLimiter } from '../server/classroom-code-gateway';

it('issues and redeems a reusable code through the protected gateway and local database', async () => {
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  for(const f of ['20261120154717_initial_academy.sql','202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql']) await db.exec(readFileSync(`supabase/migrations/${f}`,'utf8'));
  const [teacher,s1,s2,unlinked,admin] = [1,2,3,4,5].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
  for(const id of [teacher,s1,s2,unlinked,admin]) {await db.query('insert into auth.users values($1)',[id]);await db.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
  for(const [id,role] of [[teacher,'teacher'],[s1,'student'],[s2,'student'],[unlinked,'student'],[admin,'admin']]) await db.query('insert into public.user_roles values($1,$2)',[id,role]);
  await db.exec('set role authenticated'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);
  await db.query('select public.admin_establish_teacher_link($1,$2,$3)',[teacher,s1,'AUTH-1']);
  await db.query('select public.admin_establish_teacher_link($1,$2,$3)',[teacher,s2,'AUTH-2']); await db.exec('reset role');
  const room=(await db.query<{id:string}>("insert into public.classrooms(teacher_id,name) values($1,'Room') returning id",[teacher])).rows[0].id;
  await db.exec('set role service_role');
  const rpc=async (name:string,args:Record<string,string>) => {const r=await db.query<{allowed:boolean}>(`select public.${name}($1,$2) as allowed`,[args.p_account_hash,args.p_network_hash]); return {data:r.rows[0].allowed,error:null};};
  const common={rateKey:'x'.repeat(40),authenticate:async (auth:string)=>({id:auth.slice(7)}),trustedNetwork:async()=> 'test-network',consumeRate:databaseRateLimiter({rpc})};
  const deps:AdminDeps={...common, issue:async x=>(await db.query<{ok:boolean}>('select public.classroom_code_issue($1,$2,$3,$4::date,$5,$6) as ok',[x.actor,x.classroomId,x.revision,x.expiresOn,x.capacity,x.digest])).rows[0].ok, revoke:async (actor,id)=>(await db.query<{ok:boolean}>('select public.classroom_code_revoke($1,$2) as ok',[actor,id])).rows[0].ok};
  const req=(actor:string,body:unknown)=>new Request('https://example.test/api',{method:'POST',headers:{authorization:`Bearer ${actor}`},body:JSON.stringify(body)});
  const issue=await createClassroomAdminGateway(deps,'issue')(req(teacher,{classroomId:room,revision:1,expiresOn:'9998-01-01',capacity:1}));
  expect(issue.status).toBe(200); const {code}=await issue.json() as {code:string};
  const gateway=createClassroomCodeGateway({...common,redeem:async(actor,raw)=>(await db.query<{ok:boolean}>('select public.classroom_code_redeem($1,$2) as ok',[actor,await codeDigest(raw)])).rows[0].ok});
  expect((await gateway(req(unlinked,{code}))).status).toBe(400);
  expect((await gateway(req(s1,{code}))).status).toBe(200);
  expect((await gateway(req(s1,{code}))).status).toBe(200);
  expect((await gateway(req(s2,{code}))).status).toBe(400);
  await db.exec('reset role; set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);
  expect((await db.query<{link_removed:boolean,memberships_removed:number}>('select * from public.admin_revoke_teacher_link($1,$2,$3)',[teacher,s1,'REQ-1'])).rows[0]).toEqual({link_removed:true,memberships_removed:1});
  await db.exec('reset role; set role service_role'); expect((await gateway(req(s1,{code}))).status).toBe(400); expect((await gateway(req(s2,{code}))).status).toBe(200);
  expect((await createClassroomAdminGateway(deps,'revoke')(req(teacher,{classroomId:room}))).status).toBe(200);
  expect((await gateway(req(s1,{code}))).status).toBe(400);
  await db.exec('reset role'); expect(Number((await db.query<{n:number}>('select count(*) as n from public.teacher_students')).rows[0].n)).toBe(1);
 } finally {await db.close();}
},30000);
