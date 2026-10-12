/** Matching boundary backed by the canonical eligible-caddie query. */
import type { CaddieCandidate } from '../caddies/caddies.types';
import { getAvailableCaddies } from '../caddies/caddies.service';

/** Match a golfer with compatible available caddies. Will combine profile fit and availability signals. */
export async function matchCaddiesForGolfer(
  _golferId: string,
  _courseId: string,
  teeTimeId: string,
): Promise<CaddieCandidate[]> {
  return getAvailableCaddies(teeTimeId);
}

