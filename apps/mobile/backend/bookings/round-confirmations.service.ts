import { getSupabaseClient } from "../client";
import { mapBookingAcknowledgement, type BookingAcknowledgement, type BookingAcknowledgementRow } from "./round-confirmations.mapper";

export type { BookingAcknowledgement } from "./round-confirmations.mapper";

export async function listBookingAcknowledgements(): Promise<BookingAcknowledgement[]> {
  const { data, error } = await getSupabaseClient().rpc("list_my_booking_acknowledgements");
  if (error) throw error;
  return ((data ?? []) as BookingAcknowledgementRow[]).map(mapBookingAcknowledgement);
}

export async function confirmBookingAcknowledgement(
  bookingId: string,
  step: BookingAcknowledgement["step"],
): Promise<BookingAcknowledgement[]> {
  const { data, error } = await getSupabaseClient().rpc("confirm_booking_acknowledgement", {
    p_booking_id: bookingId,
    p_step: step,
  });
  if (error) throw error;
  return ((data ?? []) as BookingAcknowledgementRow[]).map(mapBookingAcknowledgement);
}
