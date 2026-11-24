// @vitest-environment node
import { beforeAll, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleGoogleProof, type ProofEnv } from '../server/google-proof-http-review';
const origin='https://stage.example.test';
const user='00000000-0000-4000-8000-000000000001', sid='00000000-0000-4000-8000-000000000002';
const env: ProofEnv={GOOGLE_PROOF_REVIEW_ENABLED:'true',GOOGLE_PROOF_ALLOWED_ORIGIN:origin,GOOGLE_PROOF_CLIENT_ID:'test.apps.googleusercontent.com',GOOGLE_PROOF_CLIENT_SECRET:'secret-example',GOOGLE_PROOF_SUPABASE_URL:'https://wxxgwayrieasrzngpuul.supabase.co',GOOGLE_PROOF_SUPABASE_SERVICE_KEY:'service-example'};
const enc=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
const sessionJwt=(method='oauth',sub=user)=>`${enc({alg:'test'})}.${enc({sub,session_id:sid,amr:[{method}]})}.signature`;
let privateKey: CryptoKey, key: JsonWebKey;
beforeAll(async()=>{
  const pair=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  privateKey=pair.privateKey as CryptoKey;
  key={...await webcrypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key',use:'sig',alg:'RS256'} as JsonWebKey;
});
function mocks() {
  let row:Record<string,string>|undefined;
  const getUser=vi.fn(async()=>({data:{user:{id:user,email_confirmed_at:'2025-01-01'}},error:null}));
  const rpc=vi.fn(async(name:string,args:Record<string,string>)=>{
    if(name==='review_google_proof_begin'){row=args;return {data:null,error:null};}
    if(name==='review_google_proof_read') return {data:row && args.p_state_hash===row.p_state_hash && args.p_cookie_hash===row.p_cookie_hash ? [{nonce:row.p_nonce,code_verifier:row.p_verifier}] : [],error:null};
    if(name==='review_google_proof_finish') {
      if(!row || args.p_state_hash!==row.p_state_hash || args.p_cookie_hash!==row.p_cookie_hash || args.p_nonce!==row.p_nonce || args.p_subject!=='approved-subject')return {data:null,error:{message:'no'}};
      row=undefined;return {data:null,error:null};
    }
    throw Error('unexpected RPC');
  });
  const fetcher=vi.fn(async(input:RequestInfo|URL)=>{
    if(String(input)==='https://oauth2.googleapis.com/token'){
      const now=Math.floor(Date.now()/1000);
      const jwt=`${enc({alg:'RS256',kid:'test-key'})}.${enc({iss:'https://accounts.google.com',aud:env.GOOGLE_PROOF_CLIENT_ID,sub:'approved-subject',nonce:row?.p_nonce,iat:now,exp:now+300})}`;
      const sig=await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(jwt));
      return new Response(JSON.stringify({id_token:`${jwt}.${Buffer.from(sig).toString('base64url')}`}));
    }
    if(String(input)==='https://www.googleapis.com/oauth2/v3/certs')return new Response(JSON.stringify({keys:[key]}));
    throw Error('unexpected destination');
  }) as unknown as typeof fetch;
  const client={auth:{getUser},rpc} as unknown as SupabaseClient;
  return {client,getUser,rpc,fetcher};
}
const request=(method:string,path:string,headers:Record<string,string>={})=>new Request(origin+path,{method,headers});
it('starts only after server Auth verification, then finishes a CSRF-bound callback without exposing secrets',async()=>{
  const deps=mocks();
  const start=await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin,authorization:`Bearer ${sessionJwt()}`}),env,deps);
  expect(start.status).toBe(200);
  const json=await start.json() as {authorizationUrl:string};
  const cookie=start.headers.get('set-cookie')!;
  expect(cookie).toContain('Secure; HttpOnly; SameSite=Lax');
  expect(json.authorizationUrl).not.toContain('secret-example');
  expect(deps.getUser).toHaveBeenCalledWith(sessionJwt());
  const state=new URL(json.authorizationUrl).searchParams.get('state')!;
  const wrong=await handleGoogleProof(request('GET',`/api/auth/google-proof/callback?state=${state}&code=code`,{cookie:'__Host-axiom-google-proof='+ 'B'.repeat(43)}),env,deps);
  expect(wrong.headers.get('location')).toContain('google_proof=error');
  const complete=await handleGoogleProof(request('GET',`/api/auth/google-proof/callback?state=${state}&code=code`,{cookie:cookie.split(';')[0]}),env,deps);
  expect(complete.status).toBe(303);
  expect(complete.headers.get('location')).toContain('google_proof=ok');
  expect(complete.headers.get('location')).not.toContain('code');
  expect(complete.headers.get('set-cookie')).toContain('Max-Age=0');
  const replay=await handleGoogleProof(request('GET',`/api/auth/google-proof/callback?state=${state}&code=code`,{cookie:cookie.split(';')[0]}),env,deps);
  expect(replay.headers.get('location')).toContain('google_proof=error');
});
it('fails closed for wrong origin, unavailable config, password sessions and mismatched identities',async()=>{
  const deps=mocks();
  expect((await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin:'https://evil.test',authorization:`Bearer ${sessionJwt()}`}),env,deps)).status).toBe(403);
  expect((await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin,authorization:`Bearer ${sessionJwt()}`}),{...env,GOOGLE_PROOF_REVIEW_ENABLED:'false'},deps)).status).toBe(503);
  expect((await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin,authorization:`Bearer ${sessionJwt('password')}`}),env,deps)).status).toBe(403);
  expect((await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin,authorization:`Bearer ${sessionJwt('oauth','00000000-0000-4000-8000-000000000005')}`}),env,deps)).status).toBe(403);
  expect(deps.rpc).not.toHaveBeenCalled();
});
it('rejects unverified tokens and duplicate callback parameters',async()=>{
  const deps=mocks();
  deps.getUser.mockResolvedValueOnce({data:{user:null as never},error:{message:'invalid'} as never});
  const denied=await handleGoogleProof(request('POST','/api/auth/google-proof/start',{origin,authorization:`Bearer ${sessionJwt()}`}),env,deps);
  expect(denied.status).toBe(403);
  expect(deps.rpc).not.toHaveBeenCalled();
  const cookie='__Host-axiom-google-proof='+'A'.repeat(43);
  for (const path of ['/api/auth/google-proof/callback?state=one&state=two&code=code','/api/auth/google-proof/callback?state=one&code=one&code=two']) {
    const response=await handleGoogleProof(request('GET',path,{cookie}),env,deps);
    expect(response.headers.get('location')).toContain('google_proof=error');
  }
  expect(deps.rpc).not.toHaveBeenCalled();
});
