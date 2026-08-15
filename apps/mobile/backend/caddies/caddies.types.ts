import type { AvailabilitySlot, Caddie } from "@nobogey/contracts";

/** The mobile backend consumes the canonical availability and caddie identity fields. */
export type CaddieAvailability = AvailabilitySlot;
export type CaddieCandidate = Pick<Caddie, "id" | "displayName" | "specialties" | "verificationStatus">;
