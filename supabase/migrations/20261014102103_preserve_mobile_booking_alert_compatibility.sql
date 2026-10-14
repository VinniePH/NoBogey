-- Keep the public notification kind compatible with already-installed mobile
-- builds while the private event stream continues to use booking.requested.
create or replace function private.process_booking_events(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  item record;
  recipient uuid;
  processed integer := 0;
begin
  for item in
    select e.id, e.booking_id, e.event_kind,
      b.golfer_id, b.caddie_id, b.status, b.expires_at
    from private.booking_events e
    join public.bookings b on b.id = e.booking_id
    where e.delivery_status in ('pending', 'failed')
      and e.available_at <= now()
      and e.attempts < 8
    order by e.available_at, e.created_at
    for update of e skip locked
    limit greatest(1, least(coalesce(p_limit, 100), 500))
  loop
    recipient := case
      when item.event_kind = 'booking.requested'
        and item.status = 'pending'
        and item.expires_at > now()
        then item.caddie_id
      when item.event_kind in ('booking.declined', 'booking.expired')
        then item.golfer_id
      when item.event_kind = 'booking.cancelled'
        then item.caddie_id
      else null
    end;

    if recipient is not null then
      insert into public.notifications(user_id, kind, title, body, data, source_event_id)
      values (
        recipient,
        case item.event_kind
          when 'booking.requested' then 'booking_assignment_requested'
          else item.event_kind
        end,
        case item.event_kind
          when 'booking.requested' then 'New booking request'
          when 'booking.declined' then 'Booking declined'
          when 'booking.expired' then 'Booking request expired'
          else 'Booking cancelled'
        end,
        case item.event_kind
          when 'booking.requested' then 'A golfer selected you for an upcoming round. Review the request before the reservation expires.'
          when 'booking.declined' then 'The requested caddie declined this booking.'
          when 'booking.expired' then 'The caddie did not accept before the reservation expired.'
          else 'The booking was cancelled.'
        end,
        jsonb_build_object('booking_id', item.booking_id),
        item.id
      )
      on conflict do nothing;
    end if;

    update private.booking_events
    set delivery_status = 'delivered',
      attempts = attempts + 1,
      delivered_at = now(),
      last_error = null
    where id = item.id;
    processed := processed + 1;
  end loop;

  return processed;
end;
$$;

revoke all on function private.process_booking_events(integer) from public, anon, authenticated;
