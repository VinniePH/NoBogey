-- Keep the legacy free-form booking RPC compatible with the reservation hold
-- invariant introduced by the canonical tee-time workflow.
create or replace function public.create_booking(
  p_caddie_id uuid,
  p_course_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_party_size smallint,
  p_idempotency_key text
) returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  quoted bigint;
  hold_minutes_value integer;
  result public.bookings;
begin
  if caller is null or not private.has_role('golfer', caller) then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_ends_at <= p_starts_at or p_starts_at <= now() or p_party_size not between 1 and 8 then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.caddie_availability a
    join public.courses c on c.club_id = a.club_id
    join public.caddie_club_assignments ca
      on ca.caddie_id = a.caddie_id and ca.club_id = a.club_id
    join public.caddie_profiles cp on cp.user_id = a.caddie_id
    where a.caddie_id = p_caddie_id
      and c.id = p_course_id
      and a.is_available
      and ca.verification_status = 'verified'
      and cp.verification_status = 'verified'
      and tstzrange(a.starts_at, a.ends_at, '[)') @> tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
  end if;

  select cp.rate_amount_in_centavos
  into quoted
  from public.caddie_profiles cp
  where cp.user_id = p_caddie_id;

  select coalesce(bp.hold_minutes, 15)
  into hold_minutes_value
  from public.booking_policy bp
  where bp.singleton;
  hold_minutes_value := coalesce(hold_minutes_value, 15);

  begin
    insert into public.bookings(
      golfer_id,
      caddie_id,
      course_id,
      starts_at,
      ends_at,
      party_size,
      quoted_amount_in_centavos,
      idempotency_key,
      expires_at
    ) values (
      caller,
      p_caddie_id,
      p_course_id,
      p_starts_at,
      p_ends_at,
      p_party_size,
      quoted,
      p_idempotency_key,
      now() + make_interval(mins => hold_minutes_value)
    )
    returning * into result;
  exception when exclusion_violation then
    raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
  end;

  insert into public.booking_status_history(booking_id, to_status, changed_by)
  values (result.id, 'pending', caller);
  insert into public.payment_intents(booking_id, provider, amount_in_centavos)
  values (result.id, 'gcash', result.quoted_amount_in_centavos);
  return result;
end;
$$;

