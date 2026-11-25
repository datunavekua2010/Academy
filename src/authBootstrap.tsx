import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { Shell } from './Shell';
import { exchangeRecovery, recoveryClient } from './lib/passwordRecovery';
import type { RecoveryResult } from './account/PasswordRecovery';
import { exchangeSignup, signupClient } from './lib/accountSignup';
import type { SignupResult } from './account/Signup';
type AuthCallback = { kind: 'google' | 'recovery' | 'signup'; value: { code: string | null } } | { kind: 'proof'; value: 'ok' | 'error' };
/** Legacy callbacks are scrubbed by main; Google sign-in is no longer offered. */
export function renderAuthCallback(root: Root, callback: AuthCallback): void {
  if (callback.kind === 'google' || callback.kind === 'proof') {
    root.render(<StrictMode><Shell /></StrictMode>);
    return;
  }
  const recovery: Promise<RecoveryResult> | null = callback.kind === 'recovery'
    ? exchangeRecovery(recoveryClient, callback.value).then(ready => ({ ready }), () => ({ error: true })) : null;
  const signup: Promise<SignupResult> | null = callback.kind === 'signup'
    ? exchangeSignup(signupClient, callback.value).then(() => ({ ok: true }), () => ({ error: true })) : null;
  root.render(<StrictMode><Shell recovery={recovery} signup={signup} /></StrictMode>);
}
