// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { vi.doUnmock('@supabase/supabase-js'); vi.unstubAllEnvs(); vi.resetModules(); });
it('does not construct a Supabase client in test mode, even with configured credentials', async () => {
  const createClient = vi.fn();
  vi.doMock('@supabase/supabase-js', () => ({ createClient }));
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  vi.resetModules();
  const { supabaseConfiguration } = await import('../src/lib/supabase');
  expect(supabaseConfiguration.client).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
