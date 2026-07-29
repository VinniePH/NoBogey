/**
 * User seed script — future seed entry point for sample golfer and caddie profiles.
 *
 * Expected inputs/outputs: optional seed options in, inserted sample profile summary out.
 * Supabase target (future): auth.users, profiles, golfer_profiles, and caddie_profiles tables.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
/** Seed sample users. Will invoke Supabase CLI/MCP only once auth/profile schema is approved. */
export async function seedUsers(): Promise<void> {
  // TODO(supabase): create test auth users and matching golfer/caddie profiles.
  throw new Error('Not implemented');
}

