import type { Booking as ContractBooking, BookingStatus as ContractBookingStatus, TeeTimeSlot } from "@nobogey/contracts";

/**
 * The mobile backend boundary uses the shared booking language. Transport
 * fields belong in adapters when a real service is selected.
 */
export type BookingStatus = ContractBookingStatus;
export type TeeTime = TeeTimeSlot;
export type Booking = ContractBooking;

export interface CreateBookingInput {
  caddieId: string;
  courseId: string;
  teeTimeId: string;
  startsAt: string;
  endsAt: string;
  partySize: number;
  idempotencyKey: string;
}
