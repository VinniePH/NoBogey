export type AuthRole = 'golfer' | 'caddie';

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  preferredRole: AuthRole;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  email: string | null;
  expiresAt: string;
}

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
  session: AuthSession | null;
}
