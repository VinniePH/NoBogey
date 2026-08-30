import type { Caddie as ContractCaddie, MoneyAmount, TeeTimeSlot } from "@nobogey/contracts";
import type { Caddie as FleetCaddie } from "./fleet";

export const adminCourseId = "manila-golf-country-club";

/** Converts the admin-only fleet presentation record into the shared domain record. */
export function toContractCaddie(caddie: FleetCaddie): ContractCaddie {
  return {
    id: caddie.id,
    role: "caddie",
    displayName: caddie.name,
    homeCourseId: adminCourseId,
    bio: `${caddie.tier} caddie managed by the local club-operations fixture.`,
    specialties: [caddie.tier],
    languages: ["English", "Filipino"],
    courseKnowledge: ["Manila Golf & Country Club"],
    yearsExperience: caddie.years,
    ratingAverage: 0,
    reviewCount: 0,
    completedRounds: 0,
    portfolioHighlights: [],
    rate: toMoneyAmount(caddie.rate),
    verificationStatus: caddie.active ? "verified" : "pending"
  };
}

/** Admin enters whole Philippine pesos; the contract represents money in centavos. */
export function toMoneyAmount(pesos: number): MoneyAmount {
  return { amountInCentavos: Math.round(pesos * 100), currency: "PHP" };
}

/** Converts the admin's local date/time display into the ISO timestamp used by both apps. */
export function toTeeTimeSlot(date: string, time: string, assignedCaddieCount = 0): TeeTimeSlot {
  const startsAt = toManilaIsoTimestamp(date, time);
  const status = assignedCaddieCount >= 4 ? "full" : "open";
  return {
    id: `tee-${date}-${time.replace(/[^0-9APM]/g, "").toLowerCase()}`,
    courseId: adminCourseId,
    startsAt,
    remainingPlayerCapacity: status === "open" ? 4 : 0,
    remainingCaddieCapacity: Math.max(0, 4 - assignedCaddieCount),
    status,
    sourceUpdatedAt: startsAt
  };
}

function toManilaIsoTimestamp(date: string, time: string): string {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!match) throw new Error(`Expected an admin tee time such as 6:00 AM; received ${time}.`);
  const [, hourText, minute, meridiem] = match;
  const hour = Number(hourText) % 12 + (meridiem === "PM" ? 12 : 0);
  return `${date}T${String(hour).padStart(2, "0")}:${minute}:00+08:00`;
}
