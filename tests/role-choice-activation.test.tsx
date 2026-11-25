// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LoginForm } from '../src/account/LoginPreview';
afterEach(()=>{cleanup();window.location.hash='';});
it('wires a signed-in account choosing parent to email role enrollment',async()=>{
 let listener:(event:string,session:unknown)=>void=()=>{};
 const rpc=vi.fn().mockResolvedValue({data:'created',error:null});
 const client={auth:{getUser:async()=>({data:{user:{id:'synthetic-id',email_confirmed_at:'2025-01-01'}},error:null}),onAuthStateChange:(fn:typeof listener)=>{listener=fn;return {data:{subscription:{unsubscribe:vi.fn()}}};},signOut:vi.fn()},rpc} as unknown as SupabaseClient;
 render(<LoginForm client={client}/>);act(()=>listener('INITIAL_SESSION',{user:{id:'synthetic-id'}}));
 fireEvent.click(screen.getByRole('link',{name:'მშობელი'}));
 await waitFor(()=>expect(rpc).toHaveBeenCalledWith('choose_email_role',{p_expected_user:'synthetic-id',p_role:'parent'}));
 await waitFor(()=>expect(window.location.hash).toBe('#/parent'));
});
