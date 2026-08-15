import { describe, expect, it } from "vitest";
import {
  CaddieVerificationAdapterError,
  approveCaddieVerification,
  getCaddieVerificationDetail,
  listCaddiesForVerification,
  rejectCaddieVerification,
  requestMoreInfo,
  resetCaddieVerificationMock
} from "./caddie-verification";

describe("caddie verification adapter", () => {
  it("returns no records until the review service is connected", async () => {
    await expect(listCaddiesForVerification()).resolves.toEqual([]);
    await expect(listCaddiesForVerification("pending")).resolves.toEqual([]);
  });

  it("keeps non-listing contracts explicit while no review service exists", async () => {
    await expect(getCaddieVerificationDetail("caddie-id")).rejects.toMatchObject<CaddieVerificationAdapterError>({ code: "UNAVAILABLE" });
    await expect(approveCaddieVerification("caddie-id")).rejects.toMatchObject<CaddieVerificationAdapterError>({ code: "UNAVAILABLE" });
    await expect(rejectCaddieVerification("caddie-id", "reason")).rejects.toMatchObject<CaddieVerificationAdapterError>({ code: "UNAVAILABLE" });
    await expect(requestMoreInfo("caddie-id", "message")).rejects.toMatchObject<CaddieVerificationAdapterError>({ code: "UNAVAILABLE" });
    expect(resetCaddieVerificationMock()).toBeUndefined();
  });
});
