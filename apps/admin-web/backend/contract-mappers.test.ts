import { describe, expect, it } from "vitest";
import { adminCourseId, toContractCaddie, toMoneyAmount, toTeeTimeSlot } from "./contract-mappers";

describe("admin contract mappers", () => {
  it("maps fleet identifiers, verification, and whole-peso rates to the shared caddie contract", () => {
    const caddie = toContractCaddie({ id: "caddie-rafa-dizon", name: "Rafa Dizon", tier: "CLASS B", rate: 1800, years: 8, active: true, strikes: 0 });

    expect(caddie).toMatchObject({
      id: "caddie-rafa-dizon",
      homeCourseId: adminCourseId,
      verificationStatus: "verified",
      rate: { amountInCentavos: 180000, currency: "PHP" }
    });
    expect(toMoneyAmount(1550)).toEqual({ amountInCentavos: 155000, currency: "PHP" });
  });

  it("maps local admin tee-time display values to canonical Manila timestamps and states", () => {
    expect(toTeeTimeSlot("2026-08-17", "6:30 AM", 1)).toMatchObject({
      courseId: adminCourseId,
      startsAt: "2026-08-17T06:30:00+08:00",
      status: "open",
      remainingCaddieCapacity: 3
    });
    expect(toTeeTimeSlot("2026-08-17", "1:00 PM", 4).status).toBe("full");
  });
});
