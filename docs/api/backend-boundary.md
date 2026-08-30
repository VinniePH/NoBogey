# NoBogey Backend Boundary

Supabase Postgres, Auth, Storage, and Row Level Security are the selected backend foundation. This document defines the expected API surface; frontend adapters are not connected to the new schema yet.

## Auth and Sessions

- Supported roles are `golfer`, `caddie`, `club_manager`, `admin`, and `super_admin`.
- Supabase Auth owns identity. Database-owned `user_roles` and `club_staff` rows own authorization; user-editable metadata is never authoritative.
- API requests use the verified Supabase session identity. Callers do not submit an authoritative user, role, or club ID.
- Permission failures should return `PERMISSION_DENIED` with a stable request id.

## Route Groups

- `/golfers`: golfer profile, preferred caddies, recent courses, and booking history.
- `/caddies`: caddie profile, verification status, portfolio, rates, reviews, and availability.
- `/courses`: course search, course detail, clubhouse rules, and caddie roster.
- `/availability`: available slots, holds, blocks, and conflict checks.
- `/bookings`: booking request, confirmation, cancellation, completion, and history.
- `/reviews`: post-round feedback and rating summaries.
- `/payments`: payment intent creation, GCash handoff, webhook status, refunds, and disputes.

## Booking Lifecycle

Allowed booking states are `draft`, `requested`, `confirmed`, `in_progress`, `completed`, `canceled`, `declined`, and `conflicted`.

The persistence model begins at `pending`; the future frontend adapter maps persisted `pending` to the existing public-contract `requested` value. Client-only `draft` remains outside the database. This preserves the shared frontend contract while ensuring no booking is confirmed before a verified provider callback.

The backend owns conflict checks. A booking request must fail with `BOOKING_CONFLICT` when the selected caddie is no longer available, the time slot is invalid, or the slot is already booked.

## Payment Lifecycle

Allowed payment states are `not_required`, `requires_payment`, `processing`, `paid`, `failed`, `abandoned`, and `refunded`.

GCash integration is future work. The backend should own payment intent creation, redirect or handoff metadata, asynchronous payment callbacks, abandoned payment cleanup, and refund or dispute records.

## Ownership Rules

- Mobile owns presentation, local placeholders, and optimistic UI states.
- Admin web will own operations workflows only after backend permissions exist.
- Backend owns persistence, identity, permission checks, booking conflicts, payment state, audit trails, and external integrations.
- Shared contracts define domain language but do not replace backend validation.

## Phase 5: Mobile and Admin-Web Contract Compatibility

`packages/contracts` is the canonical vocabulary for both frontends. It uses
the same opaque string identifiers (`courseId`, `caddieId`, `bookingId`, and
tee-time `slotId`), ISO 8601 timestamps with an explicit offset, Philippine
pesos represented as `MoneyAmount.amountInCentavos`, and these lifecycle
values:

- Tee times: `open`, `held`, `full`, `closed`.
- Bookings: `draft`, `requested`, `confirmed`, `in_progress`, `completed`,
  `canceled`, `declined`, `conflicted`.
- Caddie assignment: `preferred_requested`, `preferred_assigned`,
  `replacement_assigned`, `no_caddie_available`.
- Verification: `draft`, `pending`, `changes_requested`, `verified`,
  `rejected`.

The mobile and admin web mocks remain independent local fixtures. Admin fleet
records map whole-peso rates and display dates/times into the shared money and
timestamp formats at their local adapter boundary. A decision in admin-web
does **not** update mobile data, and mobile data does **not** update admin-web.
This phase establishes compatibility only; a future authenticated API must own
persistence, cross-application synchronization, authorization, and lifecycle
transition validation.

## Common Error Responses

- `AUTH_REQUIRED`: no valid user session.
- `PERMISSION_DENIED`: authenticated user lacks role or ownership.
- `NOT_FOUND`: requested course, caddie, booking, or payment does not exist.
- `VALIDATION_FAILED`: request shape or business input is invalid.
- `BOOKING_CONFLICT`: selected caddie, slot, or booking state cannot proceed.
- `PAYMENT_FAILED`: payment provider rejected or failed the payment.
- `RATE_LIMITED`: client must retry later.
- `UNKNOWN`: unexpected server failure with a request id for support.
