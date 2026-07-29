/**
 * Bookings service — owns golfer tee-time booking flow, including mandatory caddie assignment.
 *
 * Expected inputs/outputs: course/date, booking IDs, and booking payloads in; availability and bookings out.
 * Supabase target (future): tee_times, bookings, caddie_assignments, and create_booking RPC.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: atomically reserve an open tee time only when a caddie assignment can be created.
 */
import type { Booking, CreateBookingInput, TeeTime } from './bookings.types';

/** Fetch available tee times. Will query `tee_times` by course, date, and open status. */
export async function getAvailableTeeTimes(courseId: string, date: string): Promise<TeeTime[]> {
  // TODO(supabase): supabase.from('tee_times').select(...).eq('course_id', courseId).eq('date', date).
  throw new Error('Not implemented');
}

/** Create a booking with a required caddie. Will call an atomic `create_booking` RPC. */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // TODO(supabase): supabase.rpc('create_booking', input).
  throw new Error('Not implemented');
}

/** Fetch a booking summary. Will join `bookings`, `tee_times`, and caddie assignment data. */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  // TODO(supabase): supabase.from('bookings').select(...).eq('id', bookingId).single().
  throw new Error('Not implemented');
}

/** Cancel a booking. Will update booking state and release its tee time/caddie hold. */
export async function cancelBooking(bookingId: string): Promise<void> {
  // TODO(supabase): supabase.rpc('cancel_booking', { booking_id: bookingId }).
  throw new Error('Not implemented');
}

