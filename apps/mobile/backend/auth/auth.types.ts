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
  username?: string;
  role: 'golfer' | 'caddie';
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  accessToken: string;
  expiresAt: number;
  email: string;
  roles: Array<'golfer' | 'caddie' | 'admin' | 'super_admin'>;
}

export interface SignUpResult {
  userId: string;
  needsEmailConfirmation: boolean;
  session: AuthSession | null;
}

