-- Connect club-published tee times to the mobile booking marketplace and make
-- booking alerts transactionally visible to the intended mobile user.

create or replace function private.seed_published_tee_time_caddies(p_tee_time_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.caddie_tee_time_availability(tee_time_id, caddie_id)
  select t.id, assignment.caddie_id
  from public.tee_times t
  join public.courses course on course.id = t.course_id and course.is_active
  join public.caddie_club_assignments assignment
    on assignment.club_id = course.club_id
   and assignment.verification_status = 'verified'
   and assignment.is_active
  join public.caddie_profiles caddie
    on caddie.user_id = assignment.caddie_id
   and caddie.verification_status = 'verified'
  join public.profiles profile
    on profile.id = assignment.caddie_id
   and profile.is_active
  where t.id = p_tee_time_id
    and t.status = 'open'
    and t.starts_at > now()
    and t.booking_cutoff_at > now()
  on conflict (tee_time_id, caddie_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function private.seed_published_tee_time_caddies_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.seed_published_tee_time_caddies(new.id);
  return new;
end;
$$;

drop trigger if exists tee_times_seed_caddies_after_publish on public.tee_times;
create trigger tee_times_seed_caddies_after_publish
after insert on public.tee_times
for each row
execute function private.seed_published_tee_time_caddies_after_insert();

-- Repair future slots published before this trigger existed, including the
-- currently scheduled October 15-17 Manila slots.
do $$
declare
  slot record;
begin
  for slot in
    select id
    from public.tee_times
    where status = 'open'
      and starts_at > now()
      and booking_cutoff_at > now()
  loop
    perform private.seed_published_tee_time_caddies(slot.id);
  end loop;
end;
$$;

-- Booking events are the canonical source for request/decline/expiry alerts.
-- A requested alert is only delivered while the reservation hold is live, so
-- stale events can never wake a caddie for an expired booking.
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
        item.event_kind,
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

-- Deliver the in-app alert in the same transaction that records the booking
-- transition. The outbox remains available for email retries and maintenance.
create or replace function private.emit_booking_event(
  p_booking_id uuid,
  p_event_kind text,
  p_transition_id text,
  p_payload jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.booking_events(booking_id, event_kind, deduplication_key, payload)
  values (p_booking_id, p_event_kind, p_booking_id::text || ':' || p_transition_id, p_payload)
  on conflict (deduplication_key) do nothing;

  perform private.process_booking_events(100);
end;
$$;

-- Realtime is advisory; clients also refresh whenever the app becomes active.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'notifications'
     ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

revoke all on function private.seed_published_tee_time_caddies(uuid) from public, anon, authenticated;
revoke all on function private.seed_published_tee_time_caddies_after_insert() from public, anon, authenticated;
revoke all on function private.process_booking_events(integer) from public, anon, authenticated;
revoke all on function private.emit_booking_event(uuid, text, text, jsonb) from public, anon, authenticated;

-- Expire old holds before dispatching any events left by the earlier
-- asynchronous-only path, then deliver the remaining valid alerts.
select private.expire_stale_booking_holds(500, null, null);
select private.process_booking_events(500);
