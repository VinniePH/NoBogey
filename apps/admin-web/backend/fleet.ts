import { supabase } from "../src/lib/supabase";

export type Tier = "TRAINER" | "CLASS B" | "CLASS A";
export type Caddie = { id: string; name: string; tier: Tier; rate: number; years: number; active: boolean; strikes: number; custom?: boolean };
export type FleetState = { caddies: Caddie[]; defaultTimes: string[]; dayTimes: Record<string, string[]>; assignments: Record<string, string[]>; bookingWindow: number };

export const MAX_STRIKES = 3;
export const MAX_PER_TEE_TIME = 4;
export const ROUND_MINUTES = 240;

const seed: FleetState = {
  bookingWindow: 3,
  defaultTimes: [],
  dayTimes: {},
  assignments: {},
  caddies: []
};

let state: FleetState = seed;
const listeners = new Set<() => void>();

async function hydrate() {
  const dayTimes: Record<string, string[]> = {};
  const authoritativeAssignments: Record<string, string[]> = {};
  try {
    const scope = await managedCourseScope();
    const { data: assignments, error: assignmentError } = await supabase.from("caddie_club_assignments")
      .select("caddie_id,verification_status,is_active").eq("club_id", scope.clubId).eq("verification_status", "verified").limit(1000);
    if (assignmentError) throw assignmentError;
    const assignedIds = [...new Set((assignments ?? []).map(item => item.caddie_id))];
    const safeIds = assignedIds.length ? assignedIds : ["00000000-0000-0000-0000-000000000000"];
    const [{ data: preference }, profileResult, nameResult, complianceResult] = await Promise.all([
      supabase.from("admin_portal_state").select("state").eq("id", "primary").maybeSingle(),
      supabase.from("caddie_profiles").select("user_id,tagline,years_experience,rate_amount_in_centavos,verification_status").in("user_id", safeIds).eq("verification_status", "verified").limit(1000),
      supabase.from("profiles").select("id,display_name,is_active").in("id", safeIds).limit(1000),
      supabase.from("caddie_compliance_events").select("caddie_id").eq("club_id", scope.clubId).in("caddie_id", safeIds).is("resolved_at", null).limit(2000)
    ]);
    if (profileResult.error) throw profileResult.error;
    if (nameResult.error) throw nameResult.error;
    if (complianceResult.error) throw complianceResult.error;
    const stored = preference?.state ? preference.state as FleetState : seed;
    const caddies = (profileResult.data ?? []).map(profile => ({
      id: profile.user_id,
      name: (nameResult.data ?? []).find(item => item.id === profile.user_id)?.display_name ?? "NoBogey Caddie",
      tier: normalizeTier(profile.tagline ?? "CLASS A"),
      rate: Math.round(Number(profile.rate_amount_in_centavos) / 100),
      years: profile.years_experience ?? 0,
      active: ((assignments ?? []).find(item => item.caddie_id === profile.user_id)?.is_active ?? true)
        && ((nameResult.data ?? []).find(item => item.id === profile.user_id)?.is_active ?? true),
      strikes: (complianceResult.data ?? []).filter(item => item.caddie_id === profile.user_id).length,
      custom: true
    } satisfies Caddie));
    const horizon = new Date();
    horizon.setUTCMonth(horizon.getUTCMonth() + Math.min(12, stored.bookingWindow));
    const [{ data: slots, error: slotsError }, { data: activeBookings, error: bookingsError }] = await Promise.all([
      supabase.from("tee_times").select("id,starts_at,status").eq("course_id", scope.courseId).gte("starts_at", new Date().toISOString()).lte("starts_at", horizon.toISOString()).eq("status", "open").order("starts_at").limit(1000),
      supabase.from("bookings").select("caddie_id,tee_time_id,starts_at,status,expires_at").eq("course_id", scope.courseId).in("status", ["pending", "confirmed", "in_progress"]).gte("ends_at", new Date().toISOString()).order("starts_at").limit(2000)
    ]);
    if (slotsError) throw slotsError;
    if (bookingsError) throw bookingsError;
    const slotById = new Map((slots ?? []).map(slot => [slot.id, slot]));
    const { data: availability, error: availabilityError } = assignedIds.length
      ? await supabase.from("caddie_tee_time_availability").select("tee_time_id,caddie_id").in("caddie_id", assignedIds.slice(0, 500)).limit(4000)
      : { data: [], error: null };
    if (availabilityError) throw availabilityError;
    for (const slot of slots ?? []) {
      const key = manilaSlotKey(slot.starts_at);
      dayTimes[key.date] = sorted([...(dayTimes[key.date] ?? []), key.time]);
    }
    for (const declaration of availability ?? []) {
      const slot = slotById.get(declaration.tee_time_id);
      if (!slot) continue;
      const key = manilaSlotKey(slot.starts_at);
      const assignmentKey = `${key.date}|${key.time}`;
      authoritativeAssignments[assignmentKey] = [...new Set([...(authoritativeAssignments[assignmentKey] ?? []), declaration.caddie_id])];
    }
    for (const booking of activeBookings ?? []) {
      if (booking.status === "pending" && (!booking.expires_at || new Date(booking.expires_at) <= new Date())) continue;
      const key = manilaSlotKey(booking.starts_at);
      const assignmentKey = `${key.date}|${key.time}`;
      authoritativeAssignments[assignmentKey] = [...new Set([...(authoritativeAssignments[assignmentKey] ?? []), booking.caddie_id])];
    }
    state = { ...stored, defaultTimes: [], dayTimes, assignments: authoritativeAssignments, caddies };
    if (!preference?.state) await persist(state);
  } catch {
    state = seed;
  }
  listeners.forEach(listener => listener());
}
async function persist(next: FleetState) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const preferences: FleetState = {
    bookingWindow: next.bookingWindow,
    defaultTimes: [],
    dayTimes: {},
    assignments: {},
    caddies: []
  };
  await supabase.from("admin_portal_state").upsert({ id: "primary", state: preferences, updated_by: auth.user.id, updated_at: new Date().toISOString() });
}

