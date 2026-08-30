/**
 * Auth service — isolates golfer and caddie authentication for the mobile app.
 *
 * Expected inputs/outputs: credentials or a session request in, session/identity data out.
 * Supabase target (future): auth.users, auth.sessions, and the Auth API.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: call Supabase Auth and synchronize the authenticated user with profiles.
 */
import { getSupabaseClient } from '../client';
import { getBackendConfig } from '../shared/config';
import type { AuthSession, SignInInput, SignUpInput, SignUpResult } from './auth.types';

async function toAuthSession(userId: string, email: string, accessToken: string, expiresAt: number): Promise<AuthSession> {
  const { data, error } = await getSupabaseClient().from('user_roles').select('role').eq('user_id', userId);
  if (error) throw error;
  return {
    userId,
    email,
    accessToken,
    expiresAt,
    roles: (data ?? []).map(({ role }) => role) as AuthSession['roles'],
  };
}

/** Sign up a golfer or caddie. Will call Supabase Auth and create the related profile. */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const client = getSupabaseClient();
  const { appUrl } = getBackendConfig();
  const { data, error } = await client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: `${appUrl.replace(/\/$/, '')}/auth/callback`,
      data: { display_name: input.displayName.trim(), username: input.username?.trim() || undefined, intended_role: input.role },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Supabase did not return the created user');
  if (!data.session) return { userId: data.user.id, needsEmailConfirmation: true, session: null };
  const { error: profileError } = await client.rpc('complete_signup', { p_role: input.role });
  if (profileError) throw profileError;
  return {
    userId: data.user.id,
    needsEmailConfirmation: false,
    session: await toAuthSession(data.user.id, data.user.email ?? input.email, data.session.access_token, data.session.expires_at ?? 0),
  };
}

/** Sign in an existing account. Will call Supabase Auth password sign-in. */
export async function signIn(input: SignInInput): Promise<AuthSession> {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email: input.email.trim().toLowerCase(), password: input.password });
  if (error) throw error;
  let session = await toAuthSession(data.user.id, data.user.email ?? input.email, data.session.access_token, data.session.expires_at ?? 0);
  if (!session.roles.length && (data.user.user_metadata?.intended_role === 'golfer' || data.user.user_metadata?.intended_role === 'caddie')) {
    const { error: profileError } = await client.rpc('complete_signup', { p_role: data.user.user_metadata.intended_role });
    if (profileError) throw profileError;
    session = await toAuthSession(data.user.id, data.user.email ?? input.email, data.session.access_token, data.session.expires_at ?? 0);
  }
  return session;
}

/** Sign out the current account. Will invalidate the local Supabase Auth session. */
export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

/** Read the current session. Will retrieve the active Supabase Auth session. */
export async function getSession(): Promise<AuthSession | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  if (!data.session) return null;
  return toAuthSession(data.session.user.id, data.session.user.email ?? '', data.session.access_token, data.session.expires_at ?? 0);
}

