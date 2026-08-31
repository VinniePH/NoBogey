/**
 * Users types — profile contracts shared by golfer and caddie identity flows.
 *
 * Expected inputs/outputs: profile records and editable profile fields.
 * Supabase target (future): profiles, golfer_profiles, and caddie_profiles tables.
 * Status: Supabase-backed.
 */
export type UserRole = 'golfer' | 'caddie';

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  phoneNumber?: string;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  phoneNumber?: string;
}

