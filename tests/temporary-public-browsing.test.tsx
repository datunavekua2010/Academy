// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

vi.mock('../src/student/accountMode', () => ({ TEST_ACCOUNT_MODE: false, ACCOUNT_MODE: 'connected', TEST_ACCOUNT_ID: 'axiom-test-preview-v1' }));
const realAccess = vi.hoisted(() => ({
  getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
  onAuthStateChange: vi.fn((callback: (event: string, session: null) => void) => {
    callback('INITIAL_SESSION', null);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  }),
  from: vi.fn(),
}));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: { auth: realAccess, from: realAccess.from } } }));
vi.mock('../src/lib/accountSignup', async importOriginal => ({ ...await importOriginal<typeof import('../src/lib/accountSignup')>(), signupClient: {} }));
import { Entry } from '../src/Entry';
import { navigate } from '../src/router';
function go(path: string) { window.location.hash = path; fireEvent(window, new HashChangeEvent('hashchange')); }
beforeEach(() => { window.location.hash = ''; localStorage.clear(); window.scrollTo = vi.fn(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); window.location.hash = ''; localStorage.clear(); });

it('keeps both previews isolated and their links inside preview routes', async () => {
  render(<Entry />);
  expect(screen.getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
  expect(screen.getByRole('link', { name: /მოსწავლე/ }).getAttribute('href')).toBe('#/preview/student');
  go('#/preview/student');
  expect(await screen.findByRole('button', { name: 'Axi-ს ნავიგაციის გახსნა' }, { timeout: 10000 })).toBeTruthy();
  expect(screen.getByText(/ადგილობრივი სივრცე · დავალებები სანიმუშოა/)).toBeTruthy();
  const footer = screen.getByRole('navigation', { name: 'სწრაფი ნავიგაცია' });
  expect(within(footer).getAllByRole('link').every(link => link.getAttribute('href')?.startsWith('#/preview/student'))).toBe(true);
  go('#/preview/teacher');
  const nav = await screen.findByRole('navigation', { name: 'მასწავლებლის ნავიგაცია' });
  expect(within(nav).getAllByRole('link').every(link => link.getAttribute('href')?.startsWith('#/preview/teacher/'))).toBe(true);
  expect(screen.getByText(/ეს არ არის ანგარიში/)).toBeTruthy();
  go('#/preview/teacher/students/test-student');
  fireEvent.click(await screen.findByRole('button', { name: /პროგრესის ანგარიშის შექმნა/ }));
  expect(window.location.hash).toBe('#/preview/teacher/progress-reports/test-student');
  expect(realAccess.getUser).not.toHaveBeenCalled();
  expect(realAccess.onAuthStateChange).not.toHaveBeenCalled();
  expect(realAccess.from).not.toHaveBeenCalled();
});

it('restores email login and signup instead of replacing them with previews', async () => {
  render(<Entry />);
  go('#/account/login');
  expect(await screen.findByLabelText('პაროლი', {}, { timeout: 10000 })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'ანგარიშის შექმნა' }).getAttribute('href')).toBe('#/account/register');
  go('#/account/register');
  expect(await screen.findByRole('heading', { name: 'ანგარიშის შექმნა' })).toBeTruthy();
  expect(screen.getByRole('option', { name: 'მოსწავლე' })).toBeTruthy();
  expect(screen.getByRole('option', { name: 'მშობელი' })).toBeTruthy();
});

it('uses actual account gates on normal student and teacher routes', async () => {
  render(<Entry />);
  go('#/student');
  expect(await screen.findByText('ანგარიშში შესვლა ან სივრცის არჩევა', {}, { timeout: 10000 })).toBeTruthy();
  expect(screen.queryByText(/ადგილობრივი სივრცე · დავალებები სანიმუშოა/)).toBeNull();
  expect(realAccess.onAuthStateChange).toHaveBeenCalled();
  go('#/teacher');
  expect(await screen.findByRole('heading', { name: 'მასწავლებლის სივრცე' })).toBeTruthy();
  expect(screen.queryByText(/ეს არ არის ანგარიში/)).toBeNull();
  expect(realAccess.getUser).toHaveBeenCalled();
});

it('only rewrites student and teacher destinations while inside previews', () => {
  go('#/preview/student');
  navigate('/student/homework');
  expect(window.location.hash).toBe('#/preview/student/homework');
  navigate('/account/login');
  expect(window.location.hash).toBe('#/account/login');
  navigate('/teacher');
  expect(window.location.hash).toBe('#/teacher');
});
