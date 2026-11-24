import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ACCOUNT_MODE, TEST_ACCOUNT_MODE } from '../student/accountMode';
import { authCallbackUrl } from './trustedAuthCallback';

/** Separate recovery auth storage prevents a reset from changing the signed-in
 * app account. PKCE verifiers survive a new tab on the same device. Recovery
 * sessions stay in memory; a random client key also isolates SDK broadcasts. */
export function makeRecoveryClient(url: string, key: string): SupabaseClient {
  const canonical = `axiom-recovery-${encodeURIComponent(url)}`;
  const bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes);
  const instanceKey = `${canonical}-${Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('')}`;
  const memory = new Map<string, string>();
  const verifierKey = (name: string) => `${canonical}${name.slice(instanceKey.length)}`;
  const isVerifier = (name: string) => name.startsWith(instanceKey) && name.endsWith('-code-verifier');
  const storage = {
    getItem: (name: string) => isVerifier(name) ? window.localStorage.getItem(verifierKey(name)) : memory.get(name) ?? null,
    setItem: (name: string, value: string) => { if (isVerifier(name)) window.localStorage.setItem(verifierKey(name), value); else memory.set(name, value); },
    removeItem: (name: string) => { if (isVerifier(name)) window.localStorage.removeItem(verifierKey(name)); else memory.delete(name); },
  };
  return createClient(url, key, { auth: { storage, storageKey: instanceKey, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'pkce' } });
}

/** Intentionally off in the public preview and until the recovery rollout is reviewed. */
export const recoveryClient: SupabaseClient | null = (() => {
  if (TEST_ACCOUNT_MODE || ACCOUNT_MODE === 'invalid' || import.meta.env.VITE_PASSWORD_RECOVERY_ENABLED !== 'true') return null;
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key?.startsWith('sb_publishable_')) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || !window.crypto?.subtle || !window.crypto.getRandomValues) return null;
    // The storage objects can throw when blocked; fail closed rather than fall back.
    window.localStorage.getItem('axiom-recovery-check');
    return makeRecoveryClient(url, key);
  } catch { return null; }
})();

export interface RecoveryCallback { code: string | null }
export { consumeRecoveryCallback } from './authCallbacks';

/** The request must use a fixed same-origin callback, never a caller-supplied redirect. */
export async function requestRecovery(client: SupabaseClient, email: string, origin: string, pathname: string, captchaToken?: string): Promise<void> {
  const callback = authCallbackUrl(origin, pathname, 'recovery');
  const result = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback, ...(captchaToken ? { captchaToken } : {}) });
  if (result.error) throw new Error('Recovery request failed');
}

export type RecoveryReady = { userId: string };
/** The SDK marks the locally created PKCE verifier as a recovery flow. A normal
 * sign-in code or an existing session is never sufficient to enter this flow. */
export async function exchangeRecovery(client: SupabaseClient | null, callback: RecoveryCallback): Promise<RecoveryReady> {
  if (!client || !callback.code) throw new Error('Recovery unavailable');
  let recoveryUser: string | null = null;
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') recoveryUser = session?.user?.id ?? null;
  });
  let result;
  try { result = await client.auth.exchangeCodeForSession(callback.code); }
  finally { subscription.unsubscribe(); }
  if (result.error || !result.data.user?.id || !result.data.session || recoveryUser !== result.data.user.id) {
    if (!result.error) await client.auth.signOut({ scope: 'local' }).catch(() => {});
    throw new Error('Recovery unavailable');
  }
  const userId = result.data.user.id;
  const verified = await client.auth.getUser();
  if (verified.error || verified.data.user?.id !== userId) {
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
    throw new Error('Recovery unavailable');
  }
  return { userId };
}

export async function updateRecoveryPassword(client: SupabaseClient, ready: RecoveryReady, password: string): Promise<'signed-out' | 'signout-failed'> {
  const user = await client.auth.getUser();
  if (user.error || user.data.user?.id !== ready.userId) throw new Error('Recovery session changed');
  const result = await client.auth.updateUser({ password });
  if (result.error || result.data.user?.id !== ready.userId) throw new Error('Password update failed');
  try { const out = await client.auth.signOut({ scope: 'local' }); return out.error ? 'signout-failed' : 'signed-out'; }
  catch { return 'signout-failed'; }
}