async function managedCourseScope() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("AUTH_REQUIRED");
  const { data: staff, error: staffError } = await supabase.from("club_staff").select("club_id").eq("user_id", auth.user.id).eq("is_active", true).limit(1).maybeSingle();
  if (staffError) throw staffError;
  let query = supabase.from("courses").select("id,club_id").eq("is_active", true).order("created_at").limit(1);
  if (staff?.club_id) query = query.eq("club_id", staff.club_id);
  const { data: course, error } = await query.maybeSingle();
  if (error) throw error;
  if (!course) throw new Error("MANAGED_COURSE_REQUIRED");
  return { courseId: course.id, clubId: course.club_id };
}
async function managedCourseId() { return (await managedCourseScope()).courseId; }

function teeTimeInstant(date: string, time: string) {
  const [clock = "0:00", marker = "AM"] = time.split(" ");
  const [rawHour = 0, minute = 0] = clock.split(":").map(Number);
  const hour = rawHour % 12 + (marker === "PM" ? 12 : 0);
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`);
}
function manilaSlotKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "numeric", minute: "2-digit", hour12: true
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${Number(part("hour"))}:${part("minute")} ${part("dayPeriod")}` };
}
void hydrate();
supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN" || event === "INITIAL_SESSION") void hydrate(); });
supabase.channel("admin-portal-state").on("postgres_changes", { event: "*", schema: "public", table: "admin_portal_state", filter: "id=eq.primary" }, () => void hydrate()).subscribe();
supabase.channel("admin-authoritative-schedule")
  .on("postgres_changes", { event: "*", schema: "public", table: "tee_times" }, () => void hydrate())
  .on("postgres_changes", { event: "*", schema: "public", table: "caddie_tee_time_availability" }, () => void hydrate())
  .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void hydrate())
  .subscribe();
addEventListener("online", () => void hydrate());
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") void hydrate(); });

