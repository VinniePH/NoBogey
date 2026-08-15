import { describe, expect, it } from 'vitest';
import { resolveBackendConfig } from './config';

describe('resolveBackendConfig', () => {
  it('returns the public Supabase client configuration', () => {
    expect(resolveBackendConfig({
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
    })).toEqual({
      supabasePublishableKey: 'sb_publishable_test',
      supabaseUrl: 'https://example.supabase.co'
    });
  });

  it('rejects missing values', () => {
    expect(() => resolveBackendConfig({})).toThrow('Supabase is not configured');
  });

  it('rejects a relative project URL', () => {
    expect(() => resolveBackendConfig({
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      EXPO_PUBLIC_SUPABASE_URL: 'example.supabase.co'
    })).toThrow('absolute HTTP(S) URL');
  });
});
