/**
 * Courses types — contracts for the mobile course catalogue, beginning with Manila Golf and Country Club.
 *
 * Expected inputs/outputs: course IDs and filters in, course records out.
 * Supabase target (future): courses table.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 */
export interface Course {
  id: string;
  name: string;
  city: string;
  country: 'Philippines';
  isActive: boolean;
}