-- PL/pgSQL output-column variables share the function scope. Referencing the
-- primary-key constraint directly avoids an ambiguous `booking_id` identifier
-- in the idempotent insert.
create or replace function public.confirm_booking_acknowledgement(
  p_booking_id uuid,
  p_step text
)
returns table (
  booking_id uuid,
  step text,
  participant_id uuid,
  participant_role text,
  confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  target public.bookings;
  caller_role text;
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_step is null or p_step not in ('meetup', 'payment') then
    raise exception 'INVALID_ACKNOWLEDGEMENT_STEP' using errcode = '22023';
  end if;

  select * into target
  from public.bookings b
  where b.id = p_booking_id
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'P0002';
  end if;
  if caller = target.golfer_id then
    caller_role := 'golfer';
  elsif caller = target.caddie_id then
    caller_role := 'caddie';
  else
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if target.status <> 'confirmed' then
    raise exception 'BOOKING_NOT_CONFIRMED' using errcode = '22023';
  end if;
  if p_step = 'payment' and (
    select count(distinct a.participant_role)
    from public.booking_acknowledgements a
    where a.booking_id = p_booking_id and a.step = 'meetup'
  ) <> 2 then
    raise exception 'MUTUAL_MEETUP_REQUIRED' using errcode = '22023';
  end if;

  insert into public.booking_acknowledgements(
    booking_id,
    step,
    participant_id,
    participant_role
  ) values (
    p_booking_id,
    p_step,
    caller,
    caller_role
  )
  on conflict on constraint booking_acknowledgements_pkey do nothing;

  return query
  select a.booking_id, a.step, a.participant_id, a.participant_role, a.confirmed_at
  from public.booking_acknowledgements a
  where a.booking_id = p_booking_id
  order by a.confirmed_at, a.step, a.participant_role;
end;
$$;

-- Preserve the public business error raised by validation checks. The previous
-- catch-all treated every SQLSTATE 23P01 as a database exclusion race, including
-- the deliberate CADDIE_UNAVAILABLE and capacity errors raised above it.
create or replace function public.create_mobile_booking(
  p_tee_time_id uuid,
  p_caddie_id uuid,
  p_party_size smallint,
  p_idempotency_key text
) returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  slot public.tee_times;
  booking_rules public.booking_policy;
  quoted bigint;
  allocated bigint;
  capacity_units smallint;
  fingerprint text;
  owns_key boolean;
  existing private.api_idempotency;
  result public.bookings;
  failure_message text;
begin
  if caller is null or not private.has_role('golfer', caller) then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if char_length(coalesce(p_idempotency_key, '')) not between 8 and 200
     or p_party_size not between 1 and 8 then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;

  fingerprint := encode(extensions.digest(convert_to(jsonb_build_object(
    'tee_time_id', p_tee_time_id, 'caddie_id', p_caddie_id, 'party_size', p_party_size
  )::text, 'utf8'), 'sha256'), 'hex');

  insert into private.api_idempotency(actor_id, operation, idempotency_key, request_fingerprint)
  values (caller, 'create_mobile_booking', p_idempotency_key, fingerprint)
  on conflict do nothing returning true into owns_key;
  if not coalesce(owns_key, false) then
    select * into existing
    from private.api_idempotency
    where actor_id = caller
      and operation = 'create_mobile_booking'
      and idempotency_key = p_idempotency_key;
    if existing.request_fingerprint <> fingerprint then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;
    select * into result from public.bookings where id = existing.booking_id;
    if not found then
      raise exception 'IDEMPOTENCY_IN_PROGRESS' using errcode = '40001';
    end if;
    return result;
  end if;

  select * into booking_rules from public.booking_policy where singleton for share;
  select * into slot from public.tee_times where id = p_tee_time_id for update;
  if not found
     or slot.status <> 'open'
     or slot.starts_at <= now()
     or slot.booking_cutoff_at <= now()
     or p_party_size > slot.player_capacity then
    raise exception 'TEE_TIME_UNAVAILABLE' using errcode = '23P01';
  end if;

  -- All booking creators use slot, golfer, then caddie as their lock order.
  perform 1 from public.golfer_profiles where user_id = caller for update;
  perform 1 from public.caddie_profiles where user_id = p_caddie_id for update;
  if not found then
    raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01';
  end if;
  perform private.expire_stale_booking_holds(100, p_tee_time_id, p_caddie_id);
  if (
    select count(*)
    from public.bookings
    where golfer_id = caller and status = 'pending' and expires_at > now()
  ) >= booking_rules.max_pending_per_golfer then
    raise exception 'RESERVATION_LIMIT_REACHED' using errcode = '54000';
  end if;
  if not exists (
    select 1
    from public.caddie_tee_time_availability a
    join public.caddie_profiles cp
      on cp.user_id = a.caddie_id and cp.verification_status = 'verified'
    join public.profiles p on p.id = a.caddie_id and p.is_active
    join public.tee_times t on t.id = a.tee_time_id
    join public.courses c on c.id = t.course_id
    join public.caddie_club_assignments ca
      on ca.caddie_id = a.caddie_id
     and ca.club_id = c.club_id
     and ca.verification_status = 'verified'
     and ca.is_active
    where a.tee_time_id = slot.id and a.caddie_id = p_caddie_id
  ) then
    raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01';
  end if;
  if exists (
    select 1
    from public.bookings b
    where b.caddie_id = p_caddie_id
      and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()))
      and tstzrange(
        b.starts_at - make_interval(mins => booking_rules.service_buffer_minutes),
        b.ends_at + make_interval(mins => booking_rules.service_buffer_minutes),
        '[)'
      ) && tstzrange(slot.starts_at, slot.ends_at, '[)')
  ) then
    raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01';
  end if;

  capacity_units := case when booking_rules.capacity_unit = 'bookings' then 1 else p_party_size end;
  select coalesce(sum(
    case when booking_rules.capacity_unit = 'bookings' then 1 else a.capacity_units end
  ), 0)
  into allocated
  from private.booking_allocations a
  join public.bookings b on b.id = a.booking_id
  where a.tee_time_id = slot.id
    and a.released_at is null
    and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()));
  if booking_rules.reserve_tee_time_inventory
     and allocated + capacity_units > slot.player_capacity then
    raise exception 'TEE_TIME_CAPACITY_EXCEEDED' using errcode = '23P01';
  end if;

  select cp.rate_amount_in_centavos
  into quoted
  from public.caddie_profiles cp
  where cp.user_id = p_caddie_id;
  insert into public.bookings(
    golfer_id,
    caddie_id,
    course_id,
    tee_time_id,
    starts_at,
    ends_at,
    party_size,
    quoted_amount_in_centavos,
    idempotency_key,
    expires_at,
    request_fingerprint
  ) values (
    caller,
    p_caddie_id,
    slot.course_id,
    slot.id,
    slot.starts_at,
    slot.ends_at,
    p_party_size,
    quoted,
    p_idempotency_key,
    now() + make_interval(mins => booking_rules.hold_minutes),
    fingerprint
  ) returning * into result;
  insert into private.booking_allocations(booking_id, tee_time_id, capacity_units, expires_at)
  values (result.id, slot.id, capacity_units, result.expires_at);
  insert into public.booking_status_history(booking_id, to_status, changed_by, reason)
  values (result.id, 'pending', caller, 'temporary reservation created');
  perform private.emit_booking_event(result.id, 'booking.requested', 'requested', jsonb_build_object(
    'booking_id', result.id,
    'tee_time_id', slot.id,
    'golfer_id', caller,
    'caddie_id', p_caddie_id
  ));
  update private.api_idempotency
  set booking_id = result.id
  where actor_id = caller
    and operation = 'create_mobile_booking'
    and idempotency_key = p_idempotency_key;
  return result;
