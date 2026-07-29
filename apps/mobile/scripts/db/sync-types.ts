/**
 * Type sync script — future generated-database-type workflow for backend modules.
 *
 * Expected inputs/outputs: linked project/schema source in, generated TypeScript types out.
 * Supabase target (future): project schema introspection through `supabase gen types typescript`.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
/** Sync generated types. Will run Supabase type generation after schema and project linkage exist. */
export async function syncSupabaseTypes(): Promise<void> {
  // TODO(supabase): run `supabase gen types typescript` and route output to generated type modules.
  throw new Error('Not implemented');
}

