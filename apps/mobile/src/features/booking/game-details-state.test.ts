import { describe, expect, it } from "vitest";
import type { TeeTimeSlot } from "@nobogey/contracts";
import { changeGameDraft, gameDate, gameTime, parseGolferCount, slotFits, type GameDraft } from "./game-details-state";

const slot: TeeTimeSlot = {
  id: "tee-1", courseId: "course-1", startsAt: "2026-10-10T23:30:00Z",
  remainingPlayerCapacity: 4, remainingCaddieCapacity: 1, status: "open", sourceUpdatedAt: "2026-10-01T00:00:00Z"
};
const draft: GameDraft = { courseId: "course-1", date: "2026-10-11", partySize: 2, teeTimeId: "tee-1", caddieId: "caddie-1" };

describe("conditional game details", () => {
  it("clears tee time and caddie when the course changes, retaining date and group size", () => {
    expect(changeGameDraft(draft, { courseId: "course-2" }, [slot])).toEqual({ ...draft, courseId: "course-2", teeTimeId: undefined, caddieId: undefined });
  });
  it("clears dependent choices when the date changes", () => {
    expect(changeGameDraft(draft, { date: "2026-10-12" }, [slot])).toEqual({ ...draft, date: "2026-10-12", teeTimeId: undefined, caddieId: undefined });
  });
  it("keeps choices when reselecting the same course or date", () => {
    expect(changeGameDraft(draft, { courseId: draft.courseId, date: draft.date }, [slot])).toEqual(draft);
  });
  it("keeps an eligible tee time and caddie when golfer count changes", () => {
    expect(changeGameDraft(draft, { partySize: 4 }, [slot])).toEqual({ ...draft, partySize: 4 });
  });
  it("clears choices when the new group no longer fits", () => {
    expect(changeGameDraft(draft, { partySize: 4 }, [{ ...slot, remainingPlayerCapacity: 3 }])).toEqual({ ...draft, partySize: 4, teeTimeId: undefined, caddieId: undefined });
  });
  it("clears caddie only when changing tee times", () => {
    expect(changeGameDraft(draft, { teeTimeId: "tee-2" }, [slot])).toEqual({ ...draft, teeTimeId: "tee-2", caddieId: undefined });
    expect(changeGameDraft(draft, { teeTimeId: "tee-1" }, [slot])).toEqual(draft);
  });
  it("keeps the other details when selecting a caddie", () => {
    expect(changeGameDraft(draft, { caddieId: "caddie-2" }, [slot])).toEqual({ ...draft, caddieId: "caddie-2" });
  });
  it("requires an open tee time with enough spots", () => {
    expect(slotFits(slot, 4)).toBe(true);
    expect(slotFits(slot, undefined)).toBe(false);
    expect(slotFits({ ...slot, status: "held" }, 2)).toBe(false);
    expect(slotFits({ ...slot, remainingPlayerCapacity: 1 }, 2)).toBe(false);
  });
  it("accepts only whole golfer counts offered by the form", () => {
    for (const value of ["1", "2", "3", "4"]) expect(parseGolferCount(value)).toBe(Number(value));
    for (const value of [undefined, "", "0", "5", "-1", "2.5", "invalid"]) expect(parseGolferCount(value)).toBeUndefined();
  });
  it("formats date and tee time in the club timezone", () => {
    expect(gameDate("2026-10-11")).toBe("October 11, 2026");
    expect(gameTime(slot.startsAt)).toBe("7:30 AM");
  });
});
