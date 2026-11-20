import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Unit tests must never use an operator's local Supabase credentials or contact
// their project. Connected-mode tests supply explicit mocked clients instead.
export default mergeConfig(viteConfig, defineConfig({
  test: { setupFiles: ['./tests/setup-env.ts'] },
}));
