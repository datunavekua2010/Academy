// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const mock = vi.hoisted(() => ({
  getUser: vi.fn(), rpc: vi.fn(), proof: vi.fn(), listener: null as null | ((event:string, session:unknown)=>void),
}));
vi.mock('../src/lib/googleProof', () => ({ verifyGoogleProofStatus: mock.proof, startGoogleProof: vi.fn() }));
vi.mock('../src/lib/googleAuth', () => ({
  googleAuthClient: { auth: { getUser: mock.getUser, onAuthStateChange: (fn:(event:string,session:unknown)=>void) => { mock.listener=fn; return { data:{subscription:{unsubscribe:vi.fn()}} }; }, signOut: vi.fn() }, rpc: mock.rpc },
  startGoogleAuth: vi.fn(),
}));
import { googleAuthClient } from '../src/lib/googleAuth';
import { GoogleCallback } from '../src/account/GoogleAuth';
import { LoginForm } from '../src/account/LoginPreview';

beforeEach(() => {
 vi.stubEnv('VITE_GOOGLE_PROOF_REVIEW','true');vi.stubEnv('VITE_ROLE_CHOICE_SELF_ENROLL','true');
 mock.proof.mockReset();mock.proof.mockResolvedValue(undefined);mock.rpc.mockReset();mock.rpc.mockResolvedValue({data:'created',error:null});
 mock.getUser.mockReset();mock.getUser.mockResolvedValue({data:{user:{id:'synthetic-id'}},error:null});mock.listener=null;window.location.hash='#/account/google';
});
afterEach(()=>{cleanup();vi.unstubAllEnvs();window.location.hash='';});
it('wires the verified Google callback choice to real role enrollment when both flags are enabled',async()=>{
 render(<GoogleCallback result="ok"/>);
 fireEvent.click(screen.getByRole('link',{name:'მოსწავლე'}));
 await waitFor(()=>expect(mock.rpc).toHaveBeenCalledWith('review_choose_google_role',{p_expected_user:'synthetic-id',p_role:'student'}));
 await waitFor(()=>expect(window.location.hash).toBe('#/student'));
});
it('wires an existing signed-in account choosing parent to the same server function',async()=>{
 render(<LoginForm client={googleAuthClient}/>);
 act(()=>mock.listener?.('INITIAL_SESSION',{user:{id:'synthetic-id'}}));
 fireEvent.click(screen.getByRole('link',{name:'მშობელი'}));
 await waitFor(()=>expect(mock.rpc).toHaveBeenCalledWith('review_choose_google_role',{p_expected_user:'synthetic-id',p_role:'parent'}));
 await waitFor(()=>expect(window.location.hash).toBe('#/parent'));
});
it('does not invoke the role RPC when the enrollment flag is off',()=>{
 vi.stubEnv('VITE_ROLE_CHOICE_SELF_ENROLL','false');
 render(<GoogleCallback result="ok"/>);
 expect(screen.getByRole('link',{name:'მოსწავლე'}).getAttribute('href')).toBe('#/student');
 expect(mock.rpc).not.toHaveBeenCalled();
});
