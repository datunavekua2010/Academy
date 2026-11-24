// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
const fixture = vi.hoisted(() => ({ client: {} as SupabaseClient, start: vi.fn(async () => {}) }));
vi.mock('../src/lib/googleAuth', () => ({ googleAuthClient: fixture.client, startGoogleAuth: fixture.start }));
import { ParentReviewApp } from '../src/parent/ParentApp';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('offers Google, not password, for a signed-out parent', async () => {
  let callback: (event: string, session: null) => void = () => {};
  Object.assign(fixture.client, {auth:{onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:vi.fn()}}};}}});
  render(<ParentReviewApp client={fixture.client}/>); act(()=>callback('INITIAL_SESSION',null));
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Google-ით გაგრძელება'}));
  await waitFor(()=>expect(fixture.start).toHaveBeenCalledWith(fixture.client,window.location.origin,window.location.pathname,window.sessionStorage));
});
