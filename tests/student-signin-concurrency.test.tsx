// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../src/student/session', () => ({ useStudentSession: () => ({
  signOut: vi.fn(), mode: 'connected', status: 'ready', error: null, signedIn: false,
}) }));
import { StudentSignIn } from '../src/student/StudentSignIn';
afterEach(cleanup);
it('directs signed-out students to email sign-in', () => {
  render(<StudentSignIn />);
  expect(screen.getByText(/შედი ელფოსტითა და პაროლით/)).toBeTruthy();
  expect(screen.getByRole('link',{name:'ანგარიშში შესვლა ან სივრცის არჩევა'}).getAttribute('href')).toBe('#/account/login');
  expect(screen.queryByRole('button', { name: 'Google-ით გაგრძელება' })).toBeNull();
});
