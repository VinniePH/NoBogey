import { describe, expect, it, vi } from "vitest";

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));
vi.mock('./client', () => ({
  getSupabaseClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
}));
import { mobileDataService, mobileMockService } from "./mock.service";

describe("mobileDataService", () => {
  it("provides the next seven Manila booking dates", () => {
    const dates = mobileDataService.listWeekDates();
    expect(dates).toHaveLength(7);
    expect(dates.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))).toBe(true);
  });

  it("returns null when a tee-time record does not exist", async () => {
    await expect(mobileDataService.getTeeTime("slot")).resolves.toBeNull();
  });

  it("keeps the former adapter export as the same data seam", () => {
    expect(mobileMockService).toBe(mobileDataService);
  });
});
