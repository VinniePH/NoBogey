import type { TeeTimeSlot } from "@nobogey/contracts";

export type GameDraft = {
  courseId?: string | undefined;
  partySize?: number | undefined;
  date?: string | undefined;
  teeTimeId?: string | undefined;
  caddieId?: string | undefined;
};

export const golferCounts = [1, 2, 3, 4] as const;

export function parseGolferCount(value?: string): number | undefined {
  const count = Number(value);
  return golferCounts.some((option) => option === count) ? count : undefined;
}

export function slotFits(slot: TeeTimeSlot, count?: number) {
  return Boolean(count && slot.status === "open" && slot.remainingPlayerCapacity >= count);
}

/** Selection dependencies only; the existing booking service remains authoritative. */
export function changeGameDraft(draft: GameDraft, patch: Partial<GameDraft>, slots: TeeTimeSlot[] = []): GameDraft {
  const next = { ...draft, ...patch };
  if (next.courseId !== draft.courseId || next.date !== draft.date) {
    return { ...next, teeTimeId: undefined, caddieId: undefined };
  }
  if (next.partySize !== draft.partySize && !slots.some((slot) => slot.id === draft.teeTimeId && slotFits(slot, next.partySize))) {
    return { ...next, teeTimeId: undefined, caddieId: undefined };
  }
  if (next.teeTimeId !== draft.teeTimeId) return { ...next, caddieId: undefined };
  return next;
}

export function gameDate(value: string) {
  return new Date(`${value}T12:00:00+08:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila"
  });
}

export function gameTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Manila"
  });
}
