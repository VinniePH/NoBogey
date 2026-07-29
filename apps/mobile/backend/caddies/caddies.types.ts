/**
 * Caddies types — caddie availability, walk-in gap coverage, and matching candidate contracts.
 *
 * Expected inputs/outputs: course/time availability requests in, caddie availability records out.
 * Supabase target (future): caddie_profiles, caddie_availability, and caddie_assignments tables.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export interface CaddieAvailability {
  caddieId: string;
  courseId: string;
  startsAt: string;
  isAvailable: boolean;
  supportsWalkInCoverage: boolean;
}

export interface CaddieCandidate {
  id: string;
  displayName: string;
  playstyleTags: string[];
}

