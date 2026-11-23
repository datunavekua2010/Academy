import { TEST_ACCOUNT_MODE } from '../student/accountMode';

/** Client-side defense in depth. Supabase's server-side redirect allowlist is still required. */
export function validateAuthCallback(origin: string, pathname: string, marker: 'signup' | 'recovery' | 'google_auth', pinnedOrigin: string | undefined, requirePinned: boolean): string {
  const callback = new URL(pathname, origin);
  if (callback.origin !== origin || (callback.protocol !== 'https:' && callback.hostname !== 'localhost' && callback.hostname !== '127.0.0.1')) throw new Error('Invalid callback');
  if (requirePinned) {
    const configured = pinnedOrigin;
    if (!configured) throw new Error('Auth callback not configured');
    const expected = new URL(configured);
    if (expected.protocol !== 'https:' || expected.origin !== configured || expected.username || expected.password || callback.origin !== expected.origin || callback.pathname !== '/') throw new Error('Invalid callback');
  }
  callback.search = `?${marker}=1`; callback.hash = '';
  return callback.toString();
}

export function authCallbackUrl(origin: string, pathname: string, marker: 'signup' | 'recovery' | 'google_auth'): string {
  return validateAuthCallback(origin, pathname, marker, import.meta.env.VITE_AUTH_CALLBACK_ORIGIN, !TEST_ACCOUNT_MODE);
}
