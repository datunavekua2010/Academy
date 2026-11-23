// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseConfiguration } from '../src/lib/supabase';
import { consumeGoogleCallback, finishGoogleAuth, startGoogleAuth } from '../src/lib/googleAuth';
import { SignupForm } from '../src/account/Signup';

const signedOut = () => ({ data: { session: null }, error: null });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Google OAuth review', () => {
  it('uses a fixed same-origin callback and refuses to replace an existing session', async () => {
    const oauth = vi.fn(async () => ({ data: { url: 'https://provider.example.test' }, error: null }));
    const getSession = vi.fn(async () => signedOut());
    const client = { auth: { getSession, signInWithOAuth: oauth } } as unknown as SupabaseClient;
    await startGoogleAuth(client, 'https://preview.example.test', '/app', sessionStorage);
    expect(oauth).toHaveBeenCalledWith({ provider: 'google', options: { redirectTo: 'https://preview.example.test/app?google_auth=1' } });
    expect(sessionStorage.getItem('axiom-google-auth-pending')).toBe('1');
    getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'old' } } }, error: null } as never);
    await expect(startGoogleAuth(client, 'https://preview.example.test', '/app', sessionStorage)).rejects.toThrow();
    await expect(startGoogleAuth(client, 'https://preview.example.test', '//evil.test/', sessionStorage)).rejects.toThrow();
    expect(oauth).toHaveBeenCalledTimes(1);
  });
  it('removes pending state on an OAuth initiation error', async () => {
    const client = { auth: { getSession: async () => signedOut(), signInWithOAuth: async () => ({ data: { url: null }, error: new Error('no') }) } } as unknown as SupabaseClient;
    await expect(startGoogleAuth(client, 'https://example.test', '/', sessionStorage)).rejects.toThrow();
    expect(sessionStorage.getItem('axiom-google-auth-pending')).toBeNull();
  });
  it('scrubs callback secrets, rejects errors or duplicate codes and requires a pending initiation', async () => {
    const history = { replaceState: vi.fn() };
    expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=abc&other=secret#token', history)).toEqual({code:'abc'});
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/#/account/google');
    expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=a&code=b', history)).toEqual({code:null});
    expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=a&error=denied', history)).toEqual({code:null});
    expect(consumeGoogleCallback('https://example.test/?signup=1&code=a', history)).toBeNull();
    const exchange = vi.fn();
    const client = {auth:{exchangeCodeForSession:exchange}} as unknown as SupabaseClient;
    await expect(finishGoogleAuth(client, {code:'abc'}, sessionStorage)).rejects.toThrow();
    expect(exchange).not.toHaveBeenCalled();
  });
  it('does not exchange a callback if a session appeared meanwhile', async () => {
    const exchange=vi.fn();
    const client={auth:{getSession:async()=>({data:{session:{user:{id:'other'}}},error:null}),exchangeCodeForSession:exchange}} as unknown as SupabaseClient;
    sessionStorage.setItem('axiom-google-auth-pending','1');
    await expect(finishGoogleAuth(client,{code:'abc'},sessionStorage)).rejects.toThrow();
    expect(exchange).not.toHaveBeenCalled();
  });
  it('checks verified identity, clears failed sessions, and never calls role-provisioning RPCs', async () => {
    const signOut = vi.fn(async () => ({error:null}));
    const getUser = vi.fn(async () => ({data:{user:{id:'other',email_confirmed_at:'now'}},error:null}));
    const rpc = vi.fn();
    const client = {auth:{getSession:async()=>signedOut(),exchangeCodeForSession:async()=>({data:{user:{id:'a'},session:{}},error:null}),getUser,signOut},rpc} as unknown as SupabaseClient;
    sessionStorage.setItem('axiom-google-auth-pending','1');
    await expect(finishGoogleAuth(client,{code:'abc'},sessionStorage)).rejects.toThrow();
    expect(signOut).toHaveBeenCalledWith({scope:'local'}); expect(rpc).not.toHaveBeenCalled();
    getUser.mockResolvedValueOnce({data:{user:{id:'a',email_confirmed_at:'now'}},error:null});
    sessionStorage.setItem('axiom-google-auth-pending','1');
    await expect(finishGoogleAuth(client,{code:'abc'},sessionStorage)).resolves.toBeUndefined();
    expect(sessionStorage.getItem('axiom-google-auth-pending')).toBeNull(); expect(rpc).not.toHaveBeenCalled();
  });
  it('requires adult acknowledgment on the account request page before redirect', async () => {
    const oauth = vi.fn(async () => ({data:{url:'https://provider.example.test'},error:null}));
    const client = {auth:{getSession:async()=>signedOut(),signInWithOAuth:oauth}} as unknown as SupabaseClient;
    render(<SignupForm client={null} googleClient={client}/>);
    fireEvent.click(screen.getByText('Google-ით გაგრძელება'));
    expect(screen.getByRole('alert')).toBeTruthy(); expect(oauth).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს'));
    fireEvent.click(screen.getByText('Google-ით გაგრძელება'));
    await waitFor(()=>expect(oauth).toHaveBeenCalledTimes(1));
  });
  it('uses the actual Supabase SDK PKCE challenge and exchanges its verifier against mocked HTTP', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
    const user = {id:'12345678-1234-4234-8234-123456789123',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{},user_metadata:{},aud:'authenticated',created_at:'2026-01-01T00:00:00Z'};
    const calls: {url:string;body:Record<string,unknown>|null}[]=[];
    vi.stubGlobal('fetch',vi.fn(async (input:RequestInfo|URL,init?:RequestInit)=>{
      const url=String(input), body=typeof init?.body==='string'?JSON.parse(init.body):null; calls.push({url,body});
      const data=url.includes('/token?grant_type=pkce')?{access_token:'fake-access',refresh_token:'fake-refresh',token_type:'bearer',expires_in:3600,user}:url.endsWith('/user')?user:{};
      return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
    }));
    try {
      const client=createSupabaseConfiguration('https://test.supabase.co','sb_publishable_test',true).client!;
      const real=client.auth.signInWithOAuth.bind(client.auth);
      const oauth=vi.spyOn(client.auth,'signInWithOAuth').mockImplementation(credentials=>real({...credentials,options:{...credentials.options,skipBrowserRedirect:true}}));
      await startGoogleAuth(client,'https://example.test','/',sessionStorage);
      const produced = await oauth.mock.results[0].value;
      const url = new URL(produced.data.url!);
      expect(url.searchParams.get('provider')).toBe('google');
      expect(url.searchParams.get('code_challenge')).toBeTruthy();
      expect(url.searchParams.get('code_challenge_method')).toBe('s256');
      // A full redirect reloads the app and constructs a new SDK client.
      const reloadedClient=createSupabaseConfiguration('https://test.supabase.co','sb_publishable_test',true).client!;
      await finishGoogleAuth(reloadedClient,{code:'synthetic-code'},sessionStorage);
      expect(calls.find(c=>c.url.includes('/token?grant_type=pkce'))?.body?.code_verifier).toBeTruthy();
      expect(calls.some(c=>c.url.endsWith('/user'))).toBe(true);
    } finally { Object.defineProperty(globalThis,'crypto',{configurable:true,value:originalCrypto}); }
  });
});
