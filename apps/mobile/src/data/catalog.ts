import type { Booking, Caddie, GolfCourse, Golfer } from "@nobogey/contracts";

// TODO: wire up real data sources through the mobile backend service boundary.
// Empty collections keep the UI honest until those services are implemented.
export const courses: GolfCourse[] = [];
export const caddies: Caddie[] = [];
export const bookings: Booking[] = [];
export const currentGolfer: Golfer | null = null;
