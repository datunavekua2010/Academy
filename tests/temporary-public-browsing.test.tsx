// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const realAccess = vi.hoisted(() => ({ getUser: vi.fn(), onAuthStateChange: vi.fn(), from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: { auth: { getUser: realAccess.getUser, onAuthStateChange: realAccess.onAuthStateChange }, from: realAccess.from } } }));
import { Entry } from '../src/Entry';
function go(path: string) { window.location.hash=path; fireEvent(window,new HashChangeEvent('hashchange')); }
beforeEach(()=>{window.location.hash='';localStorage.clear();window.scrollTo=vi.fn();vi.clearAllMocks();});
afterEach(()=>{cleanup();window.location.hash='';localStorage.clear();});
it('shows the local mascot dashboard and teacher workspace without touching connected account data',async()=>{
 render(<Entry/>);
 expect(screen.getByRole('heading',{name:'რომელი სივრცის ნახვა გსურთ?'})).toBeTruthy();
 expect(screen.queryByRole('link',{name:'შესვლა'})).toBeNull();
 go('#/student');
 expect(await screen.findByRole('button',{name:'Axi-ს ნავიგაციის გახსნა'}, { timeout: 10000 })).toBeTruthy();
 expect(screen.getByText(/ადგილობრივი სივრცე · დავალებები სანიმუშოა/)).toBeTruthy();
 go('#/teacher');
 expect(await screen.findByRole('navigation',{name:'მასწავლებლის ნავიგაცია'})).toBeTruthy();
 expect(screen.getByText(/ეს არ არის ანგარიში/)).toBeTruthy();
 go('#/spaces');
 expect(await screen.findByRole('heading',{name:'რომელი სივრცის ნახვა გსურთ?'})).toBeTruthy();
 expect(realAccess.getUser).not.toHaveBeenCalled();
 expect(realAccess.onAuthStateChange).not.toHaveBeenCalled();
 expect(realAccess.from).not.toHaveBeenCalled();
});
it('temporarily replaces sign-in and registration pages with the browsing choice',async()=>{
 render(<Entry/>);
 for(const path of ['#/account/login','#/account/register']){
  go(path);
  await waitFor(()=>expect(screen.getByRole('heading',{name:'რომელი სივრცის ნახვა გსურთ?'})).toBeTruthy());
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
 }
});
