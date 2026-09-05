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
  username?: string;
  email?: string;
  bio?: string;
  handicap?: number;
  tagline?: string;
  yearsExperience?: number;
  rateAmountInCentavos?: number;
  verificationStatus?: string;
  completedRounds: number;
  averageRating?: number;
  memberSince: string;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  phoneNumber?: string;
  bio?: string;
  handicap?: number;
  tagline?: string;
}

