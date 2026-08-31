/**
 * Bookings service — owns golfer tee-time booking flow, including mandatory caddie assignment.
 *
 * Expected inputs/outputs: course/date, booking IDs, and booking payloads in; availability and bookings out.
 * Supabase target (future): tee_times, bookings, caddie_assignments, and create_booking RPC.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: atomically reserve an open tee time only when a caddie assignment can be created.
 */
import type { Booking, CreateBookingInput, TeeTime } from './bookings.types';
import { getSupabaseClient } from '../client';

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id), golferId: String(row.golfer_id), caddieId: String(row.caddie_id), courseId: String(row.course_id),
    slotId: String(row.id), status: row.status === 'pending' ? 'requested' : row.status as Booking['status'], teeTime: String(row.starts_at),
    partySize: Number(row.party_size), notes: '', quotedRate: { amountInCentavos: Number(row.quoted_amount_in_centavos), currency: 'PHP' },
    preferredCaddieId: String(row.caddie_id), assignedCaddieId: String(row.caddie_id), caddieAssignmentStatus: 'preferred_assigned',
  };
}

/** Fetch available tee times. Will query `tee_times` by course, date, and open status. */
export async function getAvailableTeeTimes(courseId: string, date: string): Promise<TeeTime[]> {
  const client = getSupabaseClient();
  const dayStart = new Date(`${date}T00:00:00+08:00`);
  const dayEnd = new Date(`${date}T23:59:59.999+08:00`);
  const { data, error } = await client.from('tee_times').select('id,course_id,starts_at,player_capacity,status,updated_at').eq('course_id', courseId).gte('starts_at', dayStart.toISOString()).lte('starts_at', dayEnd.toISOString()).in('status', ['open', 'held']).order('starts_at');
  if (error) throw error;
  return (data ?? []).map((slot) => ({ id: slot.id, courseId: slot.course_id, startsAt: slot.starts_at, remainingPlayerCapacity: slot.player_capacity, remainingCaddieCapacity: 1, status: slot.status === 'open' ? 'open' as const : 'held' as const, sourceUpdatedAt: slot.updated_at }));
}

/** Create a booking with a required caddie. Will call an atomic `create_booking` RPC. */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data, error } = await getSupabaseClient().rpc('create_booking', {
    p_caddie_id: input.caddieId, p_course_id: input.courseId, p_starts_at: input.startsAt, p_ends_at: input.endsAt,
    p_party_size: input.partySize, p_idempotency_key: input.idempotencyKey,
  });
  if (error) throw error;
  return mapBooking(data as Record<string, unknown>);
}

/** Fetch a booking summary. Will join `bookings`, `tee_times`, and caddie assignment data. */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const { data, error } = await getSupabaseClient().from('bookings').select('*').eq('id', bookingId).maybeSingle();
  if (error) throw error;
  return data ? mapBooking(data) : null;
}

/** Cancel a booking. Will update booking state and release its tee time/caddie hold. */
export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc('cancel_booking', { p_booking_id: bookingId });
  if (error) throw error;
}

export async function respondToBooking(bookingId: string, accept: boolean): Promise<Booking> {
  const { data, error } = await getSupabaseClient().rpc('respond_to_booking', { p_booking_id: bookingId, p_accept: accept });
  if (error) throw error;
  return mapBooking(data as Record<string, unknown>);
}

