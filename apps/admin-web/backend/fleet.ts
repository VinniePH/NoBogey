export type Tier = "TRAINER" | "CLASS B" | "CLASS A";
export type Caddie = { id: string; name: string; tier: Tier; rate: number; years: number; active: boolean; strikes: number; custom?: boolean };
export type FleetState = { caddies: Caddie[]; defaultTimes: string[]; dayTimes: Record<string, string[]>; assignments: Record<string, string[]>; bookingWindow: number };

export const MAX_STRIKES = 3;
export const MAX_PER_TEE_TIME = 4;
export const ROUND_MINUTES = 240;

const key = "nobogey.admin.fleet.v1";
const seed: FleetState = {
  bookingWindow: 3,
  defaultTimes: ["6:00 AM", "7:30 AM", "9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM"],
  dayTimes: {},
  assignments: {},
  caddies: [["Berto M.", "CLASS B", 1500, 12], ["Elena S.", "CLASS A", 1800, 8], ["Jun-Jun T.", "CLASS B", 1650, 15], ["Marco D.", "CLASS A", 1750, 10], ["Rosa L.", "CLASS B", 1550, 16], ["Tatay Edgar", "CLASS A", 1950, 28], ["Andres V.", "CLASS B", 1600, 9], ["Lina B.", "CLASS A", 1850, 11], ["Kiko R.", "TRAINER", 1300, 3]].map(([name, tier, rate, years], index) => ({ id: `c${index + 1}`, name: name as string, tier: tier as Tier, rate: rate as number, years: years as number, active: true, strikes: 0 }))
};

let state: FleetState = load();
const listeners = new Set<() => void>();

function load(): FleetState {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return seed;
    const { audit: _audit, ...savedState } = JSON.parse(saved) as FleetState & { audit?: unknown };
    return savedState;
  } catch {
    return seed;
  }
}

function update(next: FleetState) {
  state = next;
  localStorage.setItem(key, JSON.stringify(state));
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
export function addCaddie(name: string, tier: Tier, rate: number, years: number) { const caddie: Caddie = { id: crypto.randomUUID(), name: name.trim(), tier: normalizeTier(tier), rate, years, active: true, strikes: 0, custom: true }; update({ ...state, caddies: [...state.caddies, caddie] }); }
export function toggleCaddie(id: string) { const caddie = state.caddies.find(c => c.id === id); if (!caddie) return; update({ ...state, caddies: state.caddies.map(c => c.id === id ? { ...c, active: !c.active } : c) }); }
export function removeCaddie(id: string) { const caddie = state.caddies.find(c => c.id === id); if (!caddie?.custom) return; const assignments = Object.fromEntries(Object.entries(state.assignments).map(([assignmentKey, ids]) => [assignmentKey, ids.filter(caddieId => caddieId !== id)])); update({ ...state, caddies: state.caddies.filter(c => c.id !== id), assignments }); }
export function reportCaddie(id: string, _reason: string) { const caddie = state.caddies.find(c => c.id === id); if (!caddie || caddie.strikes >= MAX_STRIKES) return; update({ ...state, caddies: state.caddies.map(c => c.id === id ? { ...c, strikes: c.strikes + 1 } : c) }); }
export function removeStrike(id: string) { const caddie = state.caddies.find(c => c.id === id); if (!caddie || !caddie.strikes) return; update({ ...state, caddies: state.caddies.map(c => c.id === id ? { ...c, strikes: c.strikes - 1 } : c) }); }

export function addTeeTime(date: string, time: string, allTime = false) {
  if (allTime) { const nextDayTimes = Object.fromEntries(Object.entries(state.dayTimes).map(([day, times]) => [day, day >= date ? sorted([...times, time]) : times])); update({ ...state, defaultTimes: sorted([...state.defaultTimes, time]), dayTimes: nextDayTimes }); return; }
  update({ ...state, dayTimes: { ...state.dayTimes, [date]: sorted([...dayTimes(date), time]) } });
}
export function removeTeeTime(date: string, time: string, allTime = false) {
  const assignments = Object.fromEntries(Object.entries(state.assignments).filter(([assignmentKey]) => allTime ? !assignmentKey.endsWith(`|${time}`) : assignmentKey !== `${date}|${time}`));
  if (allTime) { const nextDayTimes = Object.fromEntries(Object.entries(state.dayTimes).map(([day, times]) => [day, day >= date ? times.filter(entry => entry !== time) : times])); update({ ...state, defaultTimes: state.defaultTimes.filter(entry => entry !== time), dayTimes: nextDayTimes, assignments }); return; }
  update({ ...state, dayTimes: { ...state.dayTimes, [date]: dayTimes(date).filter(entry => entry !== time) }, assignments });
}
export function assignCaddie(date: string, time: string, caddieId: string): { ok: true } | { ok: false; reason: string } {
  const caddie = state.caddies.find(c => c.id === caddieId); const assignmentKey = `${date}|${time}`; const assigned = state.assignments[assignmentKey] ?? [];
  if (!caddie?.active) return { ok: false, reason: "This caddie is inactive and cannot be assigned." };
  if (assigned.includes(caddieId)) return { ok: false, reason: `${caddie.name} is already assigned to this tee time.` };
  if (assigned.length >= MAX_PER_TEE_TIME) return { ok: false, reason: `This tee time already has the maximum of ${MAX_PER_TEE_TIME} caddies.` };
  const conflict = Object.entries(state.assignments).find(([otherKey, ids]) => { const [otherDate, otherTime = ""] = otherKey.split("|"); return otherDate === date && ids.includes(caddieId) && Math.abs(minutes(otherTime) - minutes(time)) < ROUND_MINUTES; });
  if (conflict) return { ok: false, reason: `${caddie.name} is already booked within the required ${ROUND_MINUTES / 60}-hour round window.` };
  update({ ...state, assignments: { ...state.assignments, [assignmentKey]: [...assigned, caddieId] } });
  return { ok: true };
}
export function unassignCaddie(date: string, time: string) { const assignmentKey = `${date}|${time}`; const assigned = state.assignments[assignmentKey] ?? []; if (!assigned.length) return; update({ ...state, assignments: { ...state.assignments, [assignmentKey]: assigned.slice(0, -1) } }); }
