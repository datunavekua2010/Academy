// @vitest-environment node
// Local integration only: synthetic JWT and mocked Supabase Auth/Google network.
// Real JWT verification, hosted PostgREST, browsers, and production are not tested.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleGoogleProof, type ProofEnv } from '../server/google-proof-http-review';

it('connects the synthetic callback to actual prototype SQL policies and mixed-role access', async () => {
  const db = new PGlite();
  const user='00000000-0000-4000-8000-000000000001';
  const student='00000000-0000-4000-8000-000000000002';
  const session='00000000-0000-4000-8000-000000000003';
  const admin='00000000-0000-4000-8000-000000000004';
  const adminSession='00000000-0000-4000-8000-000000000005';
  const requestId='00000000-0000-4000-8000-000000000006';
  const origin='https://stage.example.test';
  const env: ProofEnv={GOOGLE_PROOF_REVIEW_ENABLED:'true',GOOGLE_PROOF_ALLOWED_ORIGIN:origin,GOOGLE_PROOF_CLIENT_ID:'test.apps.googleusercontent.com',GOOGLE_PROOF_CLIENT_SECRET:'synthetic-secret',GOOGLE_PROOF_SUPABASE_URL:'https://wxxgwayrieasrzngpuul.supabase.co',GOOGLE_PROOF_SUPABASE_SERVICE_KEY:'synthetic-service',GOOGLE_PROOF_RATE_KEY:'synthetic-rate-key-not-for-production-123456'};
  const enc=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const jwt=(method:string)=>`${enc({alg:'synthetic'})}.${enc({sub:user,session_id:session,amr:[{method}]})}.signature`;
  const q=(sql:string,args:unknown[] = [])=>db.query(sql,args);
  const role=async(name:string)=>db.exec(`reset role; set role ${name}`);
  const login=async(method:string, actor=user, sid=session)=>{await role('authenticated');await q("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await q("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:actor,session_id:sid,amr:[{method}]})]);};
  let expectedNonce='';
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
      create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
      create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
      create table auth.identities(user_id uuid references auth.users(id),provider text,provider_id text);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      grant usage on schema auth to authenticated,anon;grant execute on function auth.uid(),auth.jwt() to authenticated,anon;`);
    for(const file of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) await db.exec(readFileSync(`supabase/migrations/${file}`,'utf8'));
    for(const file of ['role-signin-method-candidate.sql','google-session-proof-candidate.sql','google-proof-ingress-limit-candidate.sql','google-session-enforcement-candidate.sql','student-self-enrollment-candidate.sql','parent-self-enrollment-candidate.sql','parent-link-application-candidate.sql']) await db.exec(readFileSync(`supabase/review/${file}`,'utf8'));
    await q('insert into auth.users(id) values($1),($2),($3)',[user,student,admin]);
    await q("insert into public.profiles(id,display_name,first_name) values($1,'Test','Test'),($2,'Student','Student'),($3,'Admin','Admin')",[user,student,admin]);
    await q("insert into public.user_roles(user_id,role) values($1,'teacher'),($2,'student'),($3,'admin')",[user,student,admin]);
    await q('insert into public.teacher_students(teacher_id,student_id) values($1,$2)',[user,student]);
    await q("insert into public.classrooms(teacher_id,name) values($1,'Synthetic')",[user]);
    await q('insert into auth.sessions(id,user_id) values($1,$2),($3,$4)',[session,user,adminSession,admin]);
    await q("insert into auth.identities(user_id,provider,provider_id) values($1,'google','synthetic-subject')",[user]);

    await login('oauth');
    await expect(q("select public.review_google_proof_rate_limit('account',$1)",['a'.repeat(64)])).rejects.toThrow();
    await role('service_role');
    for(let i=0;i<20;i++) expect((await q("select public.review_google_proof_rate_limit('account',$1) as allowed",['a'.repeat(64)])).rows[0].allowed).toBe(true);
    expect((await q("select public.review_google_proof_rate_limit('account',$1) as allowed",['a'.repeat(64)])).rows[0].allowed).toBe(false);
    await expect(q("select public.review_google_proof_rate_limit('invalid',$1)",['a'.repeat(64)])).rejects.toThrow();
    await login('oauth');
    await expect(q('select * from public.parent_review_children()')).rejects.toThrow();
    await expect(q('select * from public.teacher_classrooms_list()')).rejects.toThrow();

    // RPC adapter calls the real local SQL under service_role, never browser role.
    const rpc=async(name:string,args:Record<string,string>)=>{
      try {
        await role('service_role');
        if(name==='review_google_proof_begin') {
          expectedNonce=args.p_nonce;
          await q('select public.review_google_proof_begin($1,$2,$3,$4,$5,$6)',[args.p_user,args.p_session,args.p_state_hash,args.p_cookie_hash,args.p_nonce,args.p_verifier]);
          return {data:null,error:null};
        }
        if(name==='review_google_proof_rate_limit') return {data:(await q('select public.review_google_proof_rate_limit($1,$2) as allowed',[args.p_scope,args.p_key_hash])).rows[0].allowed,error:null};
        if(name==='review_google_proof_read') return {data:(await q('select * from public.review_google_proof_read($1,$2)',[args.p_state_hash,args.p_cookie_hash])).rows,error:null};
        if(name==='review_google_proof_finish') {
          await q('select public.review_google_proof_finish($1,$2,$3,$4)',[args.p_state_hash,args.p_cookie_hash,args.p_nonce,args.p_subject]);
          return {data:null,error:null};
        }
        throw Error('unexpected RPC');
      } catch { return {data:null,error:{message:'synthetic failure'}}; }
    };
    const client={auth:{getUser:async(token:string)=>token===jwt('oauth')?{data:{user:{id:user,email_confirmed_at:'2025-01-01'}},error:null}:{data:{user:null},error:{message:'invalid'}}},rpc} as unknown as SupabaseClient;
    let googleSubject='wrong-synthetic-subject';
    const pair=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
    const key={...await webcrypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key',use:'sig',alg:'RS256'};
    const fetcher=async(input:RequestInfo | URL)=>{
      if(String(input)==='https://oauth2.googleapis.com/token') {
        const now=Math.floor(Date.now()/1000);
        const unsigned=`${enc({alg:'RS256',kid:'test-key'})}.${enc({iss:'https://accounts.google.com',aud:env.GOOGLE_PROOF_CLIENT_ID,sub:googleSubject,nonce:expectedNonce,iat:now,exp:now+300})}`;
        const signature=await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(unsigned));
        return new Response(JSON.stringify({id_token:`${unsigned}.${Buffer.from(signature).toString('base64url')}`}));
      }
      if(String(input)==='https://www.googleapis.com/oauth2/v3/certs') return new Response(JSON.stringify({keys:[key]}));
      throw Error('unexpected network');
    };
    const invokeCallback=async()=>{
      const start=await handleGoogleProof(new Request(`${origin}/api/auth/google-proof/start`,{method:'POST',headers:{origin,'CF-Connecting-IP':'192.0.2.1',authorization:`Bearer ${jwt('oauth')}`}}),env,{client,fetcher});
      expect(start.status).toBe(200);
      const data=await start.json() as {authorizationUrl:string};
      const state=new URL(data.authorizationUrl).searchParams.get('state');
      const cookie=start.headers.get('set-cookie')!.split(';')[0];
      return handleGoogleProof(new Request(`${origin}/api/auth/google-proof/callback?state=${state}&code=synthetic`,{headers:{cookie,'CF-Connecting-IP':'192.0.2.1'}}),env,{client,fetcher});
    };
    const rejected=await invokeCallback();
    expect(rejected.headers.get('location')).toContain('google_proof=error');
    await login('oauth');
    expect((await q('select public.review_google_proof_status() as ok')).rows[0].ok).toBe(false);
    await expect(q('select * from public.parent_review_children()')).rejects.toThrow();
    googleSubject='synthetic-subject';
    const callback=await invokeCallback();
    expect(callback.status).toBe(303); expect(callback.headers.get('location')).toContain('google_proof=ok');

    await login('oauth');
    expect((await q('select public.review_google_proof_status() as ok')).rows[0].ok).toBe(true);
    expect((await q('select public.review_parent_self_enroll($1,$2) as result',[user,'Parent'])).rows[0].result).toBe('created');
    expect((await q('select public.review_student_self_enroll($1,$2,$3::smallint) as result',[user,'Student',3])).rows[0].result).toBe('created');
    expect((await q('select public.review_parent_link_request($1,$2,$3) as result',[requestId,user,student])).rows[0].result).toBe('received');
    expect((await q('select * from public.parent_review_children()')).rows).toHaveLength(0);
    await expect(q('select public.review_admin_parent_link_decide($1,$2,$3,$4)',[user,requestId,'approve','reviewed'])).rejects.toThrow();
    await login('password',admin,adminSession);
    expect((await q('select * from public.review_admin_parent_link_applications()')).rows).toHaveLength(1);
    expect((await q('select public.review_admin_parent_link_decide($1,$2,$3,$4) as result',[admin,requestId,'approve','reviewed'])).rows[0].result).toBe('approved');
    await login('oauth');
    expect((await q('select * from public.parent_review_children()')).rows).toHaveLength(1);
    await expect(q('select * from public.teacher_classrooms_list()')).rejects.toThrow();
    await login('password');
    await expect(q('select * from public.parent_review_children()')).rejects.toThrow();
    expect((await q('select * from public.teacher_classrooms_list()')).rows).toHaveLength(1);
    await role('postgres'); await q('delete from auth.sessions where id=$1',[session]);
    await login('oauth');
    expect((await q('select public.review_google_proof_status() as ok')).rows[0].ok).toBe(false);
    await expect(q('select * from public.parent_review_children()')).rejects.toThrow();
  } finally { await db.close(); }
},30000);
