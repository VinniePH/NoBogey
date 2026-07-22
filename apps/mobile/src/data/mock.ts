import type {
  AvailabilitySlot,
  Booking,
  Caddie,
  GolfCourse,
  Golfer,
  PaymentIntent,
  Review
} from "@nobogey/contracts";

export const courses: GolfCourse[] = [
  {
    id: "course-ayala",
    name: "Ayala Greenfield Golf",
    city: "Calamba",
    province: "Laguna",
    holes: 18,
    par: 72,
    yardage: 6325,
    distanceKm: 18.4,
    caddieCount: 24,
    amenities: ["Driving range", "Locker room", "Clubhouse dining"],
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "course-villamor",
    name: "Villamor Air Base Golf",
    city: "Pasay",
    province: "Metro Manila",
    holes: 18,
    par: 72,
    yardage: 6175,
    distanceKm: 8.9,
    caddieCount: 31,
    amenities: ["Night range", "Rental clubs", "Practice green"],
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "course-southwoods",
    name: "The Manila Southwoods",
    city: "Carmona",
    province: "Cavite",
    holes: 36,
    par: 72,
    yardage: 7084,
    distanceKm: 29.7,
    caddieCount: 42,
    amenities: ["Championship course", "Bag drop", "Pro shop"],
    imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85"
  }
];

export const golfer: Golfer = {
  id: "golfer-mia",
  role: "golfer",
  displayName: "Mia Santos",
  handicap: 18,
  homeCourseId: "course-ayala",
  preferredCaddieIds: ["caddie-rafa", "caddie-lena"],
  recentCourseIds: ["course-ayala", "course-villamor"],
  memberSince: "2024-04-18"
};

export const caddies: Caddie[] = [
  {
    id: "caddie-rafa",
    role: "caddie",
    displayName: "Rafa Dizon",
    avatarUrl: "https://i.pravatar.cc/160?img=12",
    homeCourseId: "course-ayala",
    bio: "Reads grain quickly and keeps pace calm for early morning groups.",
    specialties: ["Green reading", "Pace management", "Tournament loops"],
    languages: ["English", "Filipino"],
    courseKnowledge: ["Green reading", "Wind on holes 8–12", "Championship tees"],
    yearsExperience: 9,
    ratingAverage: 4.9,
    reviewCount: 86,
    completedRounds: 1180,
    portfolioHighlights: [
      "Club championship finalist support",
      "Preferred by three member foursomes"
    ],
    rate: { amountInCentavos: 240000, currency: "PHP" },
    verified: true
  },
  {
    id: "caddie-lena",
    role: "caddie",
    displayName: "Lena Cruz",
    avatarUrl: "https://i.pravatar.cc/160?img=47",
    homeCourseId: "course-villamor",
    bio: "Strong course management coach for mid-handicap golfers.",
    specialties: ["Club selection", "Course strategy", "Short game"],
    languages: ["English", "Filipino", "Cebuano"],
    courseKnowledge: ["First-time guest guidance", "Risk-reward strategy", "Short-game reads"],
    yearsExperience: 6,
    ratingAverage: 4.8,
    reviewCount: 64,
    completedRounds: 740,
    portfolioHighlights: [
      "Junior clinic volunteer",
      "Known for first-time guest guidance"
    ],
    rate: { amountInCentavos: 210000, currency: "PHP" },
    verified: true
  },
  {
    id: "caddie-marc",
    role: "caddie",
    displayName: "Marc Reyes",
    avatarUrl: "https://i.pravatar.cc/160?img=68",
    homeCourseId: "course-southwoods",
    bio: "Reliable loop for long courses and groups that need precise yardage.",
    specialties: ["Yardage", "Wind reads", "Walking pace"],
    languages: ["English", "Filipino"],
    courseKnowledge: ["Championship tees", "Precise yardage", "Long-course pacing"],
    yearsExperience: 11,
    ratingAverage: 4.7,
    reviewCount: 92,
    completedRounds: 1330,
    portfolioHighlights: [
      "Southwoods member favorite",
      "Experienced with championship tees"
    ],
    rate: { amountInCentavos: 260000, currency: "PHP" },
    verified: true
  }
];

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: "slot-rafa-0630",
    caddieId: "caddie-rafa",
    courseId: "course-ayala",
    startsAt: "2026-07-08T06:30:00+08:00",
    endsAt: "2026-07-08T11:00:00+08:00",
    status: "open"
  },
  {
    id: "slot-lena-0715",
    caddieId: "caddie-lena",
    courseId: "course-villamor",
    startsAt: "2026-07-08T07:15:00+08:00",
    endsAt: "2026-07-08T11:45:00+08:00",
    status: "held"
  },
  {
    id: "slot-marc-0900",
    caddieId: "caddie-marc",
    courseId: "course-southwoods",
    startsAt: "2026-07-09T09:00:00+08:00",
    endsAt: "2026-07-09T13:30:00+08:00",
    status: "open"
  }
];

export const bookings: Booking[] = [
  {
    id: "booking-1024",
    golferId: "golfer-mia",
    caddieId: "caddie-rafa",
    courseId: "course-ayala",
    slotId: "slot-rafa-0630",
    status: "requested",
    teeTime: "2026-07-08T06:30:00+08:00",
    partySize: 2,
    notes: "Walking round, prefers help around greens.",
    quotedRate: { amountInCentavos: 240000, currency: "PHP" }
  }
];

export const reviews: Review[] = [
  {
    id: "review-001",
    bookingId: "booking-0901",
    golferId: "golfer-mia",
    caddieId: "caddie-rafa",
    rating: 5,
    comment: "Kept our group moving and saved strokes around the green.",
    createdAt: "2026-06-21T16:00:00+08:00"
  }
];

export const paymentIntents: PaymentIntent[] = [
  {
    id: "pay-1024",
    bookingId: "booking-1024",
    provider: "gcash",
    status: "requires_payment",
    amount: { amountInCentavos: 240000, currency: "PHP" },
    createdAt: "2026-07-06T09:30:00+08:00"
  }
];
