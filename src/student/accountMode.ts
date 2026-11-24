/** Production uses the site's configured login; only an explicit preview may
 * present a sample account there. Client creation still validates the URL/key. */
export function selectAccountMode(value: string | undefined, production = false, hasProjectSettings = false): 'preview' | 'connected' | 'invalid' {
  if (value === undefined || value === '') {
    if (!production) return 'preview';
    return hasProjectSettings ? 'connected' : 'invalid';
  }
  if (value === 'preview') return 'preview';
  if (value === 'connected') return 'connected';
  return 'invalid';
}
export const ACCOUNT_MODE = selectAccountMode(
  import.meta.env.VITE_ACCOUNT_MODE,
  import.meta.env.PROD,
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
);
export const TEST_ACCOUNT_MODE = ACCOUNT_MODE === 'preview';
/** Isolated local storage owner; never a Supabase user ID. */
export const TEST_ACCOUNT_ID = 'axiom-test-preview-v1';
