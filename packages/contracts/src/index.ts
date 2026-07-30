export type UserRole = "golfer" | "caddie" | "admin";

export type CurrencyCode = "PHP";

export interface MoneyAmount {
  amountInCentavos: number;
  currency: CurrencyCode;
}

export interface Golfer {
  id: string;
  role: "golfer";
  displayName: string;
  handicap?: number;
  homeCourseId?: string;
  preferredCaddieIds: string[];
  recentCourseIds: string[];
  memberSince: string;
}

export interface Caddie {
  id: string;
  role: "caddie";
  displayName: string;
  /** A remote profile image. Consumers must provide an initials fallback. */
  avatarUrl?: string;
  homeCourseId: string;
  bio: string;
  specialties: string[];
  languages: string[];
  /** Course-specific skills a golfer can use to decide on a caddie. */
  courseKnowledge: string[];
  yearsExperience: number;
  ratingAverage: number;
  reviewCount: number;
  completedRounds: number;
  portfolioHighlights: string[];
  rate: MoneyAmount;
  verified: boolean;
}

export interface GolfCourse {
  id: string;
  name: string;
  city: string;
  province: string;
  holes: 9 | 18 | 27 | 36;
  /** Course scorecard par for the standard 18-hole layout. */
  par: number;
  /** Total length of the standard layout, in yards. */
  yardage: number;
  distanceKm: number;
  caddieCount: number;
  amenities: string[];
  /** Wide course photography used in marketplace cards and course profiles. */
  imageUrl?: string;
}

export type AvailabilityStatus = "open" | "held" | "booked" | "blocked";

export interface AvailabilitySlot {
  id: string;
  caddieId: string;
  courseId: string;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
}

/** A tee-sheet slot supplied by a club's booking system. */
export interface TeeTimeSlot {
  id: string;
  courseId: string;
  startsAt: string;
  /** Number of golfers that can be placed on this tee time. */
  remainingPlayerCapacity: number;
  /** Caddie teams still available for this tee time. */
  remainingCaddieCapacity: number;
  status: "open" | "held" | "full" | "closed";
  sourceUpdatedAt: string;
}

export type CaddieAssignmentStatus =
  | "preferred_requested"
  | "preferred_assigned"
  | "replacement_assigned"
  | "no_caddie_available";

export type BookingStatus =
  | "draft"
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "canceled"
  | "declined"
  | "conflicted";

export interface Booking {
  id: string;
  golferId: string;
  caddieId: string;
  courseId: string;
  slotId: string;
  status: BookingStatus;
  teeTime: string;
  partySize: number;
  notes: string;
  quotedRate: MoneyAmount;
  /** A golfer can request a person, while the club owns final assignment. */
  preferredCaddieId?: string;
  assignedCaddieId?: string;
  caddieAssignmentStatus?: CaddieAssignmentStatus;
}

export interface Review {
  id: string;
  bookingId: string;
  golferId: string;
  caddieId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export type PaymentProvider = "gcash" | "manual";

export type PaymentIntentStatus =
  | "not_required"
  | "requires_payment"
  | "processing"
  | "paid"
  | "failed"
  | "abandoned"
  | "refunded";

export interface PaymentIntent {
  id: string;
  bookingId: string;
  provider: PaymentProvider;
  status: PaymentIntentStatus;
  amount: MoneyAmount;
  createdAt: string;
}

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "BOOKING_CONFLICT"
  | "PAYMENT_FAILED"
  | "RATE_LIMITED"
  | "UNKNOWN";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  requestId: string;
  fieldErrors?: Record<string, string>;
}
