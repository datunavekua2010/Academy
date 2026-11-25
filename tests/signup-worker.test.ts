import {expect,it,vi} from 'vitest';
import {handleSignupVerify} from '../server/auth-captcha-review-worker';
const origin='https://axiacad.uk';
const env={ASSETS:{fetch:vi.fn()},TURNSTILE_ALLOWED_ORIGIN:origin,TURNSTILE_REVIEW_ENABLED:'true',TURNSTILE_WORKER_SECRET:'synthetic-secret'};
const body={email:'person@example.test',password:'synthetic-password',role:'parent',turnstileToken:'synthetic-token'};
const request=(data:unknown=body, requestOrigin=origin)=>new Request(`${origin}/api/auth/signup-verify`,{method:'POST',headers:{origin:requestOrigin,'content-type':'application/json'},body:JSON.stringify(data)});
it('accepts only configured preflight and emits restrictive CORS headers',async()=>{
 const preflight=new Request(`${origin}/api/auth/signup-verify`,{method:'OPTIONS',headers:{origin}});
 const response=await handleSignupVerify(preflight,env);expect(response.status).toBe(204);expect(response.headers.get('access-control-allow-origin')).toBe(origin);
 const evil=new Request(`${origin}/api/auth/signup-verify`,{method:'OPTIONS',headers:{origin:'https://evil.example'}});
 const denied=await handleSignupVerify(evil,env);expect(denied.status).toBe(403);expect(denied.headers.get('access-control-allow-origin')).toBeNull();
});
it('checks inputs and validates only the Turnstile token server-side',async()=>{
 const fetcher=vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'axiacad.uk',action:'academy_auth'})));
 const ok=await handleSignupVerify(request(),env,fetcher as unknown as typeof fetch);expect(ok.status).toBe(200);expect(await ok.json()).toEqual({verified:true});
 const sent=JSON.parse((fetcher.mock.calls[0][1] as RequestInit).body as string);expect(sent).toEqual({secret:'synthetic-secret',response:'synthetic-token'});
 for(const role of ['teacher','admin']){const bad=await handleSignupVerify(request({...body,role}),env,fetcher as unknown as typeof fetch);expect(bad.status).toBe(400);}
 expect(fetcher).toHaveBeenCalledTimes(1);
});
it('fails closed and returns safe Turnstile errors without leaking inputs',async()=>{
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 try{
  const fetcher=vi.fn(async()=>new Response(JSON.stringify({success:false,'error-codes':['invalid-input-secret','synthetic-password']})));
  const response=await handleSignupVerify(request(),env,fetcher as unknown as typeof fetch);expect(response.status).toBe(403);
  expect(await response.json()).toEqual({error:'verification_failed','error-codes':['invalid-input-secret']});
  expect(JSON.stringify(warn.mock.calls)).not.toMatch(/synthetic-secret|synthetic-token|synthetic-password/);
 }finally{warn.mockRestore();}
});
