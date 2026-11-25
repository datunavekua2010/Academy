// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
vi.mock('../src/account/TurnstileReview',()=>({useTurnstileReview:()=>({ready:true,widgets:null,verify:async()=>undefined,reset:()=>{}})}));
import { EmailSignIn } from '../src/account/EmailSignIn';
afterEach(cleanup);
it('signs in with email and password without a Google request',async()=>{
 const signInWithPassword=vi.fn().mockResolvedValue({error:null});
 const client={auth:{signInWithPassword}} as unknown as SupabaseClient;
 render(<EmailSignIn client={client}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'user@example.test'}});
 fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'password-example'}});
 fireEvent.click(screen.getByRole('button',{name:'შესვლა'}));
 await waitFor(()=>expect(signInWithPassword).toHaveBeenCalledWith({email:'user@example.test',password:'password-example'}));
 expect(screen.queryByText(/Google/)).toBeNull();
});
it('does not expose server error details',async()=>{
 const client={auth:{signInWithPassword:vi.fn().mockResolvedValue({error:new Error('private')})}} as unknown as SupabaseClient;
 render(<EmailSignIn client={client}/>);fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'u@example.test'}});fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'password-example'}});
 fireEvent.click(screen.getByRole('button',{name:'შესვლა'}));expect((await screen.findByRole('alert')).textContent).not.toContain('private');
});
