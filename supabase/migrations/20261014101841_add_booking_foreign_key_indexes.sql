-- Cover booking-workflow foreign keys used by allocation, event, and
-- idempotency lookups. These tables are small today, but the indexes prevent
-- booking latency and lock duration from growing with the table size.
create index if not exists bookings_tee_time_id_idx
  on public.bookings(tee_time_id);

create index if not exists booking_events_booking_id_idx
  on private.booking_events(booking_id);

create index if not exists api_idempotency_booking_id_idx
  on private.api_idempotency(booking_id)
  where booking_id is not null;
