/** Canonical, bounded caddie discovery for one published tee time. */
import type { CaddieCandidate } from './caddies.types';
import { getSupabaseClient } from '../client';

/** Return only verified, active, conflict-free caddies for the requested slot. */
export async function getAvailableCaddies(teeTimeId: string): Promise<CaddieCandidate[]> {
  const { data, error } = await getSupabaseClient().rpc('list_available_caddies_for_tee_time', { p_tee_time_id: teeTimeId, p_page_size: 50 });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.caddie_id),
    displayName: String(row.display_name),
    specialties: Array.isArray(row.specialties) ? row.specialties.map(String) : [],
    verificationStatus: row.verification_status as CaddieCandidate['verificationStatus']
  }));
}

