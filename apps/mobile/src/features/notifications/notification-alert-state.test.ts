import { describe, expect, it } from "vitest";
import { acceptAssignmentLocally, createInitialNotificationAlertState, dismissAlertBanner, markBookingAlertsRead, type NotificationAlertState } from "./notification-alert-state";

function stateWithCaddieRequest(): NotificationAlertState {
  return {
    ...createInitialNotificationAlertState(),
    alerts: [{
      id: "alert-request-001",
      kind: "booking_assignment_requested",
      recipientRole: "caddie",
      bookingId: "booking-001",
      title: "New booking request",
      body: "A booking request is ready to review.",
      createdAt: "2026-08-26T00:00:00.000Z"
    }]
  };
}

describe("local notification alert state", () => {
  it("creates one golfer alert when an assignment is accepted once", () => {
    const initial = createInitialNotificationAlertState();
    const accepted = acceptAssignmentLocally(initial, "booking-001");
    const repeated = acceptAssignmentLocally(accepted, "booking-001");
    expect(repeated.alerts.filter((alert) => alert.recipientRole === "golfer")).toHaveLength(1);
    expect(repeated.acceptedBookingIds).toEqual(["booking-001"]);
  });

  it("marks only the matching role alert read when the booking is opened", () => {
    const accepted = acceptAssignmentLocally(stateWithCaddieRequest(), "booking-001");
    const read = markBookingAlertsRead(accepted, "booking-001", "golfer");
    expect(read.alerts.find((alert) => alert.recipientRole === "golfer")?.readAt).toBeTruthy();
    expect(read.alerts.find((alert) => alert.recipientRole === "caddie")?.readAt).toBeUndefined();
  });

  it("dismisses a banner without marking its alert read", () => {
    const initial = stateWithCaddieRequest();
    const dismissed = dismissAlertBanner(initial, "alert-request-001");
    expect(dismissed.alerts[0]?.readAt).toBeUndefined();
    expect(dismissed.dismissedAlertIds).toEqual(["alert-request-001"]);
  });
});
