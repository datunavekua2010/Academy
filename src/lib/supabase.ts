import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export const supabaseConfiguration = createSupabaseConfiguration(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
