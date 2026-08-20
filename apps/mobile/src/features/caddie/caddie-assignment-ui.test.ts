import type { Booking, BookingStatus } from "@nobogey/contracts";
import { describe, expect, it } from "vitest";
import { getActionsForStatus, isUpcomingCaddieBooking } from "./caddie-assignment-ui";

describe("getActionsForStatus", () => {
  it("shows enabled actions only for an eligible requested booking", () => {
    expect(getActionsForStatus("requested", "eligible")).toEqual({ kind: "actions", enabled: true });
  });

  it("keeps requested actions visible but disabled while window data is unknown", () => {
    expect(getActionsForStatus("requested", "unknown")).toEqual({ kind: "actions", enabled: false });
  });

  it("renders requested bookings with elapsed windows as expired", () => {
    expect(getActionsForStatus("requested", "expired")).toEqual({ kind: "expired" });
  });

  it("renders confirmed bookings as a read-only status", () => {
    expect(getActionsForStatus("confirmed", "eligible")).toEqual({ kind: "confirmed" });
  });

  it.each<BookingStatus>(["draft", "in_progress", "completed", "canceled", "declined", "conflicted"])(
    "does not render assignment actions for %s bookings",
    (status) => {
      expect(getActionsForStatus(status, "eligible")).toEqual({ kind: "none" });
    }
  );
});

describe("isUpcomingCaddieBooking", () => {
  const booking = { id: "booking" } as Booking;

  it.each<BookingStatus>(["requested", "confirmed"])("includes %s bookings", (status) => {
    expect(isUpcomingCaddieBooking({ ...booking, status })).toBe(true);
  });

  it.each<BookingStatus>(["draft", "in_progress", "completed", "canceled", "declined", "conflicted"])("excludes %s bookings", (status) => {
    expect(isUpcomingCaddieBooking({ ...booking, status })).toBe(false);
  });
});
