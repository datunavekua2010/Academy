import { expect, it, vi } from 'vitest';
import { handleAuthCaptcha, verifyWorkerTurnstile } from '../server/auth-captcha-review-worker';
import { applyVerifiedPaymentEvent, paymentWebhookReviewEndpoint } from '../server/payment-webhook-review';
import type { SupabaseClient } from '@supabase/supabase-js';
const env={ASSETS:{fetch:async()=>new Response('asset')},TURNSTILE_REVIEW_ENABLED:'true',TURNSTILE_ALLOWED_ORIGIN:'https://preview.example',TURNSTILE_WORKER_SECRET:'not-a-real-secret'};
const request=(body:string,origin='https://preview.example')=>new Request('https://preview.example/api/auth/turnstile-verify',{method:'POST',headers:{origin,'content-type':'application/json'},body});
it('fails closed without configuration or for wrong method, origin, hostname, action and oversized input',async()=>{
 const ok=vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'preview.example',action:'academy_auth'}))) as unknown as typeof fetch;
 expect((await handleAuthCaptcha(request('{"token":"test"}'),{...env,TURNSTILE_REVIEW_ENABLED:'false'},ok)).status).toBe(503);
 expect((await handleAuthCaptcha(request('{"token":"test"}','https://evil.example'),env,ok)).status).toBe(403);
 expect((await handleAuthCaptcha(request(JSON.stringify({token:'x'.repeat(5000)})),env,ok)).status).toBe(413);
 const bad=vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'evil.example',action:'academy_auth'}))) as unknown as typeof fetch;
 expect((await handleAuthCaptcha(request('{"token":"test"}'),env,bad)).status).toBe(403);
 expect(await verifyWorkerTurnstile('test','secret','preview.example',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'preview.example',action:'wrong'}))) as unknown as typeof fetch)).toBe(false);
 expect(await verifyWorkerTurnstile('test','secret','preview.example',vi.fn(async()=>{throw Error('offline')}) as unknown as typeof fetch)).toBe(false);
 expect((await handleAuthCaptcha(request('{"token":"test"}'),env,ok)).status).toBe(204);
});
it('logs only fixed diagnostic categories, without exposing secrets, tokens, or response data',async()=>{
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 try {
  const result=(data:unknown)=>vi.fn(async()=>new Response(JSON.stringify(data))) as unknown as typeof fetch;
  expect(await verifyWorkerTurnstile('private-token','private-secret','preview.example',result({success:false,'error-codes':['invalid-input-secret','private-token']}))).toBe(false);
  expect(warn).toHaveBeenLastCalledWith('turnstile_precheck_failed',['invalid-input-secret']);
  expect(await verifyWorkerTurnstile('private-token','private-secret','preview.example',result({success:false,'error-codes':['private-secret']}))).toBe(false);
  expect(warn).toHaveBeenLastCalledWith('turnstile_precheck_failed',['siteverify_rejected']);
  expect(await verifyWorkerTurnstile('private-token','private-secret','preview.example',result({success:true,hostname:'private-token',action:'academy_auth'}))).toBe(false);
  expect(warn).toHaveBeenLastCalledWith('turnstile_precheck_failed',['hostname_mismatch']);
  expect(await verifyWorkerTurnstile('private-token','private-secret','preview.example',vi.fn(async()=>{throw new Error('private-secret')}) as unknown as typeof fetch)).toBe(false);
  expect(warn).toHaveBeenLastCalledWith('turnstile_precheck_failed',['siteverify_unavailable']);
  expect(JSON.stringify(warn.mock.calls)).not.toMatch(/private-token|private-secret/);
 } finally { warn.mockRestore(); }
});
it('keeps webhook disabled and delegates trusted event processing to one atomic RPC',async()=>{
 expect((await paymentWebhookReviewEndpoint(new Request('https://example.test/webhook',{method:'POST',body:'{}'}))).status).toBe(503);
 const rpc=vi.fn(async()=>({data:'duplicate',error:null}));const client={rpc} as unknown as SupabaseClient;
 const event={provider:'test',eventId:'event-1',providerCustomerId:'customer-1',providerSubscriptionId:'sub-1',providerVersion:'1',eventType:'test'};
 expect(await applyVerifiedPaymentEvent(client,event)).toBe('duplicate');
 expect(rpc).toHaveBeenCalledTimes(1);expect(rpc).toHaveBeenCalledWith('review_payment_apply_verified_event',expect.objectContaining({p_event_id:'event-1'}));
 await expect(applyVerifiedPaymentEvent(client,{...event,eventId:''})).rejects.toThrow();
});
