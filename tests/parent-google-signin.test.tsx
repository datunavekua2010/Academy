// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
const fixture = vi.hoisted(() => ({ client: {} as SupabaseClient, start: vi.fn(async () => {}) }));
import { ParentReviewApp } from '../src/parent/ParentApp';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('directs a signed-out parent to email sign-in', () => {
  let callback: (event: string, session: null) => void = () => {};
  Object.assign(fixture.client, {auth:{onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:vi.fn()}}};}}});
  render(<ParentReviewApp client={fixture.client}/>); act(()=>callback('INITIAL_SESSION',null));
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  expect(screen.getByRole('link',{name:'ანგარიშში შესვლა ან სივრცის არჩევა'}).getAttribute('href')).toBe('#/account/login');
  expect(fixture.start).not.toHaveBeenCalled();
});
