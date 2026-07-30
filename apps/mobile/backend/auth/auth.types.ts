/**
 * Auth types — contracts for the mobile application's future authentication boundary.
 *
 * Expected inputs/outputs: credential requests, authenticated session snapshots, and actor identities.
 * Supabase target (future): auth.users and auth.sessions.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  accessToken: string;
  expiresAt: string;
}

