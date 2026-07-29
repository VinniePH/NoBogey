/**
 * Shared config — future environment/config boundary for the mobile backend modules.
 *
 * Expected inputs/outputs: application config source in, non-secret configuration shape out.
 * Supabase target (future): Supabase project URL and publishable client key environment values.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export interface BackendConfig {
  supabaseUrl: string | null;
  supabasePublishableKey: string | null;
}

/** Read backend configuration. Will read Expo-safe public environment variables without embedding secrets. */
export function getBackendConfig(): BackendConfig {
  // TODO(supabase): read EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
  throw new Error('Not implemented');
}

