/**
 * Bookings types — tee-time and caddie-required booking contracts for golfers.
 *
 * Expected inputs/outputs: tee-time choices and caddie assignment requests in, booking records out.
 * Supabase target (future): tee_times, bookings, and caddie_assignments tables.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export type BookingStatus = 'pending_caddie' | 'confirmed' | 'cancelled';

export interface TeeTime {
  id: string;
  courseId: string;
  startsAt: string;
  status: 'open' | 'held' | 'booked';
}

export interface CreateBookingInput {
  teeTimeId: string;
  golferId: string;
  caddieId: string;
}

export interface Booking {
  id: string;
  teeTimeId: string;
  golferId: string;
  caddieId: string;
  status: BookingStatus;
}

