/**
 * Tee-time seed script — future generator for sample bookable tee-time slots.
 *
 * Expected inputs/outputs: optional course/date settings in, generated slot summary out.
 * Supabase target (future): tee_times table.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
/** Seed tee times. Will generate and insert open slots after tee-time schema is finalized. */
export async function seedTeeTimes(): Promise<void> {
  // TODO(supabase): shell out to seed SQL or insert generated tee_times through CLI/MCP.
  throw new Error('Not implemented');
}