function update(next: FleetState) {
  state = next;
  void persist(state);
  listeners.forEach(listener => listener());
}

export function getState() { return state; }
export function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function normalizeTier(value: string): Tier { const clean = value.trim().toUpperCase(); return clean === "TRAINER" ? "TRAINER" : clean === "CLASS B" ? "CLASS B" : "CLASS A"; }
export function formatDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function formatTime(hour: number, minute: number, meridiem: string) { return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`; }

function minutes(time: string) { const [clock = "0:00", marker] = time.split(" "); const [h = 0, m = 0] = clock.split(":").map(Number); return (h % 12 + (marker === "PM" ? 12 : 0)) * 60 + m; }
function sorted(times: string[]) { return [...new Set(times)].sort((a, b) => minutes(a) - minutes(b)); }
function dayTimes(date: string) { return state.dayTimes[date] ?? state.defaultTimes; }

export function setBookingWindow(value: number) { const bookingWindow = Math.min(60, Math.max(1, Math.round(value) || 3)); update({ ...state, bookingWindow }); }
export async function addCaddie(email: string, name: string, tier: Tier, rate: number, years: number): Promise<void>;
/** @deprecated Caddie enrollment now requires the account email. */
export async function addCaddie(name: string, tier: Tier, rate: number, years: number): Promise<void>;
export async function addCaddie(email: string, name: string, tier: Tier | number, rate: number, years?: number) {
  if (years === undefined || typeof tier === "number") throw new Error("A registered caddie account email is required.");
  const { error } = await supabase.rpc("admin_enroll_existing_caddie", {
    p_email: email.trim().toLowerCase(), p_display_name: name.trim(), p_tier: normalizeTier(tier),
    p_rate_amount_in_centavos: Math.round(rate * 100), p_years_experience: Math.round(years), p_club_id: null
  });
  if (error) throw error;
  await hydrate();
}
export async function toggleCaddie(id: string) { const caddie = state.caddies.find(c => c.id === id); if (!caddie) return; const { clubId } = await managedCourseScope(); const { error } = await supabase.rpc("admin_set_caddie_active", { p_caddie_id: id, p_active: !caddie.active, p_club_id: clubId }); if (error) throw error; await hydrate(); }
export async function removeCaddie(id: string) { const { clubId } = await managedCourseScope(); const { error } = await supabase.rpc("admin_set_caddie_active", { p_caddie_id: id, p_active: false, p_club_id: clubId }); if (error) throw error; await hydrate(); }
export async function reportCaddie(id: string, reason: string) { const { error } = await supabase.rpc("admin_report_caddie", { p_caddie_id: id, p_reason: reason }); if (error) throw error; await hydrate(); }
export async function removeStrike(id: string) { const { error } = await supabase.rpc("admin_resolve_caddie_report", { p_caddie_id: id }); if (error) throw error; await hydrate(); }

export async function addTeeTime(date: string, time: string, allTime = false) {
  const courseId = await managedCourseId();
  const startsAt = teeTimeInstant(date, time);
  const endsAt = new Date(startsAt.getTime() + ROUND_MINUTES * 60_000);
  const cutoff = new Date(startsAt.getTime() - 2 * 60 * 60_000);
  const { error } = await supabase.rpc("publish_tee_time", { p_course_id: courseId, p_starts_at: startsAt.toISOString(), p_ends_at: endsAt.toISOString(), p_booking_cutoff_at: cutoff.toISOString(), p_capacity: 4 });
  if (error) throw error;
  if (allTime) { const nextDayTimes = Object.fromEntries(Object.entries(state.dayTimes).map(([day, times]) => [day, day >= date ? sorted([...times, time]) : times])); update({ ...state, defaultTimes: sorted([...state.defaultTimes, time]), dayTimes: nextDayTimes }); return; }
  update({ ...state, dayTimes: { ...state.dayTimes, [date]: sorted([...dayTimes(date), time]) } });
}
export async function removeTeeTime(date: string, time: string, allTime = false) {
  if (allTime) throw new Error("Series removal requires explicit dated tee times.");
  const courseId = await managedCourseId();
  const startsAt = teeTimeInstant(date, time);
  const { data: slot, error: lookupError } = await supabase.from("tee_times").select("id,starts_at,ends_at,booking_cutoff_at,player_capacity").eq("course_id", courseId).eq("starts_at", startsAt.toISOString()).maybeSingle();
  if (lookupError) throw lookupError;
  if (!slot) throw new Error("TEE_TIME_NOT_FOUND");
  const { error } = await supabase.rpc("update_published_tee_time", { p_tee_time_id: slot.id, p_starts_at: slot.starts_at, p_ends_at: slot.ends_at, p_booking_cutoff_at: slot.booking_cutoff_at, p_capacity: slot.player_capacity, p_status: "canceled" });
  if (error) throw error;
  const assignments = Object.fromEntries(Object.entries(state.assignments).filter(([assignmentKey]) => allTime ? !assignmentKey.endsWith(`|${time}`) : assignmentKey !== `${date}|${time}`));
  if (allTime) { const nextDayTimes = Object.fromEntries(Object.entries(state.dayTimes).map(([day, times]) => [day, day >= date ? times.filter(entry => entry !== time) : times])); update({ ...state, defaultTimes: state.defaultTimes.filter(entry => entry !== time), dayTimes: nextDayTimes, assignments }); return; }
  update({ ...state, dayTimes: { ...state.dayTimes, [date]: dayTimes(date).filter(entry => entry !== time) }, assignments });
}
export async function assignCaddie(date: string, time: string, caddieId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const caddie = state.caddies.find(c => c.id === caddieId); const assignmentKey = `${date}|${time}`; const assigned = state.assignments[assignmentKey] ?? [];
  if (!caddie?.active) return { ok: false, reason: "This caddie is inactive and cannot be assigned." };
  if (assigned.includes(caddieId)) return { ok: false, reason: `${caddie.name} is already assigned to this tee time.` };
  if (assigned.length >= MAX_PER_TEE_TIME) return { ok: false, reason: `This tee time already has the maximum of ${MAX_PER_TEE_TIME} caddies.` };
  const conflict = Object.entries(state.assignments).find(([otherKey, ids]) => { const [otherDate, otherTime = ""] = otherKey.split("|"); return otherDate === date && ids.includes(caddieId) && Math.abs(minutes(otherTime) - minutes(time)) < ROUND_MINUTES; });
  if (conflict) return { ok: false, reason: `${caddie.name} is already booked within the required ${ROUND_MINUTES / 60}-hour round window.` };
  const courseId = await managedCourseId();
  const { data: slot, error: lookupError } = await supabase.from("tee_times").select("id").eq("course_id", courseId).eq("starts_at", teeTimeInstant(date, time).toISOString()).eq("status", "open").maybeSingle();
  if (lookupError) throw lookupError;
  if (!slot) return { ok: false, reason: "This published tee time is no longer available." };
  const { error } = await supabase.rpc("admin_set_caddie_tee_time_availability", { p_tee_time_id: slot.id, p_caddie_id: caddieId, p_available: true });
  if (error) throw error;
  await hydrate();
  return { ok: true };
}
export async function unassignCaddie(date: string, time: string) {
  const assignmentKey = `${date}|${time}`;
  const assigned = state.assignments[assignmentKey] ?? [];
  const caddieId = assigned.at(-1);
  if (!caddieId) return;
  const courseId = await managedCourseId();
  const { data: slot, error: lookupError } = await supabase.from("tee_times").select("id").eq("course_id", courseId).eq("starts_at", teeTimeInstant(date, time).toISOString()).maybeSingle();
  if (lookupError) throw lookupError;
  if (!slot) throw new Error("TEE_TIME_NOT_FOUND");
  const { error } = await supabase.rpc("admin_set_caddie_tee_time_availability", { p_tee_time_id: slot.id, p_caddie_id: caddieId, p_available: false });
  if (error) throw error;
  await hydrate();
}
