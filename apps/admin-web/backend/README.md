# Admin-web backend adapter

This directory owns the admin-domain adapter for caddie fleet, tee times,
assignments, and compliance. Caddie and compliance changes use authorization-
checked Supabase RPCs. Dated tee-time changes now use `publish_tee_time` and
`update_published_tee_time`; generic portal preferences remain in the
`admin_portal_state` compatibility document while the UI is migrated.

The React subscription adapter remains under `src/lib/fleet.ts`. Reservation
correctness never depends on that compatibility state: bookings, allocations,
published tee times, and caddie slot declarations are authoritative Postgres
records.

`caddie-verification.ts` is deliberately separate from the fleet adapter. Its
review functions read Supabase verification records and invoke the
authorization-checked review RPC. Documents remain private opaque storage
references; any preview/download endpoint must return short-lived signed URLs.
