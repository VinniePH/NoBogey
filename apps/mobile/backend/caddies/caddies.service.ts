/**
 * Caddies service — isolates availability, walk-in gap coverage, and caddie candidate discovery.
 *
 * Expected inputs/outputs: course/time or assignment data in, availability and candidate records out.
 * Supabase target (future): caddie_profiles, caddie_availability, caddie_assignments, and find_caddies RPC.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: surface bookable caddies and unassigned walk-in gaps before booking confirmation.
 */
import type { CaddieAvailability, CaddieCandidate } from './caddies.types';
import { mobileDataService } from '../mock.service';

/** List available caddies. Will query availability for a course and tee-time window. */
export async function getAvailableCaddies(courseId: string, startsAt: string): Promise<CaddieCandidate[]> {
  const caddies = await mobileDataService.listCaddies(courseId);
  const availability = await Promise.all(caddies.map(async (caddie) => ({ caddie, slots: await mobileDataService.listAvailability(caddie.id) })));
  return availability.filter(({ slots }) => slots.some((slot) => slot.status === 'open' && slot.startsAt <= startsAt && slot.endsAt > startsAt)).map(({ caddie }) => ({ id: caddie.id, displayName: caddie.displayName, specialties: caddie.specialties, verificationStatus: caddie.verificationStatus }));
}

/** Read caddie availability. Will select `caddie_availability` by caddie and time. */
export async function getCaddieAvailability(caddieId: string, startsAt: string): Promise<CaddieAvailability | null> {
  return (await mobileDataService.listAvailability(caddieId)).find((slot) => slot.startsAt <= startsAt && slot.endsAt > startsAt) ?? null;
}

/** Find walk-in coverage gaps. Will query unassigned walk-in caddie windows. */
export async function getWalkInCoverageGaps(courseId: string, date: string): Promise<CaddieAvailability[]> {
  const caddies = await mobileDataService.listCaddies(courseId); const slots = (await Promise.all(caddies.map((item) => mobileDataService.listAvailability(item.id)))).flat();
  return slots.filter((slot) => slot.courseId === courseId && slot.startsAt.startsWith(date) && slot.status === 'open');
}

