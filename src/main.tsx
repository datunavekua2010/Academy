import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Entry } from './Entry';
import { LoadingScreen } from './components/LoadingScreen';
import { consumeGoogleCallback, consumeGoogleProofCallback, consumeRecoveryCallback, consumeSignupCallback } from './lib/authCallbacks';

// Scrub Auth codes/errors before any dynamic import, rendering or Auth request.
const google = consumeGoogleCallback(window.location.href, window.history);
const proof = google ? null : consumeGoogleProofCallback(window.location.href, window.history);
const recovery = google || proof ? null : consumeRecoveryCallback(window.location.href, window.history);
const signup = google || proof || recovery ? null : consumeSignupCallback(window.location.href, window.history);
const root = createRoot(document.getElementById('root')!);
const callback = google ? { kind: 'google' as const, value: google }
  : proof ? { kind: 'proof' as const, value: proof }
  : recovery ? { kind: 'recovery' as const, value: recovery }
  : signup ? { kind: 'signup' as const, value: signup } : null;
if (callback) {
  root.render(<LoadingScreen message="ანგარიში მოწმდება…" />);
  void import('./authBootstrap').then(module => module.renderAuthCallback(root, callback)).catch(() => {
    root.render(<main role="alert">ანგარიშის შემოწმება ვერ მოხერხდა. სცადეთ ხელახლა.</main>);
  });
} else {
  root.render(<StrictMode><Entry /></StrictMode>);
}
