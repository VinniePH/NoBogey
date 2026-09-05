/**
 * Bookings service — owns golfer tee-time booking flow, including mandatory caddie assignment.
 *
 * Expected inputs/outputs: course/date, booking IDs, and booking payloads in; availability and bookings out.
 * Supabase target: tee_times, bookings, caddie availability, and atomic booking RPCs.
 * Status: Supabase-backed.
 */
import type { Booking, CreateBookingInput, TeeTime } from './bookings.types';
import { getSupabaseClient } from '../client';

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id), golferId: String(row.golfer_id), caddieId: String(row.caddie_id), courseId: String(row.course_id),
    slotId: String(row.tee_time_id ?? row.id), status: row.status === 'pending' ? 'requested' : row.status as Booking['status'], teeTime: String(row.starts_at),
    partySize: Number(row.party_size), notes: '', quotedRate: { amountInCentavos: Number(row.quoted_amount_in_centavos), currency: 'PHP' },
    preferredCaddieId: String(row.caddie_id), assignedCaddieId: String(row.caddie_id), caddieAssignmentStatus: 'preferred_assigned',
  };
}

/** Fetch available tee times. Will query `tee_times` by course, date, and open status. */
export async function getAvailableTeeTimes(courseId: string, date: string): Promise<TeeTime[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('list_bookable_tee_times', { p_course_id: courseId, p_day: date });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map((slot) => ({ id: String(slot.id), courseId: String(slot.course_id), startsAt: String(slot.starts_at), remainingPlayerCapacity: Number(slot.player_capacity), remainingCaddieCapacity: Number(slot.remaining_caddie_capacity), status: slot.status === 'open' ? 'open' as const : 'held' as const, sourceUpdatedAt: String(slot.updated_at) }));
}

/** Create a booking with a required caddie. Will call an atomic `create_booking` RPC. */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data, error } = await getSupabaseClient().rpc('create_mobile_booking', {
    p_tee_time_id: input.teeTimeId, p_caddie_id: input.caddieId,
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

