// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { startGoogleProof, verifyGoogleProofStatus } from '../src/lib/googleProof';
import { consumeGoogleProofCallback } from '../src/lib/authCallbacks';
afterEach(()=>vi.unstubAllGlobals());
const client=(token:string|null)=>({auth:{getSession:vi.fn(async()=>({data:{session:token?{access_token:token}:null},error:null}))}} as unknown as SupabaseClient);
it('starts proof through the same-origin endpoint without exposing the session to Google',async()=>{
  const fetcher=vi.fn(async()=>new Response(JSON.stringify({authorizationUrl:'https://accounts.google.com/o/oauth2/v2/auth?state=synthetic'}),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  const url=await startGoogleProof(client('synthetic-token'));
  expect(url).toBe('https://accounts.google.com/o/oauth2/v2/auth?state=synthetic');
  expect(url).not.toContain('synthetic-token');
  expect(fetcher.mock.calls[0][0]).toBe('/api/auth/google-proof/start');
});
it('rejects missing sessions and non-Google redirects',async()=>{
  const fetcher=vi.fn(async()=>new Response(JSON.stringify({authorizationUrl:'https://evil.test/o/oauth2/v2/auth'}),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  await expect(startGoogleProof(client(null))).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
  await expect(startGoogleProof(client('synthetic-token'))).rejects.toThrow();
});
it('requires a verified user and a positive server-side proof status',async()=>{
  const getUser=vi.fn(async()=>({data:{user:{id:'synthetic-user'}},error:null}));
  const rpc=vi.fn(async()=>({data:false,error:null}));
  const authenticated={auth:{getUser},rpc} as unknown as SupabaseClient;
  await expect(verifyGoogleProofStatus(authenticated)).rejects.toThrow();
  rpc.mockResolvedValue({data:true,error:null});
  await expect(verifyGoogleProofStatus(authenticated)).resolves.toBeUndefined();
  expect(rpc).toHaveBeenCalledWith('review_google_proof_status');
});
it('scrubs callback status and treats duplicates as failure',()=>{
  const history={replaceState:vi.fn()};
  expect(consumeGoogleProofCallback('https://example.test/?google_proof=ok#/account/google',history)).toBe('ok');
  expect(history.replaceState).toHaveBeenCalledWith(null,'','/#/account/google');
  expect(consumeGoogleProofCallback('https://example.test/?google_proof=ok&google_proof=error',history)).toBe('error');
  expect(consumeGoogleProofCallback('https://example.test/',history)).toBeNull();
});