exception
  when exclusion_violation then
    get stacked diagnostics failure_message = message_text;
    if failure_message in (
      'TEE_TIME_UNAVAILABLE',
      'CADDIE_UNAVAILABLE',
      'TEE_TIME_CAPACITY_EXCEEDED'
    ) then
      raise;
    end if;
    raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
  when unique_violation then
    raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
end;
$$;

-- Make the enum assignment explicit so the function is accepted by plpgsql_check
-- and cannot depend on an implicit text-to-enum assignment cast.
create or replace function public.respond_to_booking(p_booking_id uuid, p_accept boolean)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  expected_caddie uuid;
  current_booking public.bookings;
  next_status public.booking_status;
begin
  -- Booking creation locks caddie before booking rows. Take the same order here
  -- so an acceptance cannot deadlock with stale-hold cleanup for this caddie.
  select caddie_id into expected_caddie
  from public.bookings
  where id = p_booking_id;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;
  if caller is null or expected_caddie <> caller then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  perform 1 from public.caddie_profiles where user_id = caller for update;
  select * into current_booking
  from public.bookings
  where id = p_booking_id
  for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;
  if current_booking.caddie_id <> caller then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if current_booking.status <> 'pending' then
    raise exception 'INVALID_BOOKING_STATUS' using errcode = '22023';
  end if;
  if current_booking.expires_at <= now() then
    update public.bookings
    set status = 'expired'
    where id = p_booking_id
    returning * into current_booking;
    perform private.release_booking_allocation(p_booking_id, 'hold_expired');
    insert into public.booking_status_history(
      booking_id,
      from_status,
      to_status,
      changed_by,
      reason
    ) values (
      p_booking_id,
      'pending',
      'expired',
      caller,
      'acceptance arrived after expiration'
    );
    perform private.emit_booking_event(
      p_booking_id,
      'booking.expired',
      'expired',
      jsonb_build_object('booking_id', p_booking_id)
    );
    return current_booking;
  end if;
  if p_accept then
    perform 1
    from public.caddie_profiles cp
    join public.profiles p on p.id = cp.user_id
    where cp.user_id = caller
      and cp.verification_status = 'verified'
      and p.is_active
      and exists (
        select 1
        from public.caddie_tee_time_availability a
        where a.tee_time_id = current_booking.tee_time_id
          and a.caddie_id = caller
      )
      and exists (
        select 1
        from public.caddie_club_assignments ca
        join public.courses c on c.club_id = ca.club_id
        where c.id = current_booking.course_id
          and ca.caddie_id = caller
          and ca.verification_status = 'verified'
          and ca.is_active
      )
    for share of p;
    if not found then
      raise exception 'CADDIE_NO_LONGER_ELIGIBLE' using errcode = '23P01';
    end if;
  end if;
  next_status := case
    when p_accept then 'confirmed'::public.booking_status
    else 'declined'::public.booking_status
  end;
  update public.bookings
  set status = next_status,
      confirmed_at = case when p_accept then now() else confirmed_at end
  where id = p_booking_id
  returning * into current_booking;
  if not p_accept then
    perform private.release_booking_allocation(p_booking_id, 'caddie_declined');
  end if;
  insert into public.booking_status_history(
    booking_id,
    from_status,
    to_status,
    changed_by
  ) values (
    p_booking_id,
    'pending',
    next_status,
    caller
  );
  perform private.emit_booking_event(
    p_booking_id,
    case when p_accept then 'booking.confirmed' else 'booking.declined' end,
    next_status::text,
    jsonb_build_object('booking_id', p_booking_id)
  );
  return current_booking;
end;
$$;

revoke all on function public.create_booking(uuid, uuid, timestamptz, timestamptz, smallint, text)
  from public, anon;
grant execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, smallint, text)
  to authenticated;
revoke all on function public.create_mobile_booking(uuid, uuid, smallint, text)
  from public, anon;
grant execute on function public.create_mobile_booking(uuid, uuid, smallint, text)
  to authenticated;
revoke all on function public.respond_to_booking(uuid, boolean)
  from public, anon;
grant execute on function public.respond_to_booking(uuid, boolean)
  to authenticated;
revoke all on function public.confirm_booking_acknowledgement(uuid, text)
  from public, anon;
grant execute on function public.confirm_booking_acknowledgement(uuid, text)
  to authenticated;
