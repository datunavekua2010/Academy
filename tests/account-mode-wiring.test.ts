// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ auth: {} })) }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('connected account wiring', () => {
  it('suppresses the backend and parent/operator UI in the default preview', async () => {
    vi.stubEnv('VITE_ACCOUNT_MODE', 'preview');
    vi.stubEnv('VITE_PARENT_ENABLED', ''); vi.stubEnv('VITE_ADMIN_ENABLED', '');
    const [{supabaseConfiguration}, parent, admin] = await Promise.all([
      import('../src/lib/supabase'), import('../src/parent/data'), import('../src/admin/data'),
    ]);
    expect(supabaseConfiguration).toEqual({mode:'unconfigured',client:null});
    expect(parent.PARENT_REVIEW_ENABLED).toBe(false); expect(admin.ADMIN_REVIEW_ENABLED).toBe(false);
  });
  it('creates the public connected client and exposes only explicitly selected screens', async () => {
    vi.stubEnv('VITE_ACCOUNT_MODE', 'connected');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('VITE_PARENT_ENABLED', 'true'); vi.stubEnv('VITE_ADMIN_ENABLED', 'true');
    const [{supabaseConfiguration}, parent, admin] = await Promise.all([
      import('../src/lib/supabase'), import('../src/parent/data'), import('../src/admin/data'),
    ]);
    expect(supabaseConfiguration.mode).toBe('connected');
    expect(parent.PARENT_REVIEW_ENABLED).toBe(true); expect(admin.ADMIN_REVIEW_ENABLED).toBe(true);
  });
  it('does not create a backend or isolated signup/recovery clients with an invalid mode', async () => {
    vi.stubEnv('VITE_ACCOUNT_MODE', 'conected');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('VITE_ACCOUNT_SIGNUP_REVIEW', 'true'); vi.stubEnv('VITE_PASSWORD_RECOVERY_ENABLED', 'true');
    const [main, signup, recovery] = await Promise.all([
      import('../src/lib/supabase'), import('../src/lib/accountSignup'), import('../src/lib/passwordRecovery'),
    ]);
    expect(main.supabaseConfiguration).toEqual({mode:'invalid',client:null});
    expect(signup.signupClient).toBeNull(); expect(recovery.recoveryClient).toBeNull();
  });
});
