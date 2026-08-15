import { describe, expect, it } from "vitest";
import { mobileDataService, mobileMockService } from "./mock.service";

describe("mobileDataService", () => {
  it("returns typed empty read results until a backend is connected", async () => {
    await expect(mobileDataService.listCourses()).resolves.toEqual([]);
    await expect(mobileDataService.listCaddies()).resolves.toEqual([]);
    await expect(mobileDataService.listTeeTimes("course", "2026-08-17")).resolves.toEqual([]);
    await expect(mobileDataService.listBookings()).resolves.toEqual([]);
    await expect(mobileDataService.listAvailability("caddie")).resolves.toEqual([]);
    await expect(mobileDataService.getCourse("course")).resolves.toBeNull();
    await expect(mobileDataService.getTeeTime("slot")).resolves.toBeNull();
    await expect(mobileDataService.getBooking("booking")).resolves.toBeNull();
    expect(mobileDataService.listWeekDates()).toEqual([]);
  });

  it("keeps the former adapter export as the same data seam", () => {
    expect(mobileMockService).toBe(mobileDataService);
  });
});
