/** A production build without a mode must not silently present sample data as
 * a signed-in account. Explicit preview builds remain local-only. */
export function selectAccountMode(value: string | undefined, production = false): 'preview' | 'connected' | 'invalid' {
  if (value === undefined || value === '') return production ? 'invalid' : 'preview';
  if (value === 'preview') return 'preview';
  if (value === 'connected') return 'connected';
  return 'invalid';
}
export const ACCOUNT_MODE = selectAccountMode(import.meta.env.VITE_ACCOUNT_MODE, import.meta.env.PROD);
export const TEST_ACCOUNT_MODE = ACCOUNT_MODE === 'preview';
/** Isolated local storage owner; never a Supabase user ID. */
export const TEST_ACCOUNT_ID = 'axiom-test-preview-v1';
