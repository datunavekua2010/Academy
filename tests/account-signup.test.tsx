// @vitest-environment jsdom
import {expect,it,vi,afterEach} from 'vitest';import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';import {webcrypto} from 'node:crypto';import type {SupabaseClient} from '@supabase/supabase-js';
import {consumeSignupCallback,exchangeSignup,makeSignupClient,requestSignup} from '../src/lib/accountSignup';import {SignupForm} from '../src/account/Signup';
afterEach(()=>cleanup());
it('uses isolated Supabase PKCE signup and verifies confirmed email before clearing the temporary session',async()=>{
 const previous=globalThis.crypto;Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});const calls:{url:string;body:Record<string,unknown>|null}[]=[];
 const user={id:'12345678-1234-4234-8234-123456789123',email:'parent@example.test',email_confirmed_at:'2026-01-01T00:00:00Z',app_metadata:{},user_metadata:{},aud:'authenticated',created_at:'2026-01-01T00:00:00Z'};
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{const url=String(input),body=typeof init?.body==='string'?JSON.parse(init.body):null;calls.push({url,body});let data:unknown={};if(url.includes('/signup'))data={user,session:null};else if(url.includes('/token?grant_type=pkce'))data={access_token:'temporary-access',refresh_token:'temporary-refresh',token_type:'bearer',expires_in:3600,user};else if(url.endsWith('/user'))data=user;return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});}));localStorage.clear();
 try{localStorage.setItem('main-app-session','original');const first=makeSignupClient('https://test.supabase.co','sb_publishable_test');await requestSignup(first,'parent@example.test','long-password-123','https://example.test','/');
  const signup=calls.find(c=>c.url.includes('/signup'));expect(signup?.body?.code_challenge).toBeTruthy();expect(signup?.body?.code_challenge_method).toBe('s256');expect(Object.keys(localStorage).some(k=>k.includes('axiom-signup')&&k.endsWith('-code-verifier'))).toBe(true);
  const fresh=makeSignupClient('https://test.supabase.co','sb_publishable_test');await exchangeSignup(fresh,{code:'one-time-code'});expect(calls.find(c=>c.url.includes('/token?grant_type=pkce'))?.body?.code_verifier).toBeTruthy();expect(localStorage.getItem('main-app-session')).toBe('original');
 }finally{vi.unstubAllGlobals();Object.defineProperty(globalThis,'crypto',{configurable:true,value:previous});localStorage.clear();}
});
it('scrubs callback parameters, rejects missing and duplicate codes, unconfirmed users and automatic sessions',async()=>{
 const history={replaceState:vi.fn()};expect(consumeSignupCallback('https://example.test/?signup=1&code=abc&secret=extra#token',history)).toEqual({code:'abc'});expect(history.replaceState).toHaveBeenCalledWith(null,'','/#/account/confirmed');expect(consumeSignupCallback('https://example.test/?signup=1&code=a&code=b',history)).toEqual({code:null});
 const signOut=vi.fn(async()=>({error:null}));const mock={auth:{exchangeCodeForSession:vi.fn(async()=>({data:{user:{id:'x'},session:{}},error:null})),getUser:vi.fn(async()=>({data:{user:{id:'x',email_confirmed_at:null}},error:null})),signOut,signUp:vi.fn(async()=>({data:{session:{}},error:null}))}} as unknown as SupabaseClient;
 await expect(exchangeSignup(mock,{code:null})).rejects.toThrow();await expect(exchangeSignup(mock,{code:'test'})).rejects.toThrow();expect(signOut).toHaveBeenCalled();await expect(requestSignup(mock,'parent@example.test','long-password','https://example.test','/')).rejects.toThrow();expect(signOut).toHaveBeenCalledTimes(2);
});
it('never sends a signup until the adult confirmation and matching passwords are present',async()=>{
 const signUp=vi.fn(async()=>({data:{session:null},error:null}));const client={auth:{signUp}} as unknown as SupabaseClient;render(<SignupForm client={client}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'adult@example.test'}});fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'long-password'}});fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password'}});
 fireEvent.submit(screen.getByText('მოთხოვნის გაგზავნა').closest('form')!);expect(signUp).not.toHaveBeenCalled();fireEvent.click(screen.getByLabelText('ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს'));fireEvent.click(screen.getByText('მოთხოვნის გაგზავნა'));await waitFor(()=>expect(signUp).toHaveBeenCalledTimes(1));expect(await screen.findByRole('status')).toBeTruthy();
});
it('does not send duplicate signup requests from rapid submissions',async()=>{
 let release!:()=>void;const waiting=new Promise<void>(resolve=>{release=resolve;});
 const signUp=vi.fn(async()=>{await waiting;return {data:{session:null},error:null};});
 const client={auth:{signUp}} as unknown as SupabaseClient;render(<SignupForm client={client}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'adult@example.test'}});
 fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'long-password'}});
 fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password'}});
 fireEvent.click(screen.getByLabelText('ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს'));
 const form=screen.getByText('მოთხოვნის გაგზავნა').closest('form')!;
 act(()=>{fireEvent.submit(form);fireEvent.submit(form);});
 await waitFor(()=>expect(signUp).toHaveBeenCalledTimes(1));
 await act(async()=>{release();await waiting;});
 expect(await screen.findByRole('status')).toBeTruthy();
});
