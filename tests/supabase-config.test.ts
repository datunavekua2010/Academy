// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createSupabaseConfiguration } from '../src/lib/supabase';

describe('Supabase browser configuration', () => {
  it('reports missing configuration separately while rejecting partial settings', () => {
    expect(createSupabaseConfiguration().mode).toBe('unconfigured');
    expect(createSupabaseConfiguration('https://example.supabase.co').mode).toBe('invalid');
    expect(createSupabaseConfiguration(undefined, 'sb_publishable_test').mode).toBe('invalid');
  });
  it('rejects non-publishable keys and non-HTTPS URLs', () => {
    expect(createSupabaseConfiguration('https://example.supabase.co', 'sb_secret_test').mode).toBe('invalid');
    expect(createSupabaseConfiguration('http://example.supabase.co', 'sb_publishable_test').mode).toBe('invalid');
    expect(createSupabaseConfiguration('https://example.supabase.co', 'sb_publishable_test').mode).toBe('connected');
  });
});
