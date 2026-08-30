/**
 * Users service — owns golfer and caddie profile reads and edits.
 *
 * Expected inputs/outputs: user IDs and profile changes in, profile records out.
 * Supabase target (future): profiles, golfer_profiles, and caddie_profiles tables.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: query profile data under role-aware RLS policies.
 */
import type { UpdateUserProfileInput, UserProfile } from './users.types';

/** Fetch a golfer or caddie profile. Will select profile tables by authenticated user ID. */
export async function getUserProfile(_userId: string): Promise<UserProfile | null> {
  // TODO(supabase): supabase.from('profiles').select(...).eq('id', userId).single().
  throw new Error('Not implemented');
}

/** Update a golfer or caddie profile. Will update the appropriate profile table. */
export async function updateUserProfile(_userId: string, _input: UpdateUserProfileInput): Promise<UserProfile> {
  // TODO(supabase): supabase.from('profiles').update(input).eq('id', userId).
  throw new Error('Not implemented');
}

/** Create an app profile after sign-up. Will insert a role-specific profile record. */
export async function createUserProfile(_profile: UserProfile): Promise<UserProfile> {
  // TODO(supabase): supabase.from('profiles').insert(profile).select().single().
  throw new Error('Not implemented');
}

