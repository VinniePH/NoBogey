import { describe, expect, it } from "vitest";
import { formatAdminNotificationTime, mapAdminNotification, safeAdminDestination } from "./notifications";

describe("admin notification adapter", () => {
  it("maps persistent notification timestamps and destination links", () => {
    expect(mapAdminNotification({
      id: "notification-id",
      course_id: "course-id",
      booking_id: "booking-id",
      category: "Booking",
      title: "Booking confirmed",
      description: "The assigned caddie accepted the booking.",
      destination_path: "/admin/assignments",
      created_at: "2026-10-27T01:00:00Z",
      read_at: null,
    })).toMatchObject({
      id: "notification-id",
      bookingId: "booking-id",
      destinationPath: "/admin/assignments",
      createdAt: "2026-10-27T01:00:00Z",
    });
  });

  it("rejects destinations outside the administrator portal", () => {
    expect(safeAdminDestination("https://example.com/phishing")).toBe("/admin");
    expect(safeAdminDestination("/admin/tee-times")).toBe("/admin/tee-times");
  });

  it("formats recent server timestamps", () => {
    expect(formatAdminNotificationTime("2026-10-27T00:59:00Z", new Date("2026-10-27T01:00:00Z"))).toContain("minute");
  });
});
