// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ auth: vi.fn(), from: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: { auth: { onAuthStateChange: calls.auth }, from: calls.from } } }));
import { StudentApp } from '../src/student/StudentApp';

beforeEach(() => { window.location.hash = '#/student/practice'; localStorage.clear(); window.scrollTo = vi.fn(); calls.auth.mockClear(); calls.from.mockClear(); });
afterEach(() => { cleanup(); localStorage.clear(); window.location.hash = ''; });
it('uses an isolated writable test session and never connects to real account APIs', async () => {
  const old = '{"version":1,"attempts":[]}';
  localStorage.setItem('axiom-academy.practice.v1', old);
  localStorage.setItem('axiom-academy.practice.draft.v1', '{"old":"draft"}');
  render(<StudentApp />);
  fireEvent.click(screen.getAllByRole('tab')[0]);
  fireEvent.click((await screen.findAllByRole('button', { name: /დაწყება/ }))[0]);
  const options = await screen.findByRole('group', { name: 'პასუხის ვარიანტები' });
  fireEvent.click(within(options).getAllByRole('button')[0]);
  await waitFor(() => expect(localStorage.getItem('axiom-academy.test.practice.draft.v1')).toBeTruthy());
  expect(localStorage.getItem('axiom-academy.practice.v1')).toBe(old);
  expect(localStorage.getItem('axiom-academy.practice.draft.v1')).toBe('{"old":"draft"}');
  expect(calls.auth).not.toHaveBeenCalled();
  expect(calls.from).not.toHaveBeenCalled();
});

it('shows the actual test profile on the achievement dashboard without claiming progress', async () => {
  window.location.hash = '#/student/achievements';
  render(<StudentApp />);
  expect(await screen.findByRole('heading', { name: 'სატესტო მოსწავლე' })).toBeTruthy();
  expect(screen.getByRole('link', { name: /პროფილის ნახვა/ }).getAttribute('href')).toBe('#/student/profile');
  expect(screen.getAllByRole('button', { name: /პროგრესი მიუწვდომელია, იხილე პირობები/ })).toHaveLength(28);
  expect(screen.queryByRole('progressbar')).toBeNull();
  expect(calls.auth).not.toHaveBeenCalled();
  expect(calls.from).not.toHaveBeenCalled();
});
