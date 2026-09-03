import type { AvailabilitySlot, Booking, Caddie, GolfCourse, TeeTimeSlot } from "@nobogey/contracts";
import { getSupabaseClient } from './client';
import { getAvailableTeeTimes } from './bookings/bookings.service';

type CourseRow = { id: string; name: string; holes: number; golf_clubs: { city: string | null; region: string | null }[] | null };
type AssignmentRow = { caddie_id: string; club_id: string; registry_number: string };
type CaddieProfileRow = { user_id: string; tagline: string | null; bio: string | null; years_experience: number | null; rate_amount_in_centavos: number };
type CourseClubRow = { id: string; club_id: string };
type ProfileNameRow = { id: string; display_name: string | null };
type AvailabilityRow = { id: string; caddie_id: string; club_id: string; starts_at: string; ends_at: string; is_available: boolean };

function mapBooking(row: Record<string, unknown>): Booking {
  return { id: String(row.id), golferId: String(row.golfer_id), caddieId: String(row.caddie_id), courseId: String(row.course_id), slotId: String(row.id), status: row.status === 'pending' ? 'requested' : row.status as Booking['status'], teeTime: String(row.starts_at), partySize: Number(row.party_size), notes: '', quotedRate: { amountInCentavos: Number(row.quoted_amount_in_centavos), currency: 'PHP' }, preferredCaddieId: String(row.caddie_id), assignedCaddieId: String(row.caddie_id), caddieAssignmentStatus: 'preferred_assigned' };
}

/**
 * Local mobile data boundary while no remote backend is configured. Its public
 * contract deliberately matches the former fixture adapter so Supabase can
 * replace only these method bodies later.
 */
export const mobileDataService = {
  async listCourses(): Promise<GolfCourse[]> {
    const { data, error } = await getSupabaseClient().from('courses').select('id,name,holes,golf_clubs(city,region)').eq('is_active', true).order('name');
    if (error) throw error;
    return ((data ?? []) as unknown as CourseRow[]).map((row) => ({ id: row.id, name: row.name, city: row.golf_clubs?.[0]?.city ?? '', province: row.golf_clubs?.[0]?.region ?? '', holes: ([9, 18, 27, 36].includes(row.holes) ? row.holes : 18) as GolfCourse['holes'], par: 72, yardage: 6800, distanceKm: 0, caddieCount: 1, amenities: ['Caddie service', 'Practice facilities'] }));
  },
  async getCourse(courseId: string): Promise<GolfCourse | null> { return (await this.listCourses()).find((course) => course.id === courseId) ?? null; },
  async listCaddies(courseId?: string): Promise<Caddie[]> {
    const client = getSupabaseClient();
    let assignmentQuery = client.from('caddie_club_assignments').select('caddie_id,club_id,registry_number').eq('verification_status', 'verified');
    if (courseId) {
      const { data: course } = await client.from('courses').select('club_id').eq('id', courseId).maybeSingle();
      if (course?.club_id) assignmentQuery = assignmentQuery.eq('club_id', course.club_id);
    }
    const [{ data: profiles, error: profileError }, { data: assignments, error: assignmentError }, { data: courses, error: coursesError }] = await Promise.all([
      client.from('caddie_profiles').select('user_id,tagline,bio,years_experience,rate_amount_in_centavos').eq('verification_status', 'verified'),
      assignmentQuery,
      client.from('courses').select('id,club_id').eq('is_active', true),
    ]);
    if (profileError) throw profileError;
    if (assignmentError) throw assignmentError;
    if (coursesError) throw coursesError;
    const assignmentRows = (assignments ?? []) as AssignmentRow[];
    const caddieProfiles = (profiles ?? []) as CaddieProfileRow[];
    const courseRows = (courses ?? []) as CourseClubRow[];
    const ids = assignmentRows.map((item) => item.caddie_id);
    if (!ids.length) return [];
    const { data: names, error: namesError } = await client.from('caddie_directory').select('id,display_name').in('id', ids);
    if (namesError) throw namesError;
    const nameRows = (names ?? []) as ProfileNameRow[];
    return caddieProfiles.filter((profile) => ids.includes(profile.user_id)).map((profile) => { const clubId = assignmentRows.find((item) => item.caddie_id === profile.user_id)?.club_id; return ({ id: profile.user_id, role: 'caddie', displayName: nameRows.find((item) => item.id === profile.user_id)?.display_name ?? 'NoBogey Caddie', homeCourseId: courseRows.find((item) => item.club_id === clubId)?.id ?? '', bio: profile.bio ?? profile.tagline ?? '', specialties: ['Course strategy', 'Green reading'], languages: ['English', 'Filipino'], courseKnowledge: [], yearsExperience: profile.years_experience ?? 0, ratingAverage: 5, reviewCount: 0, completedRounds: 0, portfolioHighlights: [], rate: { amountInCentavos: Number(profile.rate_amount_in_centavos), currency: 'PHP' }, verificationStatus: 'verified' }); });
  },
  async listTeeTimes(courseId: string, date: string): Promise<TeeTimeSlot[]> { return getAvailableTeeTimes(courseId, date); },
  async getTeeTime(_slotId: string): Promise<TeeTimeSlot | null> { return null; },
  async listBookings(): Promise<Booking[]> { const client = getSupabaseClient(); const { data: session } = await client.auth.getSession(); if (!session.session) return []; const { data, error } = await client.from('bookings').select('*').order('starts_at'); if (error) throw error; return (data ?? []).map(mapBooking); },
  async getBooking(bookingId: string): Promise<Booking | null> { const { data, error } = await getSupabaseClient().from('bookings').select('*').eq('id', bookingId).maybeSingle(); if (error) throw error; return data ? mapBooking(data) : null; },
  async listAvailability(caddieId: string): Promise<AvailabilitySlot[]> { const { data, error } = await getSupabaseClient().from('caddie_availability').select('*').eq('caddie_id', caddieId); if (error) throw error; return ((data ?? []) as AvailabilityRow[]).map((row) => ({ id: row.id, caddieId: row.caddie_id, courseId: row.club_id, startsAt: row.starts_at, endsAt: row.ends_at, status: row.is_available ? 'open' : 'blocked' })); },
  listWeekDates(): readonly string[] { return Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() + offset + 1); return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); }); }
};

/** @deprecated Compatibility export retained for existing backend consumers. */
export const mobileMockService = mobileDataService;
