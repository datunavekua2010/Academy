import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Shell } from './Shell';
import { consumeRecoveryCallback, exchangeRecovery, recoveryClient } from './lib/passwordRecovery';
import type { RecoveryResult } from './account/PasswordRecovery';
import { consumeSignupCallback,exchangeSignup,signupClient } from './lib/accountSignup';
import type { SignupResult } from './account/Signup';
import { consumeGoogleCallback, finishGoogleAuth, googleAuthClient } from './lib/googleAuth';
import { GoogleCallback } from './account/GoogleAuth';

// One exchange per page load, outside React effects (including StrictMode).
// Remove the code/error from browser history before making any Auth request.
const googleCallback = consumeGoogleCallback(window.location.href, window.history);
const callback = googleCallback ? null : consumeRecoveryCallback(window.location.href, window.history);
const recovery: Promise<RecoveryResult> | null = callback
  ? exchangeRecovery(recoveryClient, callback).then(ready => ({ ready }), () => ({ error: true }))
  : null;

const signupCallback = callback || googleCallback ? null : consumeSignupCallback(window.location.href, window.history);
const signup: Promise<SignupResult> | null = signupCallback ? exchangeSignup(signupClient,signupCallback).then(() => ({ok:true}), () => ({error:true})) : null;

const root = createRoot(document.getElementById('root')!);
if (googleCallback) {
  root.render(<main role="status">მოწმდება…</main>);
  // Exchange before mounting any role-specific view; handle blocked sessionStorage too.
  void Promise.resolve().then(() => finishGoogleAuth(googleAuthClient, googleCallback, window.sessionStorage))
    .then(() => root.render(<GoogleCallback result="ok" />), () => root.render(<GoogleCallback result="error" />));
} else {
  root.render(<StrictMode><Shell recovery={recovery} signup={signup} /></StrictMode>);
}
