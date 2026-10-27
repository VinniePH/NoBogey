export type BookingAcknowledgement = {
  bookingId: string;
  step: "meetup" | "payment";
  participantId: string;
  participantRole: "golfer" | "caddie";
  confirmedAt: string;
};

export type BookingAcknowledgementRow = {
  booking_id: string;
  step: string;
  participant_id: string;
  participant_role: string;
  confirmed_at: string;
};

export function mapBookingAcknowledgement(row: BookingAcknowledgementRow): BookingAcknowledgement {
  if (row.step !== "meetup" && row.step !== "payment") throw new Error("INVALID_ACKNOWLEDGEMENT_STEP");
  if (row.participant_role !== "golfer" && row.participant_role !== "caddie") throw new Error("INVALID_ACKNOWLEDGEMENT_ROLE");
  return {
    bookingId: row.booking_id,
    step: row.step,
    participantId: row.participant_id,
    participantRole: row.participant_role,
    confirmedAt: row.confirmed_at,
  };
}
