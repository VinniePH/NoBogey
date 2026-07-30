/**
 * Caddies service — isolates availability, walk-in gap coverage, and caddie candidate discovery.
 *
 * Expected inputs/outputs: course/time or assignment data in, availability and candidate records out.
 * Supabase target (future): caddie_profiles, caddie_availability, caddie_assignments, and find_caddies RPC.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: surface bookable caddies and unassigned walk-in gaps before booking confirmation.
 */
import type { CaddieAvailability, CaddieCandidate } from './caddies.types';

/** List available caddies. Will query availability for a course and tee-time window. */
export async function getAvailableCaddies(courseId: string, startsAt: string): Promise<CaddieCandidate[]> {
  // TODO(supabase): supabase.rpc('find_caddies', { course_id: courseId, starts_at: startsAt }).
  throw new Error('Not implemented');
}

/** Read caddie availability. Will select `caddie_availability` by caddie and time. */
export async function getCaddieAvailability(caddieId: string, startsAt: string): Promise<CaddieAvailability | null> {
  // TODO(supabase): supabase.from('caddie_availability').select(...).eq('caddie_id', caddieId).
  throw new Error('Not implemented');
}

/** Find walk-in coverage gaps. Will query unassigned walk-in caddie windows. */
export async function getWalkInCoverageGaps(courseId: string, date: string): Promise<CaddieAvailability[]> {
  // TODO(supabase): supabase.from('caddie_availability').select(...).eq('course_id', courseId).
  throw new Error('Not implemented');
}

