import { getSupabaseClient } from "../client";

export type ScheduleSlot = {
  id: string;
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  time: string;
  availability: "open" | "booked" | "off";
};

const dayIds = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function manilaDayAndTime(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(part("weekday"));
  return { day: dayIds[dayIndex] ?? "sun", time: `${part("hour")}:${part("minute")}` };
}

/** Load the caddie's schedule from the club's authoritative published tee times. */
export async function loadSchedule(): Promise<ScheduleSlot[]> {
  const client = getSupabaseClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return [];
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 8);
  const [{ data: assignment, error: assignmentError }, { data: selected, error: selectedError }, { data: bookings, error: bookingError }] = await Promise.all([
    client.from("caddie_club_assignments").select("club_id").eq("caddie_id", auth.user.id).eq("is_primary", true).eq("verification_status", "verified").eq("is_active", true).maybeSingle(),
    client.from("caddie_tee_time_availability").select("tee_time_id").eq("caddie_id", auth.user.id).limit(500),
    client.from("bookings").select("tee_time_id").eq("caddie_id", auth.user.id).in("status", ["pending", "confirmed", "in_progress"]).gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString()).limit(100)
  ]);
  if (assignmentError) throw assignmentError;
  if (selectedError) throw selectedError;
  if (bookingError) throw bookingError;
  if (!assignment) return [];

  const { data: courses, error: courseError } = await client.from("courses").select("id").eq("club_id", assignment.club_id).eq("is_active", true).limit(50);
  if (courseError) throw courseError;
  const courseIds = (courses ?? []).map(({ id }) => id);
  if (!courseIds.length) return [];
  const { data: teeTimes, error: teeTimeError } = await client.from("tee_times").select("id,starts_at").in("course_id", courseIds).eq("status", "open").gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString()).order("starts_at").limit(500);
  if (teeTimeError) throw teeTimeError;

  const selectedIds = new Set((selected ?? []).map(({ tee_time_id }) => tee_time_id));
  const bookedIds = new Set((bookings ?? []).map(({ tee_time_id }) => tee_time_id).filter(Boolean));
  return (teeTimes ?? []).map((slot) => {
    const local = manilaDayAndTime(slot.starts_at);
    return {
      id: slot.id,
      day: local.day,
      time: local.time,
      availability: bookedIds.has(slot.id) ? "booked" : selectedIds.has(slot.id) ? "open" : "off"
    };
  });
}

/** Replace future availability in one bounded, authorization-checked database call. */
export async function saveSchedule(slots: ScheduleSlot[]): Promise<void> {
  const teeTimeIds = slots.filter(({ availability }) => availability === "open" || availability === "booked").map(({ id }) => id);
  const { error } = await getSupabaseClient().rpc("set_caddie_tee_time_availability", { p_tee_time_ids: teeTimeIds });
  if (error) throw error;
}
