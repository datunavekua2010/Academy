import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TEST_ACCOUNT_MODE } from '../student/accountMode';

export type SupabaseConfiguration =
  | { mode: 'unconfigured'; client: null }
  | { mode: 'invalid'; client: null }
  | { mode: 'connected'; client: SupabaseClient };

/** Missing, partial or invalid configuration never creates a fake student session. */
export function createSupabaseConfiguration(url?: string, publishableKey?: string): SupabaseConfiguration {
  const endpoint = url?.trim() ?? '';
  const key = publishableKey?.trim() ?? '';
  if (!endpoint && !key) return { mode: 'unconfigured', client: null };
  if (!endpoint || !key || !key.startsWith('sb_publishable_')) return { mode: 'invalid', client: null };
  try {
    const parsed = new URL(endpoint);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
      return { mode: 'invalid', client: null };
    }
    return { mode: 'connected', client: createClient(endpoint, key) };
  } catch {
    return { mode: 'invalid', client: null };
  }
}

// The temporary test account must not restore an existing Supabase session,
// contact the real service, or expose real account data, even if env vars exist.
export const supabaseConfiguration: SupabaseConfiguration = TEST_ACCOUNT_MODE
  ? { mode: 'unconfigured', client: null }
  : createSupabaseConfiguration(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
