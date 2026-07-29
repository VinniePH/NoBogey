/**
 * Shared errors — placeholder error contracts for backend-domain boundaries.
 *
 * Expected inputs/outputs: future Supabase failures in, domain-safe error codes out.
 * Supabase target (future): errors returned from Auth, table queries, and RPC calls.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export type BackendErrorCode = 'not_implemented' | 'not_found' | 'unavailable' | 'unauthorized';

/** Represent a translated domain error. Will wrap Supabase Auth, query, and RPC errors. */
export class BackendError extends Error {
  constructor(public readonly code: BackendErrorCode, message: string) {
    super(message);
  }
}

