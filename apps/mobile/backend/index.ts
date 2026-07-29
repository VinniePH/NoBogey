/**
 * Backend barrel — single mobile-app import boundary for isolated backend domains.
 *
 * Expected inputs/outputs: exports domain services, types, config, and errors to mobile consumers.
 * Supabase target (future): all backend modules independently own their listed tables/RPCs.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export * from './client';
export * from './auth/auth.service';
export * from './auth/auth.types';
export * from './users/users.service';
export * from './users/users.types';
export * from './courses/courses.service';
export * from './courses/courses.types';
export * from './bookings/bookings.service';
export * from './bookings/bookings.types';
export * from './caddies/caddies.service';
export * from './caddies/caddies.types';
export * from './matching/matching.service';
export * from './shared/config';
export * from './shared/errors';

