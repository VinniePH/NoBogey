import type { TeeTimeSlot } from "@nobogey/contracts";
import { teeTimeSlots } from "../../data/mock";

export interface ClubTeeSheetGateway {
  getTeeTimes(courseId: string, date: string): Promise<TeeTimeSlot[]>;
}

/**
 * The only place the mobile app reads tee-time availability. It deliberately
 * mirrors the future club API boundary; fixtures keep the UI usable today.
 */
export const clubTeeSheet: ClubTeeSheetGateway = {
  async getTeeTimes(courseId, date) {
    return teeTimeSlots.filter((slot) => slot.courseId === courseId && slot.startsAt.slice(0, 10) === date);
  }
};

export function canSelectTeeTime(slot: TeeTimeSlot, partySize: number) {
  return slot.status === "open" && slot.remainingPlayerCapacity >= partySize;
}
