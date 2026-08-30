import type { ApiError, ApiErrorCode } from "@nobogey/contracts";

/** Shared API error shape for future mobile service adapters. */
export type BackendErrorCode = ApiErrorCode;

/** Represent a translated domain error. Will wrap Supabase Auth, query, and RPC errors. */
export class BackendError extends Error {
  constructor(public readonly code: BackendErrorCode, message: string, public readonly requestId = "local-unavailable") {
    super(message);
  }

  toApiError(): ApiError { return { code: this.code, message: this.message, requestId: this.requestId }; }
}
