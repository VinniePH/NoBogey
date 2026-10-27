-- Cover the booking foreign key used by notification lookups and deletes.

create index admin_notifications_booking_id_idx
  on public.admin_notifications(booking_id)
  where booking_id is not null;
