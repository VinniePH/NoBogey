/**
 * Matching service — extension point for selecting a caddie by availability and golfer playstyle fit.
 *
 * Expected inputs/outputs: golfer and candidate caddie IDs plus booking context in, ranked candidates out.
 * Supabase target (future): golfer_profiles, caddie_profiles, caddie_availability, and match_caddie RPC.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: rank eligible caddies by playstyle compatibility after availability has been checked.
 */
import type { CaddieCandidate } from '../caddies/caddies.types';
import { getAvailableCaddies } from '../caddies/caddies.service';

/** Match a golfer with compatible available caddies. Will combine profile fit and availability signals. */
export async function matchCaddiesForGolfer(
  _golferId: string,
  courseId: string,
  startsAt: string,
): Promise<CaddieCandidate[]> {
  return getAvailableCaddies(courseId, startsAt);
}

