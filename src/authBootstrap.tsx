import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { Shell } from './Shell';
import { exchangeRecovery, recoveryClient } from './lib/passwordRecovery';
import type { RecoveryResult } from './account/PasswordRecovery';
import { exchangeSignup, signupClient } from './lib/accountSignup';
import type { SignupResult } from './account/Signup';
import { finishGoogleAuth, googleAuthClient } from './lib/googleAuth';
import { GoogleCallback } from './account/GoogleAuth';
import { useHashRoute } from './router';

function GoogleCallbackRoute({ result }: { result: 'ok' | 'error' }) {
  const path = useHashRoute();
  return path === '/account/google' ? <GoogleCallback result={result} /> : <Shell />;
}

type AuthCallback = { kind: 'google' | 'recovery' | 'signup'; value: { code: string | null } };
/** The caller already scrubbed the callback URL; this runs exactly once outside React effects. */
export function renderAuthCallback(root: Root, callback: AuthCallback): void {
  if (callback.kind === 'google') {
    void Promise.resolve().then(() => finishGoogleAuth(googleAuthClient, callback.value, window.sessionStorage))
      .then(() => root.render(<GoogleCallbackRoute result="ok" />), () => root.render(<GoogleCallbackRoute result="error" />));
    return;
  }
  const recovery: Promise<RecoveryResult> | null = callback.kind === 'recovery'
    ? exchangeRecovery(recoveryClient, callback.value).then(ready => ({ ready }), () => ({ error: true })) : null;
  const signup: Promise<SignupResult> | null = callback.kind === 'signup'
    ? exchangeSignup(signupClient, callback.value).then(() => ({ ok: true }), () => ({ error: true })) : null;
  root.render(<StrictMode><Shell recovery={recovery} signup={signup} /></StrictMode>);
}
