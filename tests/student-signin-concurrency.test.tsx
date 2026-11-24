// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ signIn: vi.fn(), verify: vi.fn(), reset: vi.fn() }));
vi.mock('../src/student/session', () => ({ useStudentSession: () => ({
  signInWithPassword: fixture.signIn, signOut: vi.fn(), mode: 'connected', status: 'ready', error: null, signedIn: false,
}) }));
vi.mock('../src/account/TurnstileReview', () => ({ useTurnstileReview: () => ({
  widgets: null, ready: true, verify: fixture.verify, reset: fixture.reset,
}) }));
vi.mock('../src/lib/passwordRecovery', () => ({ recoveryClient: null }));
vi.mock('../src/lib/accountSignup', () => ({ signupClient: null }));
vi.mock('../src/lib/googleAuth', () => ({ googleAuthClient: null }));
import { StudentSignIn } from '../src/student/StudentSignIn';
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('ignores a second submit while CAPTCHA verification is pending', async () => {
  let release!: (value: string) => void;
  fixture.verify.mockImplementation(() => new Promise<string>(resolve => { release = resolve; }));
  fixture.signIn.mockResolvedValue(undefined);
  render(<StudentSignIn />);
  fireEvent.change(screen.getByLabelText('ელფოსტა'), { target: { value: ' student@example.test ' } });
  fireEvent.change(screen.getByLabelText('პაროლი'), { target: { value: 'test-password' } });
  const form = screen.getByLabelText('პაროლი').closest('form')!;
  act(() => { fireEvent.submit(form); fireEvent.submit(form); });
  expect(fixture.verify).toHaveBeenCalledTimes(1);
  expect(fixture.reset).not.toHaveBeenCalled();
  await act(async () => { release('synthetic-token'); });
  await waitFor(() => expect(fixture.signIn).toHaveBeenCalledTimes(1));
  expect(fixture.signIn).toHaveBeenCalledWith('student@example.test', 'test-password', 'synthetic-token');
  expect(fixture.reset).toHaveBeenCalledTimes(1);
  expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
});
