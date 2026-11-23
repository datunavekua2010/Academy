// @vitest-environment jsdom
import {act,cleanup,render,screen} from '@testing-library/react';import {afterEach,expect,it,vi} from 'vitest';import type {SupabaseClient} from '@supabase/supabase-js';import {AccountStatus,AccountStatusView} from '../src/account/AccountStatus';
const id='00000000-0000-4000-8000-000000000001';afterEach(cleanup);
it('is unavailable in the test-account preview',()=>{render(<AccountStatus/>);expect(screen.getByText('ამჟამად მიუწვდომელია.')).toBeTruthy();});
it('shows only a verified, email-confirmed signed-in user reference and clears on auth changes',async()=>{
 let callback:((event:string,session:unknown)=>void)|null=null;let confirmed=true;
 const client={auth:{onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:vi.fn()}}};},getUser:async()=>({data:{user:{id,email_confirmed_at:confirmed?'2026-01-01':null}},error:null}),signOut:async()=>({error:null})}} as unknown as SupabaseClient;
 render(<AccountStatusView client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id}}));expect(await screen.findByText(id)).toBeTruthy();
 act(()=>callback?.('SIGNED_OUT',null));expect(screen.queryByText(id)).toBeNull();confirmed=false;act(()=>callback?.('SIGNED_IN',{user:{id}}));await screen.findByRole('alert');expect(screen.queryByText(id)).toBeNull();
});
it('does not show a late identity response after sign-out',async()=>{
 let callback:((event:string,session:unknown)=>void)|null=null,release!:(value:unknown)=>void;const pending=new Promise(resolve=>{release=resolve;});
 const client={auth:{onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:vi.fn()}}};},getUser:()=>pending}} as unknown as SupabaseClient;
 render(<AccountStatusView client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id}}));await act(async()=>{await new Promise(resolve=>setTimeout(resolve,10));});act(()=>callback?.('SIGNED_OUT',null));await act(async()=>{release({data:{user:{id,email_confirmed_at:'2026-01-01'}},error:null});await pending;});expect(screen.queryByText(id)).toBeNull();
});
