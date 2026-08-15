# NoBogey Backend Boundary

Supabase Auth is the selected mobile identity provider. Domain persistence is not selected yet; this document defines the remaining API surface and ownership rules.

## Auth and Sessions

- Golfers, caddies, and admins are distinct roles.
- Mobile uses Supabase email/password Auth with persisted sessions.
- Expo Router protects the `(app)` group whenever there is no authenticated Supabase session.
- The stored `preferred_role` user metadata is a UI preference only. It must never authorize golfer, caddie, or admin operations.
- Role authorization must come from database-backed profile state or trusted `app_metadata`, with RLS enforcing ownership for every exposed table.
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

The backend owns conflict checks. A booking request must fail with `BOOKING_CONFLICT` when the selected caddie is no longer available, the time slot is invalid, or the slot is already booked.

## Payment Lifecycle

Allowed payment states are `not_required`, `requires_payment`, `processing`, `paid`, `failed`, `abandoned`, and `refunded`.

GCash integration is future work. The backend should own payment intent creation, redirect or handoff metadata, asynchronous payment callbacks, abandoned payment cleanup, and refund or dispute records.

## Ownership Rules

- Mobile owns presentation, local placeholders, and optimistic UI states.
- Admin web will own operations workflows only after backend permissions exist.
- Backend owns persistence, identity, permission checks, booking conflicts, payment state, audit trails, and external integrations.
- Shared contracts define domain language but do not replace backend validation.

## Common Error Responses

- `AUTH_REQUIRED`: no valid user session.
- `PERMISSION_DENIED`: authenticated user lacks role or ownership.
- `NOT_FOUND`: requested course, caddie, booking, or payment does not exist.
- `VALIDATION_FAILED`: request shape or business input is invalid.
- `BOOKING_CONFLICT`: selected caddie, slot, or booking state cannot proceed.
- `PAYMENT_FAILED`: payment provider rejected or failed the payment.
- `RATE_LIMITED`: client must retry later.
- `UNKNOWN`: unexpected server failure with a request id for support.
