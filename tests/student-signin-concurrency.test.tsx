// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../src/student/session', () => ({ useStudentSession: () => ({
  signOut: vi.fn(), mode: 'connected', status: 'ready', error: null, signedIn: false,
}) }));
vi.mock('../src/lib/googleAuth', () => ({ googleAuthClient: null }));
import { StudentSignIn } from '../src/student/StudentSignIn';
afterEach(cleanup);
it('reports Google unavailable rather than offering a password fallback', () => {
  render(<StudentSignIn />);
  expect(screen.getByText(/Google-ით შესვლა ამ გარემოში ამჟამად მიუწვდომელია/)).toBeTruthy();
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Google-ით გაგრძელება' })).toBeNull();
});
