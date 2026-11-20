// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ callback: null as null | ((event: string, session: unknown) => void), role: true, profile: true, loginError: false, unsubscribe: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: {
  auth: {
    onAuthStateChange: (callback: typeof mock.callback) => { mock.callback = callback; return { data: { subscription: { unsubscribe: mock.unsubscribe } } }; },
    signInWithPassword: async () => ({ error: mock.loginError ? new Error('bad') : null }),
    signOut: async () => { mock.callback?.('SIGNED_OUT', null); return { error: null }; },
  },
  from: (table: string) => {
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ error: null, data: table === 'profiles' ? (mock.profile ? { display_name: 'Test Student', first_name: 'Test' } : null) : table === 'user_roles' ? (mock.role ? { role: 'student' } : null) : { grade: 6 } }) };
    return query;
  },
} } }));
import { StudentSessionProvider, useStudentSession } from '../src/student/session';
function View() {
  const { student, status, error, signedIn, signOut, signInWithPassword } = useStudentSession();
  return <><p data-testid="status">{status}</p><p data-testid="student">{student ? `${student.id} ${student.grade}` : 'none'}</p><p data-testid="signed">{String(signedIn)}</p><p data-testid="error">{error}</p><button onClick={signOut}>out</button><button onClick={() => void signInWithPassword('test@example.test', 'incorrect')}>in</button></>;
}
beforeEach(() => { mock.callback = null; mock.role = true; mock.profile = true; mock.loginError = false; });
afterEach(() => cleanup());
it('loads an academy-provisioned student, keeps their real grade, and clears the session on sign-out', async () => {
  render(<StudentSessionProvider><View /></StudentSessionProvider>);
  expect(screen.getByTestId('status').textContent).toBe('loading');
  act(() => mock.callback?.('INITIAL_SESSION', { user: { id: 'student-1', email: 'test@example.test' } }));
  await waitFor(() => expect(screen.getByTestId('student').textContent).toBe('student-1 6 კლასი'));
  fireEvent.click(screen.getByText('out'));
  await waitFor(() => expect(screen.getByTestId('student').textContent).toBe('none'));
  expect(screen.getByTestId('signed').textContent).toBe('false');
});
it('fails closed for missing student role and reports login errors', async () => {
  mock.role = false;
  render(<StudentSessionProvider><View /></StudentSessionProvider>);
  act(() => mock.callback?.('INITIAL_SESSION', { user: { id: 'student-1' } }));
  await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  expect(screen.getByTestId('student').textContent).toBe('none');
  expect(screen.getByTestId('error').textContent).toBeTruthy();
  fireEvent.click(screen.getByText('out'));
  mock.loginError = true;
  fireEvent.click(screen.getByText('in'));
  await waitFor(() => expect(screen.getByTestId('error').textContent).toContain('შესვლა ვერ მოხერხდა'));
  expect(screen.getByTestId('student').textContent).toBe('none');
});
