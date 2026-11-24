// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Entry } from '../src/Entry';
import App from '../src/App';
import { LoginForm } from '../src/account/LoginPreview';

const security = vi.hoisted(() => ({ ready: true, verify: vi.fn(async (): Promise<string | undefined> => 'auth-token'), reset: vi.fn() }));
const google = vi.hoisted(() => vi.fn(async () => {}));
vi.mock('../src/account/TurnstileReview', () => ({ useTurnstileReview: () => ({ ...security, widgets: null }) }));
vi.mock('../src/lib/googleAuth', () => ({ googleAuthClient: null, startGoogleAuth: google }));

beforeEach(() => { window.location.hash = ''; window.scrollTo = vi.fn(); security.ready = true; security.verify.mockResolvedValue('auth-token'); });
afterEach(() => { cleanup(); vi.clearAllMocks(); window.location.hash = ''; });

it('opens the login page from the preview entry and fails closed without configuration', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  render(<Entry />);
  expect(screen.getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
  window.location.hash = '#/account/login';
  fireEvent(window, new HashChangeEvent('hashchange'));
  expect(await screen.findByRole('heading', { name: 'ანგარიშში შესვლა' }, { timeout: 15000 })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('ამ გარემოში ჯერ არ არის ხელმისაწვდომი');
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
  fetch.mockRestore();
}, 30000);

it('provides the login link in the landing navigation', () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' });
  expect(within(nav).getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
});

function setup() {
  let listener: (event: string, session: { user: { id: string } } | null) => void = () => {};
  const unsubscribe = vi.fn();
  const getSession = vi.fn(async () => ({ data: { session: null }, error: null }));
  const signInWithPassword = vi.fn(async (_credentials: unknown) => ({ data: { session: { user: { id: 'test' } } }, error: null }));
  const signOut = vi.fn(async () => ({ error: null }));
  const client = { auth: { onAuthStateChange: (fn: typeof listener) => { listener = fn; return { data: { subscription: { unsubscribe } } }; }, getSession, signInWithPassword, signOut } } as unknown as SupabaseClient;
  return { client, getSession, signInWithPassword, signOut, unsubscribe, emit: (signedIn: boolean) => act(() => listener('change', signedIn ? { user: { id: 'test' } } : null)) };
}
function fill() {
  fireEvent.change(screen.getByLabelText('ელფოსტა'), { target: { value: ' user@gmail.com ' } });
  fireEvent.change(screen.getByLabelText('პაროლი'), { target: { value: 'example-password' } });
}

it('uses CAPTCHA and the shared password session, then offers role-neutral destinations and sign out', async () => {
  const fake = setup();
  const view = render(<LoginForm client={fake.client} googleClient={fake.client} />);
  fake.emit(false); fill();
  fireEvent.submit(screen.getByRole('form', { name: 'ანგარიშში შესვლის ფორმა' }));
  await waitFor(() => expect(fake.signInWithPassword).toHaveBeenCalledWith({ email: 'user@gmail.com', password: 'example-password', options: { captchaToken: 'auth-token' } }));
  await waitFor(() => expect(security.reset).toHaveBeenCalled());
  expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
  fake.emit(true);
  expect(await screen.findByText('ანგარიშში შესული ხართ. აირჩიეთ თქვენი სივრცე.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'მოსწავლე' }).getAttribute('href')).toBe('#/student');
  expect(screen.getByText(/ავტომატურად არ ანიჭებს/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'ანგარიშიდან გასვლა' }));
  await waitFor(() => expect(fake.signOut).toHaveBeenCalledTimes(1));
  fake.emit(false);
  expect(await screen.findByLabelText('ელფოსტა')).toBeTruthy();
  view.unmount(); expect(fake.unsubscribe).toHaveBeenCalled();
});

it('handles failed password attempts without showing a signed-in state or leaking errors', async () => {
  const fake = setup(); fake.signInWithPassword.mockResolvedValueOnce({ data: { session: null }, error: new Error('secret provider error') } as never);
  render(<LoginForm client={fake.client} googleClient={null} />); fake.emit(false); fill();
  fireEvent.submit(screen.getByRole('form'));
  expect((await screen.findByRole('alert')).textContent).not.toContain('secret provider error');
  expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
  expect(screen.queryByText('ანგარიშში შესული ხართ. აირჩიეთ თქვენი სივრცე.')).toBeNull();
});

it('requires security verification, refuses an existing session, and prevents duplicate submissions', async () => {
  const fake = setup(); let release!: (token: string) => void;
  security.verify.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  render(<LoginForm client={fake.client} googleClient={fake.client} />); fake.emit(false); fill();
  const form = screen.getByRole('form'); fireEvent.submit(form); fireEvent.submit(form);
  expect(security.verify).toHaveBeenCalledTimes(1);
  expect((screen.getByRole('button', { name: 'Google-ით გაგრძელება' }) as HTMLButtonElement).disabled).toBe(true);
  fake.getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'other' } } }, error: null } as never);
  release('auth-token');
  await screen.findByRole('alert');
  expect(fake.signInWithPassword).not.toHaveBeenCalled();
  expect(security.reset).toHaveBeenCalled();
});

it('does not submit when CAPTCHA is unavailable and starts the existing Google flow when configured', async () => {
  security.ready = false;
  const fake = setup(); render(<LoginForm client={fake.client} googleClient={fake.client} />); fake.emit(false); fill();
  expect((screen.getByRole('button', { name: 'შესვლა' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.submit(screen.getByRole('form')); expect(fake.signInWithPassword).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Google-ით გაგრძელება' }));
  await waitFor(() => expect(google).toHaveBeenCalledWith(fake.client, window.location.origin, window.location.pathname, window.sessionStorage));
  expect(screen.getByText(/შეიძლება შექმნას ანგარიში/)).toBeTruthy();
});

it('does not send a password if CAPTCHA verification fails', async () => {
  const fake = setup(); security.verify.mockRejectedValueOnce(new Error('verification failed'));
  render(<LoginForm client={fake.client} googleClient={null} />); fake.emit(false); fill();
  fireEvent.submit(screen.getByRole('form'));
  await screen.findByRole('alert');
  expect(fake.signInWithPassword).not.toHaveBeenCalled();
  expect(security.reset).toHaveBeenCalled();
});

it('allows retry after Google initiation fails and never exposes provider error details', async () => {
  const fake = setup(); google.mockRejectedValueOnce(new Error('sensitive provider details'));
  render(<LoginForm client={fake.client} googleClient={fake.client} />); fake.emit(false);
  fireEvent.click(screen.getByRole('button', { name: 'Google-ით გაგრძელება' }));
  expect((await screen.findByRole('alert')).textContent).not.toContain('sensitive provider details');
  expect((screen.getByRole('button', { name: 'Google-ით გაგრძელება' }) as HTMLButtonElement).disabled).toBe(false);
});
