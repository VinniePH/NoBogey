import type { CaddieVerificationDetail, CaddieVerificationErrorShape, CaddieVerificationSummary, VerificationStatusFilter } from "@nobogey/contracts";

/** The admin verification boundary remains stable until a real review API is connected. */
export class CaddieVerificationAdapterError extends Error implements CaddieVerificationErrorShape {
  readonly code: CaddieVerificationErrorShape["code"];
  readonly requestId: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(error: CaddieVerificationErrorShape) {
    super(error.message);
    this.name = "CaddieVerificationAdapterError";
    this.code = error.code;
    this.requestId = error.requestId;
    this.fieldErrors = error.fieldErrors;
  }
}

function unavailable(): never {
  throw new CaddieVerificationAdapterError({ code: "UNAVAILABLE", message: "Caddie verification is not connected to a review service yet.", requestId: "local-unconfigured" });
}

/** Replace this body with the review-service query without changing the UI contract. */
export async function listCaddiesForVerification(_filter: VerificationStatusFilter = "all"): Promise<CaddieVerificationSummary[]> { return []; }
export async function getCaddieVerificationDetail(_caddieId: string): Promise<CaddieVerificationDetail> { return unavailable(); }
export async function approveCaddieVerification(_caddieId: string, _reviewerNote?: string): Promise<CaddieVerificationDetail> { return unavailable(); }
export async function rejectCaddieVerification(_caddieId: string, _reason: string): Promise<CaddieVerificationDetail> { return unavailable(); }
export async function requestMoreInfo(_caddieId: string, _message: string): Promise<CaddieVerificationDetail> { return unavailable(); }

/** Compatibility no-op retained for existing tests and non-production callers. */
export function resetCaddieVerificationMock() {}
