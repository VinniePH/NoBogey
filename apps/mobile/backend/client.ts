/**
 * Supabase client placeholder — future composition point for a single mobile Supabase client.
 *
 * Expected inputs/outputs: backend configuration in, typed Supabase client out.
 * Supabase target (future): project REST/Auth client; no table is queried here.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: initialize createClient with public Expo environment values after project linking.
 */

/** Get the mobile Supabase client. Will initialize and return the configured Supabase JS client. */
export function getSupabaseClient(): null {
  // TODO(supabase): return createClient(url, publishableKey) after live project setup.
  throw new Error('Not implemented');
}

