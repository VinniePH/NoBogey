import type { TeeTimeSlot } from "@nobogey/contracts";
import { mobileDataService } from "../../../backend/mock.service";

export interface ClubTeeSheetGateway {
  getTeeTimes(courseId: string, date: string): Promise<TeeTimeSlot[]>;
}

/**
 * The only place the mobile app reads tee-time availability. It deliberately
 * mirrors the future club API boundary.
 */
export const clubTeeSheet: ClubTeeSheetGateway = {
  async getTeeTimes(courseId, date) {
    return mobileDataService.listTeeTimes(courseId, date);
  }
};

export function canSelectTeeTime(slot: TeeTimeSlot, partySize: number) {
  return slot.status === "open" && slot.remainingPlayerCapacity >= partySize;
}
