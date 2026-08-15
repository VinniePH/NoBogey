import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { getSupabaseClient } from '../client';
import type { AuthSession, SignInInput, SignUpInput, SignUpResult } from './auth.types';

function toAuthSession(session: SupabaseSession): AuthSession {
  return {
    email: session.user.email ?? null,
    expiresAt: new Date((session.expires_at ?? 0) * 1000).toISOString(),
    userId: session.user.id
  };
}

/** Sign up a golfer or caddie with email and password. */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      // This is a user-owned UI preference, never an authorization claim.
      data: { display_name: input.displayName, preferred_role: input.preferredRole }
    }
  });

  if (error) throw error;

  return {
    requiresEmailConfirmation: data.session === null,
    session: data.session ? toAuthSession(data.session) : null
  };
}

/** Sign in an existing account with email and password. */
export async function signIn(input: SignInInput): Promise<AuthSession> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword(input);
  if (error) throw error;
  return toAuthSession(data.session);
}

/** Sign out only the current device session. */
export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
  if (error) throw error;
}

/** Read the persisted Supabase Auth session. */
export async function getSession(): Promise<AuthSession | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session ? toAuthSession(data.session) : null;
}

/** Subscribe to login, refresh, and logout events from Supabase Auth. */
export function subscribeToAuthState(listener: (session: AuthSession | null) => void): () => void {
  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    listener(session ? toAuthSession(session) : null);
  });

  return () => data.subscription.unsubscribe();
}
