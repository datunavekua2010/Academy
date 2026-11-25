// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Entry } from '../src/Entry';
import App from '../src/App';
import { LoginForm } from '../src/account/LoginPreview';
afterEach(() => { cleanup(); vi.clearAllMocks(); window.location.hash = ''; });
it('opens the login page from the preview entry and fails closed without configuration', async () => {
  window.scrollTo = vi.fn();
  const fetch = vi.spyOn(globalThis, 'fetch');
  render(<Entry />);
  expect(screen.getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
  window.location.hash = '#/account/login'; fireEvent(window, new HashChangeEvent('hashchange'));
  expect(await screen.findByRole('heading', { name: 'ვისთვის არის სივრცე?' }, { timeout: 15000 })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('ამ გარემოში ჯერ არ არის ხელმისაწვდომი');
  expect(fetch).not.toHaveBeenCalled(); fetch.mockRestore();
}, 30000);
it('provides the login link in the landing navigation', () => {
  render(<App />);
  expect(within(screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' })).getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
});
it('routes signed-out users to role-specific login and allows a shared session to sign out', async () => {
  let listener: (event: string, session: { user: { id: string } } | null) => void = () => {};
  const signOut = vi.fn(async () => ({ error: null })); const unsubscribe = vi.fn();
  const client = { auth: { onAuthStateChange: (fn: typeof listener) => { listener = fn; return {data:{subscription:{unsubscribe}}}; }, signOut } } as unknown as SupabaseClient;
  const view=render(<LoginForm client={client} />);
  expect(screen.getByRole('status').textContent).toContain('ანგარიში მოწმდება');
  expect(screen.queryByRole('link',{name:'მოსწავლე'})).toBeNull();
  act(()=>listener('INITIAL_SESSION', null));
  expect(screen.queryByRole('link',{name:'მოსწავლე'})).toBeNull();
  expect(screen.queryByRole('link',{name:'მშობელი'})).toBeNull();
  expect(screen.getByRole('link',{name:'მასწავლებლის შესვლა'}).getAttribute('href')).toBe('#/teacher');
  expect(screen.getByLabelText('პაროლი')).toBeTruthy();
  act(()=>listener('SIGNED_IN', {user:{id:'test'}}));
  expect(screen.getByText('აირჩიეთ მოსწავლის ან მშობლის სივრცე.')).toBeTruthy();
  expect(screen.getByRole('link',{name:'მოსწავლე'}).getAttribute('href')).toBe('#/student');
  expect(screen.getByRole('link',{name:'მშობელი'}).getAttribute('href')).toBe('#/parent');
  fireEvent.click(screen.getByRole('button',{name:'ანგარიშიდან გასვლა'}));
  await waitFor(()=>expect(signOut).toHaveBeenCalledTimes(1));
  view.unmount(); expect(unsubscribe).toHaveBeenCalled();
});
it('shows an error if signing out fails', async () => {
  let listener: (event: string, session: {user:{id:string}} | null) => void = () => {};
  const client = {auth:{onAuthStateChange:(fn:typeof listener)=>{listener=fn;return {data:{subscription:{unsubscribe:vi.fn()}}};},signOut:async()=>({error:new Error('secret')})}} as unknown as SupabaseClient;
  render(<LoginForm client={client}/>);act(()=>listener('INITIAL_SESSION',{user:{id:'test'}}));
  fireEvent.click(screen.getByRole('button',{name:'ანგარიშიდან გასვლა'}));
  expect((await screen.findByRole('alert')).textContent).not.toContain('secret');
});
