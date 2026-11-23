// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { exchangeRecovery, makeRecoveryClient, requestRecovery, updateRecoveryPassword } from '../src/lib/passwordRecovery';

it('uses the real Supabase SDK PKCE flow, keeping the verifier across tabs and recovery session separate from main auth',async()=>{
 const previous=globalThis.crypto; Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
 const requests: {url:string; body:Record<string,unknown> | null; authorization:string|null}[]=[];
 const user={id:'12345678-1234-4234-8234-123456789123',email:'student@example.test',app_metadata:{},user_metadata:{},aud:'authenticated',created_at:'2026-01-01T00:00:00Z'};
 const fetcher=vi.fn(async(input:RequestInfo | URL,init?:RequestInit)=>{
  const url=String(input);const body=typeof init?.body==='string'?JSON.parse(init.body):null;requests.push({url,body,authorization:new Headers(init?.headers).get('authorization')});
  let data:unknown={};
  if(url.includes('/token?grant_type=pkce')) data={access_token:'recovery-access',refresh_token:'recovery-refresh',token_type:'bearer',expires_in:3600,user};
  else if(url.endsWith('/user')) data=user;
  return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
 });
 vi.stubGlobal('fetch',fetcher);localStorage.clear();sessionStorage.clear();
 try {
  localStorage.setItem('main-app-session','original-session');
  const first=makeRecoveryClient('https://test.supabase.co','sb_publishable_test');
  await requestRecovery(first,'student@example.test','https://example.test','/');
  const sent=requests.find(r=>r.url.includes('/recover'));expect(sent?.body?.code_challenge).toBeTruthy();expect(sent?.body?.code_challenge_method).toBe('s256');
  expect(Object.keys(localStorage).some(k=>k.includes('axiom-recovery') && k.endsWith('-code-verifier'))).toBe(true);
  // A fresh tab shares localStorage, but not the recovery auth sessionStorage.
  sessionStorage.clear();
  const next=makeRecoveryClient('https://test.supabase.co','sb_publishable_test');
  const ready=await exchangeRecovery(next,{code:'one-time-code'});expect(ready.userId).toBe(user.id);
  const token=requests.find(r=>r.url.includes('/token?grant_type=pkce'));expect(token?.body?.auth_code).toBe('one-time-code');expect(typeof token?.body?.code_verifier).toBe('string');
  expect(localStorage.getItem('main-app-session')).toBe('original-session');
  expect(await updateRecoveryPassword(next,ready,'a-long-new-password')).toBe('signed-out');
  expect(requests.some(r=>r.url.endsWith('/user') && r.body?.password==='a-long-new-password' && r.authorization==='Bearer recovery-access')).toBe(true);
  expect(localStorage.getItem('main-app-session')).toBe('original-session');
 } finally {vi.unstubAllGlobals();Object.defineProperty(globalThis,'crypto',{configurable:true,value:previous});localStorage.clear();sessionStorage.clear();}
});
