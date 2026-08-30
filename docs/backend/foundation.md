# Backend foundation

NoBogey uses Supabase Postgres and Supabase Auth as its backend source of truth. The initial migration is `supabase/migrations/20260815201536_backend_foundation.sql`.

## Implemented boundaries

- Auth identities are mirrored into `profiles`; authorization uses database-owned `user_roles`, never user metadata.
- Club access is resolved from active `club_staff` rows. Club managers can only reach records for clubs they manage.
- Availability and active bookings use GiST exclusion constraints over half-open UTC ranges, so overlapping availability and double booking fail at the database layer even under concurrent requests.
- `create_booking` derives the golfer from `auth.uid()`, reads the verified caddie's server-side rate, creates a `pending` booking, status history, and a server-owned payment intent in one transaction.
- Only the service role may process a pre-authenticated payment callback. Provider event IDs are unique, callback payloads are represented only by a SHA-256 digest, and successful callbacks atomically confirm bookings and append ledger entries.
- Payouts begin as `held`. Only the server completion transition makes them `eligible` and appends the caddie-payable ledger entry.
- Financial ledger and audit records are append-only. The Android client has no table privileges on private financial or audit schemas.
- Ratings require a completed booking, an eligible participant pair, and one rating per participant per booking.
- Verification files use a private Storage bucket with owner/managed-club policies. Clients must request short-lived signed download URLs from a privileged server boundary; object URLs must not be made public.

## External boundaries still required

The payment provider webhook must run in a server-only Edge Function. It must verify the provider signature and timestamp, apply replay-window and rate-limit checks, hash the raw body, and only then invoke `private.process_verified_payment_event` with service-role credentials. FCM delivery likewise belongs in a server-only function that reads pending notifications without logging device tokens or message bodies.

## Local validation

```bash
node_modules/.bin/supabase start
node_modules/.bin/supabase db reset
node_modules/.bin/supabase test db
node_modules/.bin/supabase db lint --local --level warning
```

Do not deploy this migration until local tests pass and the generated diff, grants, policies, and Security Advisor findings have been reviewed.
