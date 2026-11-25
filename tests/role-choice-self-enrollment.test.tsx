// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RoleChoices } from '../src/account/LoginPreview';
const id='00000000-0000-4000-8000-000000000001';
function fixture(){
 const getUser=vi.fn().mockResolvedValue({data:{user:{id,email_confirmed_at:'2025-01-01'}},error:null});
 const rpc=vi.fn().mockResolvedValue({data:'created',error:null});
 return {getUser,rpc,client:{auth:{getUser},rpc} as unknown as SupabaseClient};
}
afterEach(()=>{cleanup();window.location.hash='';});
for(const [label,role] of [['მოსწავლე','student'],['მშობელი','parent']] as const) it(`persists ${role} before navigating`,async()=>{
 window.location.hash='#/account/login';const f=fixture();render(<RoleChoices enrollmentClient={f.client}/>);
 fireEvent.click(screen.getByRole('link',{name:label}));
 await waitFor(()=>expect(window.location.hash).toBe(`#/${role}`));
 expect(f.rpc).toHaveBeenCalledExactlyOnceWith('choose_email_role',{p_expected_user:id,p_role:role});
});
it('fails closed for an unconfirmed email or failed role write',async()=>{
 window.location.hash='#/account/login';const f=fixture();f.getUser.mockResolvedValueOnce({data:{user:{id,email_confirmed_at:null}},error:null});
 const view=render(<RoleChoices enrollmentClient={f.client}/>);fireEvent.click(screen.getByRole('link',{name:'მოსწავლე'}));
 await screen.findByRole('alert');expect(f.rpc).not.toHaveBeenCalled();expect(window.location.hash).toBe('#/account/login');view.unmount();
 const next=fixture();next.rpc.mockResolvedValue({data:null,error:{message:'private'}});render(<RoleChoices enrollmentClient={next.client}/>);
 fireEvent.click(screen.getByRole('link',{name:'მშობელი'}));expect((await screen.findByRole('alert')).textContent).not.toContain('private');expect(window.location.hash).toBe('#/account/login');
});
it('does not navigate after an account change and serializes selection',async()=>{
 window.location.hash='#/account/login';const f=fixture();let resolve!:(value:{data:string;error:null})=>void;
 f.rpc.mockImplementation(()=>new Promise(r=>{resolve=r;}));
 render(<RoleChoices enrollmentClient={f.client}/>);fireEvent.click(screen.getByRole('link',{name:'მოსწავლე'}));
 await waitFor(()=>expect(f.rpc).toHaveBeenCalledOnce());fireEvent.click(screen.getByRole('link',{name:'მშობელი'}));expect(f.rpc).toHaveBeenCalledOnce();
 f.getUser.mockResolvedValue({data:{user:{id:'different'}},error:null});resolve({data:'created',error:null});
 await screen.findByRole('alert');expect(window.location.hash).toBe('#/account/login');
});
