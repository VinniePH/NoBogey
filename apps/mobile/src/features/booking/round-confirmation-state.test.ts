import { describe, expect, it } from "vitest";
import { confirmRoundStep, emptyRoundConfirmation, isMutual, type RoundConfirmations } from "./round-confirmation-state";

const time = "2026-10-21T08:00:00Z";

describe("mutual round confirmations", () => {
  it("starts with both participants pending", () => {
    const round = emptyRoundConfirmation();
    expect(isMutual(round.meetup)).toBe(false);
    expect(isMutual(round.payment)).toBe(false);
  });

  it.each(["golfer", "caddie"] as const)("keeps meetup pending after only the %s confirms", (role) => {
    const state = confirmRoundStep({}, "round", "meetup", role, time);
    expect(state.round?.meetup).toEqual({ [role]: time });
    expect(isMutual(state.round!.meetup)).toBe(false);
  });

  it("requires both meetup acknowledgements before payment", () => {
    const state = confirmRoundStep({}, "round", "meetup", "golfer", time);
    expect(confirmRoundStep(state, "round", "payment", "golfer", time)).toBe(state);
    expect(confirmRoundStep(state, "round", "payment", "caddie", time)).toBe(state);
  });

  it("keeps payment pending until the golfer pays and the caddie acknowledges receipt", () => {
    let state = confirmRoundStep({}, "round", "meetup", "caddie", time);
    state = confirmRoundStep(state, "round", "meetup", "golfer", time);
    expect(isMutual(state.round!.meetup)).toBe(true);
    state = confirmRoundStep(state, "round", "payment", "golfer", time);
    expect(isMutual(state.round!.payment)).toBe(false);
    state = confirmRoundStep(state, "round", "payment", "caddie", time);
    expect(isMutual(state.round!.payment)).toBe(true);
  });

  it("preserves the original confirmation on repeated taps", () => {
    const state = confirmRoundStep({}, "round", "meetup", "golfer", time);
    expect(confirmRoundStep(state, "round", "meetup", "golfer", "later")).toBe(state);
  });

  it("keeps bookings and steps independent", () => {
    const state: RoundConfirmations = { other: emptyRoundConfirmation() };
    const next = confirmRoundStep(state, "round", "meetup", "golfer", time);
    expect(next.other).toBe(state.other);
    expect(next.round?.payment).toEqual({});
    expect(state.round).toBeUndefined();
  });
});
