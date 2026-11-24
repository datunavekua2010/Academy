// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ signedIn: false, status: 'ready', error: null as string | null }));
vi.mock('../src/student/session', () => ({ useStudentSession: () => ({
  signInWithPassword: vi.fn(), signOut: vi.fn(), mode: 'connected', status: fixture.status, error: fixture.error, signedIn: fixture.signedIn,
}) }));
vi.mock('../src/account/TurnstileReview', () => ({ useTurnstileReview: () => ({
  widgets: null, ready: true, verify: vi.fn(), reset: vi.fn(),
}) }));
vi.mock('../src/lib/passwordRecovery', () => ({ recoveryClient: null }));
vi.mock('../src/lib/accountSignup', () => ({ signupClient: null }));
vi.mock('../src/lib/googleAuth', () => ({ googleAuthClient: {} }));
import { StudentSignIn } from '../src/student/StudentSignIn';

afterEach(() => { cleanup(); fixture.signedIn = false; fixture.status = 'ready'; fixture.error = null; });

it('offers Google or password when signed out', () => {
  render(<StudentSignIn />);
  expect(screen.getByText('შედი ელფოსტითა და პაროლით ან Google-ით.')).toBeTruthy();
  expect(screen.getByLabelText('პაროლი')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Google-ით გაგრძელება' })).toBeTruthy();
});

it('does not ask an already signed-in user for an academy password when student access cannot be verified', () => {
  fixture.signedIn = true;
  fixture.status = 'error';
  fixture.error = 'მოსწავლის პროფილი ვერ ჩაიტვირთა. დაუკავშირდი აკადემიას.';
  render(<StudentSignIn />);
  expect(screen.getByText('უკვე შესული ხარ. მოსწავლის სივრცეზე წვდომა ჯერ ვერ დადასტურდა. დაუკავშირდი აკადემიას.')).toBeTruthy();
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Google-ით გაგრძელება' })).toBeNull();
  expect(screen.getByRole('button', { name: 'ანგარიშიდან გასვლა' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'ანგარიშის ნომერი' })).toBeTruthy();
});
