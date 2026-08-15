import type { AvailabilitySlot, Booking, Caddie, GolfCourse, TeeTimeSlot } from "@nobogey/contracts";

/**
 * Local mobile data boundary while no remote backend is configured. Its public
 * contract deliberately matches the former fixture adapter so Supabase can
 * replace only these method bodies later.
 */
export const mobileDataService = {
  async listCourses(): Promise<GolfCourse[]> { return []; },
  async getCourse(_courseId: string): Promise<GolfCourse | null> { return null; },
  async listCaddies(_courseId?: string): Promise<Caddie[]> { return []; },
  async listTeeTimes(_courseId: string, _date: string): Promise<TeeTimeSlot[]> { return []; },
  async getTeeTime(_slotId: string): Promise<TeeTimeSlot | null> { return null; },
  async listBookings(): Promise<Booking[]> { return []; },
  async getBooking(_bookingId: string): Promise<Booking | null> { return null; },
  async listAvailability(_caddieId: string): Promise<AvailabilitySlot[]> { return []; },
  listWeekDates(): readonly string[] { return []; }
};

/** @deprecated Compatibility export retained for existing backend consumers. */
export const mobileMockService = mobileDataService;
