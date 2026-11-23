// Synthetic local SQL + mocked Auth/limiter; not a real Supabase integration test.
import {it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {createEvidencePilotGateway,pilotDatabase} from '../server/practice-evidence-pilot-gateway';
import type {Question} from '../src/practice/types';
const student='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
const id=(n:number)=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
it('persists a synthetic server-scored session across gateway instances and isolates owners',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
  for(const f of ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'])await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
  for(const person of [student,other]){await db.query('insert into auth.users values($1)',[person]);await db.query("insert into public.profiles(id,display_name,first_name) values($1,'Synthetic','Synthetic')",[person]);await db.query("insert into public.user_roles values($1,'student')",[person]);}
  await db.exec('set role service_role');
  // This adapter emulates the expected PostgREST scalar/table envelope; real
  // API/ownership tests still require a separately approved isolated project.
  const rpc=async(name:string,args:Record<string,unknown>)=>{try{
   if(name==='evidence_pilot_start'){const r=await db.query<{v:unknown}>('select public.evidence_pilot_start($1,$2) v',[args.p_student,args.p_request]);return {data:r.rows[0].v,error:null};}
   if(name==='evidence_pilot_issue'){const r=await db.query('select * from public.evidence_pilot_issue($1,$2,$3,$4,$5,$6)',[args.p_student,args.p_session,args.p_request,args.p_prompt,args.p_options,args.p_answer]);return {data:r.rows,error:null};}
   if(name==='evidence_pilot_submit'){const r=await db.query<{v:unknown}>('select public.evidence_pilot_submit($1,$2,$3,$4) v',[args.p_student,args.p_session,args.p_question,args.p_choice]);return {data:r.rows[0].v,error:null};}
   if(name==='evidence_pilot_finish'){const r=await db.query('select * from public.evidence_pilot_finish($1,$2)',[args.p_student,args.p_session]);return {data:r.rows.map(row=>({...row,finished_at:new Date(String(row.finished_at)).toISOString()})),error:null};}
   return {data:null,error:'unknown'};
  }catch{return {data:null,error:'unavailable'};}};
  let number=0;
  const makeQuestion=():Question=>({id:'private-seed',grade:2,topicId:'t',subtopicId:'s',prompt:`Question ${++number}`,options:['yes','no'],answer:'yes',explanation:'secret',difficulty:1});
  const dependencies={...pilotDatabase({rpc}),rateKey:'x'.repeat(40),authenticate:async(token:string)=>token==='Bearer student'?{id:student}:token==='Bearer other'?{id:other}:null,trustedNetwork:async()=>'synthetic-network',consumeRate:async()=>true,makeQuestion};
  // Recreate gateway on every request: all session state lives in the database.
  const call=async(body:unknown,token='student')=>createEvidencePilotGateway(dependencies)(new Request('https://example.test/pilot',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify(body)}));
  let res=await call({op:'start',requestId:id(1)});expect(res.status).toBe(200);const {sessionId}=await res.json() as {sessionId:string};
  expect((await call({op:'finish',sessionId},'other')).status).toBe(503);
  for(let n=1;n<=10;n++){
   res=await call({op:'issue',sessionId,requestId:id(n+1)});expect(res.status).toBe(200);const row=await res.json() as {id:string;prompt:string;options:string[];answerMode:string};expect(Object.keys(row).sort()).toEqual(['answerMode','id','options','prompt']);
   expect(await (await call({op:'submit',sessionId,questionId:row.id,choice:n===1?'no':'yes'})).json()).toEqual({correct:n!==1});
  }
  const result=await (await call({op:'finish',sessionId})).json() as {sessionId:string;answered:number;correct:number;finishedAt:string};expect(result).toMatchObject({sessionId,answered:10,correct:9});expect(await (await call({op:'finish',sessionId})).json()).toEqual(result);
 }finally{await db.close();}
},30000);
