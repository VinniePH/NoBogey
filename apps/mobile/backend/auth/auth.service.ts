/**
 * Auth service — isolates golfer and caddie authentication for the mobile app.
 *
 * Expected inputs/outputs: credentials or a session request in, session/identity data out.
 * Supabase target (future): auth.users, auth.sessions, and the Auth API.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: call Supabase Auth and synchronize the authenticated user with profiles.
 */
import type { AuthSession, SignInInput, SignUpInput } from './auth.types';

/** Sign up a golfer or caddie. Will call Supabase Auth and create the related profile. */
export async function signUp(input: SignUpInput): Promise<AuthSession> {
  // TODO(supabase): supabase.auth.signUp({ email: input.email, password: input.password }).
  throw new Error('Not implemented');
}

/** Sign in an existing account. Will call Supabase Auth password sign-in. */
export async function signIn(input: SignInInput): Promise<AuthSession> {
  // TODO(supabase): supabase.auth.signInWithPassword(input).
  throw new Error('Not implemented');
}

/** Sign out the current account. Will invalidate the local Supabase Auth session. */
export async function signOut(): Promise<void> {
  // TODO(supabase): supabase.auth.signOut().
  throw new Error('Not implemented');
}

/** Read the current session. Will retrieve the active Supabase Auth session. */
export async function getSession(): Promise<AuthSession | null> {
  // TODO(supabase): supabase.auth.getSession().
  throw new Error('Not implemented');
}

