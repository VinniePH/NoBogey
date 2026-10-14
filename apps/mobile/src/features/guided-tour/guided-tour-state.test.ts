import { describe, expect, it } from "vitest";
import { getAutomaticTourKey, shouldStartAutomaticTour } from "./guided-tour-state";

describe("automatic guided tour", () => {
  const firstVisit = {
    accountId: "user-1",
    completed: false,
    isReady: true,
    role: "golfer",
    startedFor: null,
  };

  it("starts for an authenticated user's first visit", () => {
    expect(shouldStartAutomaticTour(firstVisit)).toBe(true);
  });

  it("does not restart after the user completes the tour", () => {
    expect(shouldStartAutomaticTour({ ...firstVisit, completed: true })).toBe(false);
  });

  it("does not restart while returning to the same home screen", () => {
    expect(shouldStartAutomaticTour({
      ...firstVisit,
      startedFor: getAutomaticTourKey(firstVisit.accountId, firstVisit.role),
    })).toBe(false);
  });

  it("keeps tour state scoped to the signed-in account", () => {
    expect(shouldStartAutomaticTour({
      ...firstVisit,
      accountId: "user-2",
      startedFor: getAutomaticTourKey(firstVisit.accountId, firstVisit.role),
    })).toBe(true);
  });

  it("waits for authenticated preferences before starting", () => {
    expect(shouldStartAutomaticTour({ ...firstVisit, accountId: null })).toBe(false);
    expect(shouldStartAutomaticTour({ ...firstVisit, isReady: false })).toBe(false);
  });
});
