import type { SupabaseClient } from '@supabase/supabase-js';
import { TEST_ACCOUNT_MODE } from '../student/accountMode';
import { supabaseConfiguration } from './supabase';
import { authCallbackUrl } from './trustedAuthCallback';

/** Separate, opt-in review flag. Google authenticates an identity, never an Academy role. */
export const googleAuthClient = !TEST_ACCOUNT_MODE && import.meta.env.VITE_GOOGLE_AUTH_REVIEW === 'true'
  ? supabaseConfiguration.client : null;
const pendingKey = 'axiom-google-auth-pending';
type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Only an existing signed-out session may start this flow; never silently replace an account. */
export async function startGoogleAuth(client: SupabaseClient, origin: string, pathname: string, storage: StorageAccess): Promise<void> {
  const callback = authCallbackUrl(origin, pathname, 'google_auth');
  const current = await client.auth.getSession();
  if (current.error || current.data.session) throw new Error('Sign out first');
  storage.setItem(pendingKey, '1');
  try {
    const result = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback } });
    if (result.error || !result.data.url) throw new Error('Google auth unavailable');
  } catch (error) { storage.removeItem(pendingKey); throw error; }
}

export { consumeGoogleCallback } from './authCallbacks';

/** PKCE verifier is managed by the main Supabase client. Complete before mounting app views. */
export async function finishGoogleAuth(client: SupabaseClient | null, callback: {code:string|null}, storage: StorageAccess): Promise<void> {
  const pending = storage.getItem(pendingKey) === '1';
  storage.removeItem(pendingKey);
  if (!client || !pending || !callback.code) throw new Error('Google auth unavailable');
  const existing = await client.auth.getSession();
  if (existing.error || existing.data.session) throw new Error('Sign out first');
  const result = await client.auth.exchangeCodeForSession(callback.code);
  if (result.error || !result.data.session || !result.data.user?.id) {
    if (result.data?.session) await client.auth.signOut({ scope: 'local' }).catch(() => {});
    throw new Error('Google auth unavailable');
  }
  try {
    const verified = await client.auth.getUser();
    if (verified.error || verified.data.user?.id !== result.data.user.id || !verified.data.user.email_confirmed_at) throw new Error('Google auth unavailable');
  } catch (error) {
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    throw error;
  }
}
