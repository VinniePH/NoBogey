import type { Booking, BookingStatus } from "@nobogey/contracts";

type UpcomingBookingStatus = Extract<BookingStatus, "requested" | "confirmed">;

export type UpcomingCaddieBooking = Booking & { status: UpcomingBookingStatus };

export function isUpcomingCaddieBooking(booking: Booking): booking is UpcomingCaddieBooking {
  return booking.status === "requested" || booking.status === "confirmed";
}

/**
 * The mobile booking contract does not expose the authoritative assignment
 * window yet. Callers must supply this state rather than infer it from teeTime.
 */
export type AssignmentWindowState = "eligible" | "expired" | "unknown";

export type AssignmentActionPresentation =
  | { kind: "actions"; enabled: boolean }
  | { kind: "confirmed" }
  | { kind: "expired" }
  | { kind: "none" };

export function getActionsForStatus(status: BookingStatus, windowState: AssignmentWindowState): AssignmentActionPresentation {
  switch (status) {
    case "requested":
      if (windowState === "expired") return { kind: "expired" };
      return { kind: "actions", enabled: windowState === "eligible" };
    case "confirmed":
      return { kind: "confirmed" };
    case "draft":
    case "in_progress":
    case "completed":
    case "canceled":
    case "declined":
    case "conflicted":
      return { kind: "none" };
  }
}
