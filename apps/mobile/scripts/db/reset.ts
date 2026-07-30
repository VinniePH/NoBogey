/**
 * Database reset script — future local-development reset entry point.
 *
 * Expected inputs/outputs: no input, reset/migration result out.
 * Supabase target (future): local Supabase database, migrations, and seed.sql.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
/** Reset the local database. Will run `supabase db reset` after migrations and seed data exist. */
export async function resetDatabase(): Promise<void> {
  // TODO(supabase): execute `supabase db reset` through a controlled child-process wrapper.
  throw new Error('Not implemented');
}

