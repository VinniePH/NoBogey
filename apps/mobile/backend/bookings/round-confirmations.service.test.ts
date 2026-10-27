import { describe, expect, it } from "vitest";
import { mapBookingAcknowledgement } from "./round-confirmations.mapper";

describe("round confirmation service", () => {
  it("maps the participant identity and server timestamp", () => {
    expect(mapBookingAcknowledgement({
      booking_id: "booking-id",
      step: "meetup",
      participant_id: "participant-id",
      participant_role: "golfer",
      confirmed_at: "2026-10-27T01:02:03Z",
    })).toEqual({
      bookingId: "booking-id",
      step: "meetup",
      participantId: "participant-id",
      participantRole: "golfer",
      confirmedAt: "2026-10-27T01:02:03Z",
    });
  });

  it("rejects unexpected server values", () => {
    expect(() => mapBookingAcknowledgement({
      booking_id: "booking-id",
      step: "refund",
      participant_id: "participant-id",
      participant_role: "golfer",
      confirmed_at: "2026-10-27T01:02:03Z",
    })).toThrow("INVALID_ACKNOWLEDGEMENT_STEP");
  });
});
