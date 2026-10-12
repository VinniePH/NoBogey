-- NoBogey booking workflow reliability layer.
-- This migration is intentionally additive and preserves the legacy APIs while the
-- mobile and administrator clients move to the canonical slot-based RPCs below.

create extension if not exists pgcrypto with schema extensions;

create table public.booking_policy (
  singleton boolean primary key default true check (singleton),
  capacity_unit text not null default 'golfers' check (capacity_unit in ('golfers', 'bookings')),
  reserve_tee_time_inventory boolean not null default false,
  hold_minutes smallint not null default 15 check (hold_minutes between 2 and 60),
  service_buffer_minutes smallint not null default 30 check (service_buffer_minutes between 0 and 180),
  max_pending_per_golfer smallint not null default 3 check (max_pending_per_golfer between 1 and 20),
  updated_at timestamptz not null default now()
);
comment on table public.booking_policy is
  'Explicit unresolved business rules. Default scope reserves caddie service only; enable reserve_tee_time_inventory only after clubs authorize NoBogey to allocate tee-sheet capacity.';
insert into public.booking_policy(singleton) values (true) on conflict do nothing;
alter table public.booking_policy enable row level security;
revoke all on public.booking_policy from public, anon, authenticated;

alter table public.tee_times
  add column if not exists booking_cutoff_at timestamptz,
  add column if not exists published_at timestamptz;
update public.tee_times
set booking_cutoff_at = coalesce(booking_cutoff_at, starts_at - interval '2 hours'),
    published_at = coalesce(published_at, created_at);
alter table public.tee_times
  alter column booking_cutoff_at set not null,
  alter column published_at set not null,
  alter column published_at set default now();
alter table public.tee_times
  add constraint tee_times_cutoff_before_start check (booking_cutoff_at < starts_at) not valid;
alter table public.tee_times validate constraint tee_times_cutoff_before_start;

alter table public.bookings
  add column if not exists expires_at timestamptz,
  add column if not exists allocation_released_at timestamptz,
  add column if not exists request_fingerprint text;
update public.bookings
set expires_at = coalesce(expires_at, created_at + interval '15 minutes')
where status = 'pending';
alter table public.bookings
  add constraint bookings_pending_expiration check (status <> 'pending' or expires_at is not null) not valid;
alter table public.bookings validate constraint bookings_pending_expiration;
alter table public.bookings
  add constraint bookings_request_fingerprint_format check (request_fingerprint is null or request_fingerprint ~ '^[a-f0-9]{64}$') not valid;
alter table public.bookings validate constraint bookings_request_fingerprint_format;

-- Caddie operational state and compliance belong to a club assignment, not to
-- the user's global identity. Legacy compliance rows remain nullable because a
-- historic caddie may no longer have an assignment to infer safely.
alter table public.caddie_club_assignments
  add column if not exists is_active boolean not null default true;
alter table public.caddie_compliance_events
  add column if not exists club_id uuid references public.golf_clubs(id) on delete restrict;
alter table public.caddie_verification_reviews
  add column if not exists club_id uuid references public.golf_clubs(id) on delete restrict;
update public.caddie_compliance_events ce
set club_id = (
  select ca.club_id from public.caddie_club_assignments ca
  where ca.caddie_id = ce.caddie_id
  order by ca.is_primary desc, ca.created_at
  limit 1
)
where ce.club_id is null;
update public.caddie_verification_reviews review
set club_id = (
  select ca.club_id from public.caddie_club_assignments ca
  where ca.caddie_id = review.caddie_id
  order by ca.is_primary desc, ca.created_at
  limit 1
)
where review.club_id is null;
create index if not exists caddie_compliance_club_open_idx
  on public.caddie_compliance_events(club_id, caddie_id, created_at desc)
  where resolved_at is null;
create index if not exists caddie_verification_reviews_club_idx
  on public.caddie_verification_reviews(club_id, caddie_id, created_at desc);

drop index if exists public.bookings_active_tee_time_idx;
create unique index if not exists bookings_golfer_active_tee_time_idx
  on public.bookings(golfer_id, tee_time_id)
  where tee_time_id is not null and status in ('pending', 'confirmed', 'in_progress');
create index if not exists bookings_expiration_idx
  on public.bookings(expires_at, id)
  where status = 'pending';

create table public.caddie_tee_time_availability (
  tee_time_id uuid not null references public.tee_times(id) on delete cascade,
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  declared_at timestamptz not null default now(),
  primary key (tee_time_id, caddie_id)
);
create index caddie_tee_time_availability_caddie_idx
  on public.caddie_tee_time_availability(caddie_id, tee_time_id);
alter table public.caddie_tee_time_availability enable row level security;
grant select on public.caddie_tee_time_availability to authenticated;
create policy caddie_slot_availability_read on public.caddie_tee_time_availability
  for select to authenticated using (
    caddie_id = (select auth.uid()) or exists (
      select 1 from public.tee_times t join public.courses c on c.id = t.course_id
      where t.id = tee_time_id and private.manages_club(c.club_id, (select auth.uid()))
    ) or private.has_role('golfer', (select auth.uid()))
  );

-- Realtime is advisory only. Reconnecting clients refresh authoritative state.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tee_times') then
      alter publication supabase_realtime add table public.tee_times;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings') then
      alter publication supabase_realtime add table public.bookings;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'caddie_tee_time_availability') then
      alter publication supabase_realtime add table public.caddie_tee_time_availability;
    end if;
  end if;
end;
$$;

-- Preserve existing availability by linking each range to published slots it covers.
insert into public.caddie_tee_time_availability(tee_time_id, caddie_id)
select t.id, a.caddie_id
from public.tee_times t
join public.courses c on c.id = t.course_id
join public.caddie_availability a on a.club_id = c.club_id and a.is_available
  and tstzrange(a.starts_at, a.ends_at, '[)') @> tstzrange(t.starts_at, t.ends_at, '[)')
join public.caddie_profiles cp on cp.user_id = a.caddie_id and cp.verification_status = 'verified'
where t.starts_at > now() and t.status = 'open'
on conflict do nothing;

-- An active legacy booking is stronger evidence than the old broad range table.
-- Preserve it even when the range was edited after the booking was created so a
-- caddie can still accept, decline, or complete the existing assignment.
insert into public.caddie_tee_time_availability(tee_time_id, caddie_id)
select b.tee_time_id, b.caddie_id
from public.bookings b
where b.tee_time_id is not null
  and b.caddie_id is not null
  and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()))
on conflict do nothing;

create table private.booking_allocations (
  booking_id uuid primary key references public.bookings(id) on delete restrict,
  tee_time_id uuid not null references public.tee_times(id) on delete restrict,
  capacity_units smallint not null check (capacity_units between 1 and 8),
  expires_at timestamptz,
  released_at timestamptz,
  release_reason text,
  created_at timestamptz not null default now(),
  check (released_at is null or release_reason is not null)
);
create index booking_allocations_capacity_idx
  on private.booking_allocations(tee_time_id, expires_at)
  where released_at is null;
alter table private.booking_allocations enable row level security;
revoke all on private.booking_allocations from public, anon, authenticated;

insert into private.booking_allocations(booking_id, tee_time_id, capacity_units, expires_at, released_at, release_reason)
select b.id, b.tee_time_id, b.party_size, b.expires_at,
  case when b.status in ('pending','confirmed','in_progress') then null else coalesce(b.allocation_released_at, b.updated_at) end,
  case when b.status in ('pending','confirmed','in_progress') then null else 'legacy_terminal_booking' end
from public.bookings b
where b.tee_time_id is not null
on conflict (booking_id) do nothing;

create table private.api_idempotency (
  actor_id uuid not null references public.profiles(id) on delete cascade,
  operation text not null check (operation ~ '^[a-z0-9_]{3,80}$'),
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 200),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$'),
  booking_id uuid references public.bookings(id) on delete restrict,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  primary key (actor_id, operation, idempotency_key)
);
create index api_idempotency_expiration_idx on private.api_idempotency(expires_at);
alter table private.api_idempotency enable row level security;
revoke all on private.api_idempotency from public, anon, authenticated;

create table private.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  event_kind text not null,
  deduplication_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'processing', 'delivered', 'failed', 'dead_letter')),
  attempts smallint not null default 0 check (attempts between 0 and 20),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index booking_events_dispatch_idx
  on private.booking_events(available_at, created_at)
  where delivery_status in ('pending', 'failed');
alter table private.booking_events enable row level security;
revoke all on private.booking_events from public, anon, authenticated;

alter table public.notifications
  add column if not exists source_event_id uuid references private.booking_events(id) on delete restrict;
create unique index if not exists notifications_source_event_uidx
  on public.notifications(source_event_id) where source_event_id is not null;

alter table private.notification_outbox
  add column if not exists available_at timestamptz not null default now(),
  add column if not exists locked_at timestamptz,
  add column if not exists provider_message_id text,
  add column if not exists dead_lettered_at timestamptz;
drop index if exists private.notification_outbox_pending_idx;
create index notification_outbox_dispatch_idx
  on private.notification_outbox(available_at, created_at)
  where delivery_status in ('pending', 'failed', 'sending');

create or replace function private.emit_booking_event(
  p_booking_id uuid,
  p_event_kind text,
  p_transition_id text,
  p_payload jsonb default '{}'::jsonb
) returns void
language sql security definer set search_path = '' as $$
  insert into private.booking_events(booking_id, event_kind, deduplication_key, payload)
  values (p_booking_id, p_event_kind, p_booking_id::text || ':' || p_transition_id, p_payload)
  on conflict (deduplication_key) do nothing;
$$;

create or replace function private.release_booking_allocation(
  p_booking_id uuid,
  p_reason text
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare affected integer;
begin
  update private.booking_allocations
  set released_at = now(), release_reason = left(coalesce(p_reason, 'released'), 120)
  where booking_id = p_booking_id and released_at is null;
  get diagnostics affected = row_count;
  if affected = 1 then
    update public.bookings set allocation_released_at = now() where id = p_booking_id;
  end if;
  return affected = 1;
end;
$$;

create or replace function private.expire_stale_booking_holds(
  p_limit integer default 100,
  p_tee_time_id uuid default null,
  p_caddie_id uuid default null
) returns integer
language plpgsql security definer set search_path = '' as $$
declare item record; expired_count integer := 0;
begin
  for item in
    select b.id, b.golfer_id, b.caddie_id, b.tee_time_id
    from public.bookings b
    where b.status = 'pending' and b.expires_at <= now()
      and (p_tee_time_id is null or b.tee_time_id = p_tee_time_id)
      and (p_caddie_id is null or b.caddie_id = p_caddie_id)
    order by b.expires_at, b.id
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 100), 500))
  loop
    update public.bookings set status = 'expired' where id = item.id and status = 'pending';
    if found then
      perform private.release_booking_allocation(item.id, 'hold_expired');
      insert into public.booking_status_history(booking_id, from_status, to_status, reason)
      values (item.id, 'pending', 'expired', 'reservation hold expired');
      perform private.emit_booking_event(item.id, 'booking.expired', 'expired',
        jsonb_build_object('booking_id', item.id, 'golfer_id', item.golfer_id, 'caddie_id', item.caddie_id));
      expired_count := expired_count + 1;
    end if;
  end loop;
  return expired_count;
end;
$$;

drop function if exists public.list_bookable_tee_times(uuid,date);
create or replace function private.process_booking_events(p_limit integer default 100)
returns integer
language plpgsql security definer set search_path = '' as $$
declare item record; recipient uuid; processed integer := 0;
begin
  for item in
    select e.id, e.booking_id, e.event_kind, b.golfer_id, b.caddie_id
    from private.booking_events e join public.bookings b on b.id = e.booking_id
    where e.delivery_status in ('pending','failed') and e.available_at <= now() and e.attempts < 8
    order by e.available_at, e.created_at
    for update of e skip locked
    limit greatest(1, least(coalesce(p_limit, 100), 500))
  loop
    recipient := case
      when item.event_kind = 'booking.requested' then item.caddie_id
      when item.event_kind in ('booking.declined','booking.expired') then item.golfer_id
      when item.event_kind = 'booking.cancelled' then item.caddie_id
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
          when 'booking.requested' then 'Review this booking request before its reservation expires.'
          when 'booking.declined' then 'The requested caddie declined this booking.'
          when 'booking.expired' then 'The caddie did not accept before the reservation expired.'
          else 'The booking was cancelled.'
        end,
        jsonb_build_object('booking_id', item.booking_id),
        item.id
      ) on conflict do nothing;
    end if;
    update private.booking_events set delivery_status = 'delivered', attempts = attempts + 1,
      delivered_at = now(), last_error = null where id = item.id;
    processed := processed + 1;
  end loop;
  return processed;
end;
$$;

create or replace function public.list_bookable_tee_times(
  p_course_id uuid,
  p_day date,
  p_page_size integer default 50,
  p_after timestamptz default null
) returns table(
  id uuid, course_id uuid, starts_at timestamptz, ends_at timestamptz,
  player_capacity smallint, remaining_player_capacity bigint,
  remaining_caddie_capacity bigint, status text, booking_cutoff_at timestamptz,
  updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  with policy as (
    select capacity_unit, reserve_tee_time_inventory from public.booking_policy where singleton
  ), allocated as (
    select a.tee_time_id, sum(case when p.capacity_unit = 'bookings' then 1 else a.capacity_units end)::bigint as units
    from private.booking_allocations a
    join public.bookings b on b.id = a.booking_id
    cross join policy p
    where a.released_at is null
      and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()))
    group by a.tee_time_id
  ), caddie_capacity as (
    select a.tee_time_id, count(*)::bigint as available_count
    from public.caddie_tee_time_availability a
    join public.caddie_profiles cp on cp.user_id = a.caddie_id and cp.verification_status = 'verified'
    join public.profiles p on p.id = a.caddie_id and p.is_active
    join public.tee_times t on t.id = a.tee_time_id
    join public.courses c on c.id = t.course_id
    join public.caddie_club_assignments ca on ca.caddie_id = a.caddie_id and ca.club_id = c.club_id and ca.verification_status = 'verified' and ca.is_active
    cross join public.booking_policy rules
    where not exists (
      select 1 from public.bookings b
      where b.caddie_id = a.caddie_id
        and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()))
        and tstzrange(b.starts_at - make_interval(mins => rules.service_buffer_minutes), b.ends_at + make_interval(mins => rules.service_buffer_minutes), '[)')
            && tstzrange(t.starts_at, t.ends_at, '[)')
    )
      and rules.singleton
    group by a.tee_time_id
  )
  select t.id, t.course_id, t.starts_at, t.ends_at, t.player_capacity,
    case when p.reserve_tee_time_inventory then greatest(t.player_capacity::bigint - coalesce(a.units, 0), 0) else t.player_capacity::bigint end,
    coalesce(cc.available_count, 0), t.status, t.booking_cutoff_at, t.updated_at
  from public.tee_times t
  cross join policy p
  left join allocated a on a.tee_time_id = t.id
  left join caddie_capacity cc on cc.tee_time_id = t.id
  join public.courses c on c.id = t.course_id and c.is_active
  join public.golf_clubs gc on gc.id = c.club_id and gc.is_active
  where t.course_id = p_course_id and t.status = 'open'
    and (t.starts_at at time zone gc.timezone)::date = p_day
    and t.starts_at > now() and t.booking_cutoff_at > now()
    and (p_after is null or t.starts_at > p_after)
    and cc.available_count > 0
    and (not p.reserve_tee_time_inventory or coalesce(a.units, 0) < t.player_capacity)
  order by t.starts_at, t.id
  limit greatest(1, least(coalesce(p_page_size, 50), 100));
$$;

create or replace function public.list_available_caddies_for_tee_time(
  p_tee_time_id uuid,
  p_page_size integer default 50
) returns table(caddie_id uuid, display_name text, verification_status public.verification_status, specialties text[])
language sql stable security definer set search_path = '' as $$
  select a.caddie_id, p.display_name, cp.verification_status,
    coalesce(array_agg(distinct ps.name) filter (where ps.name is not null), '{}'::text[]) as specialties
  from public.caddie_tee_time_availability a
  join public.tee_times t on t.id = a.tee_time_id and t.status = 'open' and t.booking_cutoff_at > now()
  join public.courses c on c.id = t.course_id and c.is_active
  join public.golf_clubs gc on gc.id = c.club_id and gc.is_active
  join public.caddie_profiles cp on cp.user_id = a.caddie_id and cp.verification_status = 'verified'
  join public.profiles p on p.id = a.caddie_id and p.is_active
  join public.caddie_club_assignments ca on ca.caddie_id = a.caddie_id and ca.club_id = c.club_id and ca.verification_status = 'verified' and ca.is_active
  cross join public.booking_policy rules
  left join public.caddie_playstyles cps on cps.caddie_id = a.caddie_id
  left join public.playstyles ps on ps.id = cps.playstyle_id and ps.is_active
  where a.tee_time_id = p_tee_time_id and rules.singleton
    and not exists (
      select 1 from public.bookings b where b.caddie_id = a.caddie_id
        and (b.status in ('confirmed','in_progress') or (b.status = 'pending' and b.expires_at > now()))
        and tstzrange(b.starts_at - make_interval(mins => rules.service_buffer_minutes), b.ends_at + make_interval(mins => rules.service_buffer_minutes), '[)')
            && tstzrange(t.starts_at, t.ends_at, '[)')
    )
  group by a.caddie_id, p.display_name, cp.verification_status
  order by p.display_name, a.caddie_id
  limit greatest(1, least(coalesce(p_page_size, 50), 100));
$$;

create or replace function public.create_mobile_booking(
  p_tee_time_id uuid,
  p_caddie_id uuid,
  p_party_size smallint,
  p_idempotency_key text
) returns public.bookings
language plpgsql security definer set search_path = '' as $$
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
begin
  if caller is null or not private.has_role('golfer', caller) then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if char_length(coalesce(p_idempotency_key, '')) not between 8 and 200 or p_party_size not between 1 and 8 then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;

  fingerprint := encode(extensions.digest(convert_to(jsonb_build_object(
    'tee_time_id', p_tee_time_id, 'caddie_id', p_caddie_id, 'party_size', p_party_size
  )::text, 'utf8'), 'sha256'), 'hex');

  insert into private.api_idempotency(actor_id, operation, idempotency_key, request_fingerprint)
  values (caller, 'create_mobile_booking', p_idempotency_key, fingerprint)
  on conflict do nothing returning true into owns_key;
  if not coalesce(owns_key, false) then
    select * into existing from private.api_idempotency
    where actor_id = caller and operation = 'create_mobile_booking' and idempotency_key = p_idempotency_key;
    if existing.request_fingerprint <> fingerprint then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = '22023';
    end if;
    select * into result from public.bookings where id = existing.booking_id;
    if not found then raise exception 'IDEMPOTENCY_IN_PROGRESS' using errcode = '40001'; end if;
    return result;
  end if;

  select * into booking_rules from public.booking_policy where singleton for share;
  select * into slot from public.tee_times where id = p_tee_time_id for update;
  if not found or slot.status <> 'open' or slot.starts_at <= now() or slot.booking_cutoff_at <= now()
     or p_party_size > slot.player_capacity then
    raise exception 'TEE_TIME_UNAVAILABLE' using errcode = '23P01';
  end if;
  -- Serialize a golfer's pending-count check and every reservation attempt for a
  -- caddie, including attempts against different tee times whose configured service
  -- buffers overlap. The lock order is slot, golfer, then caddie.
  perform 1 from public.golfer_profiles where user_id = caller for update;
  perform 1 from public.caddie_profiles where user_id = p_caddie_id for update;
  if not found then raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01'; end if;
  -- Stale booking rows are locked only after the slot, golfer, and caddie locks.
  -- Every booking creator follows this order, preventing hot-slot deadlocks while
  -- making a delayed expiration worker harmless.
  perform private.expire_stale_booking_holds(100, p_tee_time_id, p_caddie_id);
  if (select count(*) from public.bookings where golfer_id = caller and status = 'pending' and expires_at > now()) >= booking_rules.max_pending_per_golfer then
    raise exception 'RESERVATION_LIMIT_REACHED' using errcode = '54000';
  end if;
  if not exists (
    select 1 from public.caddie_tee_time_availability a
    join public.caddie_profiles cp on cp.user_id = a.caddie_id and cp.verification_status = 'verified'
    join public.profiles p on p.id = a.caddie_id and p.is_active
    join public.tee_times t on t.id = a.tee_time_id
    join public.courses c on c.id = t.course_id
    join public.caddie_club_assignments ca on ca.caddie_id = a.caddie_id and ca.club_id = c.club_id and ca.verification_status = 'verified' and ca.is_active
    where a.tee_time_id = slot.id and a.caddie_id = p_caddie_id
  ) then raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01'; end if;
  if exists (
    select 1 from public.bookings b
    where b.caddie_id = p_caddie_id
      and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()))
      and tstzrange(b.starts_at - make_interval(mins => booking_rules.service_buffer_minutes), b.ends_at + make_interval(mins => booking_rules.service_buffer_minutes), '[)')
          && tstzrange(slot.starts_at, slot.ends_at, '[)')
  ) then raise exception 'CADDIE_UNAVAILABLE' using errcode = '23P01'; end if;

  capacity_units := case when booking_rules.capacity_unit = 'bookings' then 1 else p_party_size end;
  select coalesce(sum(case when booking_rules.capacity_unit = 'bookings' then 1 else a.capacity_units end), 0)
  into allocated
  from private.booking_allocations a join public.bookings b on b.id = a.booking_id
  where a.tee_time_id = slot.id and a.released_at is null
    and (b.status in ('confirmed', 'in_progress') or (b.status = 'pending' and b.expires_at > now()));
  if booking_rules.reserve_tee_time_inventory and allocated + capacity_units > slot.player_capacity then
    raise exception 'TEE_TIME_CAPACITY_EXCEEDED' using errcode = '23P01';
  end if;

  select rate_amount_in_centavos into quoted from public.caddie_profiles where user_id = p_caddie_id;
  insert into public.bookings(
    golfer_id, caddie_id, course_id, tee_time_id, starts_at, ends_at, party_size,
    quoted_amount_in_centavos, idempotency_key, expires_at, request_fingerprint
  ) values (
    caller, p_caddie_id, slot.course_id, slot.id, slot.starts_at, slot.ends_at, p_party_size,
    quoted, p_idempotency_key, now() + make_interval(mins => booking_rules.hold_minutes), fingerprint
  ) returning * into result;
  insert into private.booking_allocations(booking_id, tee_time_id, capacity_units, expires_at)
  values (result.id, slot.id, capacity_units, result.expires_at);
  insert into public.booking_status_history(booking_id, to_status, changed_by, reason)
  values (result.id, 'pending', caller, 'temporary reservation created');
  perform private.emit_booking_event(result.id, 'booking.requested', 'requested', jsonb_build_object(
    'booking_id', result.id, 'tee_time_id', slot.id, 'golfer_id', caller, 'caddie_id', p_caddie_id
  ));
  update private.api_idempotency set booking_id = result.id
  where actor_id = caller and operation = 'create_mobile_booking' and idempotency_key = p_idempotency_key;
  return result;
exception when unique_violation or exclusion_violation then
  raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
end;
$$;

create or replace function public.respond_to_booking(p_booking_id uuid, p_accept boolean)
returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); expected_caddie uuid; current_booking public.bookings; next_status public.booking_status;
begin
  -- Booking creation locks caddie before booking rows. Take the same order here
  -- so an acceptance cannot deadlock with stale-hold cleanup for this caddie.
  select caddie_id into expected_caddie from public.bookings where id = p_booking_id;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or expected_caddie <> caller then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  perform 1 from public.caddie_profiles where user_id = caller for update;
  select * into current_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if current_booking.caddie_id <> caller then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  if current_booking.status <> 'pending' then raise exception 'INVALID_BOOKING_STATUS' using errcode = '22023'; end if;
  if current_booking.expires_at <= now() then
    update public.bookings set status = 'expired' where id = p_booking_id returning * into current_booking;
    perform private.release_booking_allocation(p_booking_id, 'hold_expired');
    insert into public.booking_status_history(booking_id, from_status, to_status, changed_by, reason)
    values (p_booking_id, 'pending', 'expired', caller, 'acceptance arrived after expiration');
    perform private.emit_booking_event(p_booking_id, 'booking.expired', 'expired', jsonb_build_object('booking_id', p_booking_id));
    return current_booking;
  end if;
  if p_accept then
    perform 1
    from public.caddie_profiles cp join public.profiles p on p.id = cp.user_id
    where cp.user_id = caller and cp.verification_status = 'verified' and p.is_active
      and exists (
        select 1 from public.caddie_tee_time_availability a
        where a.tee_time_id = current_booking.tee_time_id and a.caddie_id = caller
      )
      and exists (
        select 1 from public.caddie_club_assignments ca
        join public.courses c on c.club_id = ca.club_id
        where c.id = current_booking.course_id and ca.caddie_id = caller
          and ca.verification_status = 'verified' and ca.is_active
      )
    for share of p;
    if not found then raise exception 'CADDIE_NO_LONGER_ELIGIBLE' using errcode = '23P01'; end if;
  end if;
  next_status := case when p_accept then 'confirmed' else 'declined' end;
  update public.bookings set status = next_status,
    confirmed_at = case when p_accept then now() else confirmed_at end
  where id = p_booking_id returning * into current_booking;
  if not p_accept then perform private.release_booking_allocation(p_booking_id, 'caddie_declined'); end if;
  insert into public.booking_status_history(booking_id, from_status, to_status, changed_by)
  values (p_booking_id, 'pending', next_status, caller);
  perform private.emit_booking_event(p_booking_id,
    case when p_accept then 'booking.confirmed' else 'booking.declined' end,
    next_status::text, jsonb_build_object('booking_id', p_booking_id));
  return current_booking;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); current_booking public.bookings; previous_status public.booking_status;
begin
  select * into current_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or (current_booking.golfer_id <> caller and not private.is_platform_admin(caller)) then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if current_booking.status = 'canceled' then return current_booking; end if;
  if current_booking.status not in ('pending', 'confirmed') then raise exception 'INVALID_BOOKING_STATUS' using errcode = '22023'; end if;
  previous_status := current_booking.status;
  update public.bookings set status = 'canceled', canceled_at = now()
  where id = p_booking_id returning * into current_booking;
  perform private.release_booking_allocation(p_booking_id, 'booking_cancelled');
  insert into public.booking_status_history(booking_id, from_status, to_status, changed_by)
  values (p_booking_id, previous_status, 'canceled', caller);
  perform private.emit_booking_event(p_booking_id, 'booking.cancelled', 'cancelled', jsonb_build_object('booking_id', p_booking_id));
  return current_booking;
end;
$$;

create or replace function public.transition_booking(
  p_booking_id uuid,
  p_target public.booking_status,
  p_reason text default null
) returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  current_booking public.bookings;
  previous_status public.booking_status;
  target_club uuid;
  manager boolean;
  permitted boolean := false;
begin
  select b, c.club_id into current_booking, target_club
  from public.bookings b join public.courses c on c.id = b.course_id
  where b.id = p_booking_id for update of b;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  manager := private.manages_club(target_club, caller);

  permitted := case
    when current_booking.status = 'confirmed' and p_target = 'in_progress'
      then caller = current_booking.caddie_id or manager
    when current_booking.status = 'in_progress' and p_target = 'completed'
      then caller = current_booking.caddie_id or manager
    when current_booking.status in ('confirmed','in_progress') and p_target = 'no_show'
      then manager
    else false
  end;
  if not permitted then raise exception 'INVALID_BOOKING_TRANSITION' using errcode = '22023'; end if;
  if manager and char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'ADMIN_REASON_REQUIRED' using errcode = '22023';
  end if;

  previous_status := current_booking.status;
  update public.bookings set status = p_target,
    completed_at = case when p_target = 'completed' then now() else completed_at end
  where id = p_booking_id returning * into current_booking;
  if p_target in ('completed','no_show') then
    perform private.release_booking_allocation(p_booking_id, p_target::text);
  end if;
  insert into public.booking_status_history(booking_id, from_status, to_status, changed_by, reason)
  values (p_booking_id, previous_status, p_target, caller, nullif(trim(coalesce(p_reason, '')), ''));
  perform private.emit_booking_event(p_booking_id, 'booking.' || p_target::text, p_target::text,
    jsonb_build_object('booking_id', p_booking_id));
  if manager then
    insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
    values (caller, 'booking.transition_override', 'bookings', p_booking_id::text,
      jsonb_build_object('to_status', p_target, 'reason', left(p_reason, 500)));
  end if;
  return current_booking;
end;
$$;

create or replace function public.set_caddie_tee_time_availability(p_tee_time_ids uuid[])
returns integer
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); requested_count integer; inserted_count integer;
begin
  if caller is null or not private.has_role('caddie', caller) then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  requested_count := coalesce(cardinality(p_tee_time_ids), 0);
  if requested_count > 100 then raise exception 'TOO_MANY_TEE_TIMES' using errcode = '54000'; end if;
  -- Lock affected slots in a deterministic order before the caddie row. Booking
  -- creation uses the same slot-then-caddie order, so removing availability cannot
  -- race a successful reservation.
  perform 1
  from public.tee_times t
  where t.id in (
    select id from unnest(coalesce(p_tee_time_ids, '{}'::uuid[])) requested(id)
    union
    select a.tee_time_id from public.caddie_tee_time_availability a
      join public.tee_times existing_slot on existing_slot.id = a.tee_time_id
      where a.caddie_id = caller and existing_slot.starts_at > now()
  )
  order by t.id
  for update;
  perform 1 from public.caddie_profiles where user_id = caller for update;
  if exists (
    select 1 from unnest(coalesce(p_tee_time_ids, '{}'::uuid[])) requested(id)
    left join public.tee_times t on t.id = requested.id
    left join public.courses c on c.id = t.course_id
    where t.id is null or t.status <> 'open' or t.starts_at <= now()
      or not exists (select 1 from public.caddie_club_assignments ca where ca.caddie_id = caller and ca.club_id = c.club_id and ca.verification_status = 'verified' and ca.is_active)
  ) then raise exception 'TEE_TIME_UNAVAILABLE' using errcode = '22023'; end if;
  delete from public.caddie_tee_time_availability a
  using public.tee_times t
  where a.tee_time_id = t.id and a.caddie_id = caller and t.starts_at > now()
    and not exists (
      select 1 from public.bookings b where b.caddie_id = caller and b.tee_time_id = a.tee_time_id
        and (b.status in ('confirmed','in_progress') or (b.status = 'pending' and b.expires_at > now()))
    );
  insert into public.caddie_tee_time_availability(tee_time_id, caddie_id)
  select distinct id, caller from unnest(coalesce(p_tee_time_ids, '{}'::uuid[])) id
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function public.admin_set_caddie_tee_time_availability(
  p_tee_time_id uuid,
  p_caddie_id uuid,
  p_available boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); slot public.tee_times; target_club uuid;
begin
  select t, c.club_id into slot, target_club
  from public.tee_times t join public.courses c on c.id = t.course_id
  where t.id = p_tee_time_id
  for update of t;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or not private.manages_club(target_club, caller) then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  perform 1 from public.caddie_profiles where user_id = p_caddie_id for update;
  if not found or slot.status <> 'open' or slot.starts_at <= now() or not exists (
    select 1 from public.caddie_club_assignments ca
    join public.caddie_profiles cp on cp.user_id = ca.caddie_id and cp.verification_status = 'verified'
    join public.profiles p on p.id = ca.caddie_id and p.is_active
    where ca.caddie_id = p_caddie_id and ca.club_id = target_club and ca.verification_status = 'verified' and ca.is_active
  ) then raise exception 'CADDIE_OR_TEE_TIME_UNAVAILABLE' using errcode = '23P01'; end if;

  if p_available then
    insert into public.caddie_tee_time_availability(tee_time_id, caddie_id)
    values (p_tee_time_id, p_caddie_id) on conflict do nothing;
  else
    if exists (
      select 1 from public.bookings b where b.tee_time_id = p_tee_time_id and b.caddie_id = p_caddie_id
        and (b.status in ('confirmed','in_progress') or (b.status = 'pending' and b.expires_at > now()))
    ) then raise exception 'ACTIVE_BOOKING_PREVENTS_AVAILABILITY_REMOVAL' using errcode = '23P01'; end if;
    delete from public.caddie_tee_time_availability
    where tee_time_id = p_tee_time_id and caddie_id = p_caddie_id;
  end if;

  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (caller, 'caddie.tee_time_availability_changed', 'caddie_tee_time_availability', p_tee_time_id::text,
    jsonb_build_object('caddie_id', p_caddie_id, 'available', p_available));
end;
$$;

create or replace function public.list_verified_caddie_names(
  p_ids uuid[] default null,
  p_page_size integer default 50
) returns table(id uuid, display_name text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name
  from public.profiles p
  join public.caddie_profiles cp on cp.user_id = p.id
  where p.is_active and cp.verification_status = 'verified'
    and exists (
      select 1 from public.caddie_club_assignments ca
      where ca.caddie_id = p.id and ca.verification_status = 'verified' and ca.is_active
    )
    and (p_ids is null or p.id = any(p_ids))
    and (p_ids is null or cardinality(p_ids) <= 100)
  order by p.display_name, p.id
  limit greatest(1, least(coalesce(p_page_size, 50), 100));
$$;

-- Club managers operate only on caddies assigned to their club. These replace
-- older platform-admin-only adapters while preserving their public signatures.
create or replace function public.admin_enroll_existing_caddie(
  p_email text,
  p_display_name text,
  p_tier text,
  p_rate_amount_in_centavos bigint,
  p_years_experience smallint,
  p_club_id uuid default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); target_user uuid; target_club uuid;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if nullif(trim(p_email), '') is null or char_length(trim(p_email)) > 254
     or nullif(trim(p_display_name), '') is null or char_length(trim(p_display_name)) > 120
     or p_tier is null or upper(trim(p_tier)) not in ('TRAINER','CLASS B','CLASS A')
     or p_rate_amount_in_centavos is null or p_rate_amount_in_centavos not between 0 and 100000000
     or p_years_experience is null or p_years_experience not between 0 and 80 then
    raise exception 'INVALID_CADDIE_DETAILS' using errcode = '22023';
  end if;

  if p_club_id is not null then
    target_club := p_club_id;
  else
    select cs.club_id into target_club from public.club_staff cs
    where cs.user_id = caller and cs.is_active order by cs.created_at limit 1;
    if target_club is null and private.is_platform_admin(caller) then
      select gc.id into target_club from public.golf_clubs gc where gc.is_active order by gc.created_at limit 1;
    end if;
  end if;
  if target_club is null or not exists (select 1 from public.golf_clubs gc where gc.id = target_club and gc.is_active)
     or not private.manages_club(target_club, caller) then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;

  select u.id into target_user from auth.users u where lower(u.email) = lower(trim(p_email));
  if target_user is null then raise exception 'CADDIE_ACCOUNT_NOT_FOUND' using errcode = 'P0002'; end if;

  insert into public.profiles(id, display_name, is_active)
  values (target_user, trim(p_display_name), true)
  on conflict (id) do update set display_name = excluded.display_name, updated_at = now();
  insert into public.user_roles(user_id, role) values (target_user, 'caddie') on conflict do nothing;
  insert into public.caddie_profiles(user_id, tagline, years_experience, rate_amount_in_centavos, verification_status, onboarding_completed_at)
  values (target_user, upper(trim(p_tier)), p_years_experience, p_rate_amount_in_centavos, 'verified', now())
  on conflict (user_id) do update set tagline = excluded.tagline,
    years_experience = excluded.years_experience, rate_amount_in_centavos = excluded.rate_amount_in_centavos,
    verification_status = 'verified', onboarding_completed_at = coalesce(public.caddie_profiles.onboarding_completed_at, now()), updated_at = now();
  insert into public.caddie_club_assignments(caddie_id, club_id, registry_number, verification_status, is_primary, is_active)
  values (target_user, target_club, 'NB-' || upper(substr(replace(target_user::text, '-', ''), 1, 10)), 'verified',
    not exists (select 1 from public.caddie_club_assignments where caddie_id = target_user and is_primary),
    true)
  on conflict (caddie_id, club_id) do update set verification_status = 'verified', is_active = true, updated_at = now();
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (caller, 'caddie.enrolled', 'caddie_profiles', target_user::text, jsonb_build_object('club_id', target_club));
  return target_user;
end;
$$;

create or replace function public.admin_review_caddie(
  p_caddie_id uuid,
  p_status public.verification_status,
  p_note text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); target_club uuid;
begin
  select ca.club_id into target_club from public.caddie_club_assignments ca
  where ca.caddie_id = p_caddie_id and private.manages_club(ca.club_id, actor)
  order by ca.is_primary desc, ca.created_at limit 1;
  if actor is null or target_club is null then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if p_status not in ('verified','changes_requested','rejected') then raise exception 'INVALID_REVIEW_STATUS' using errcode = '22023'; end if;
  if (p_status <> 'verified' and nullif(trim(p_note), '') is null) or char_length(coalesce(p_note, '')) > 4000 then
    raise exception 'REVIEW_NOTE_REQUIRED' using errcode = '22023';
  end if;
  update public.caddie_club_assignments set verification_status = p_status,
    is_active = case when p_status = 'verified' then true else is_active end, updated_at = now()
  where caddie_id = p_caddie_id and club_id = target_club;
  if not found then raise exception 'CADDIE_NOT_FOUND' using errcode = 'P0002'; end if;
  update public.caddie_profiles set verification_status = case
      when exists (select 1 from public.caddie_club_assignments ca where ca.caddie_id = p_caddie_id and ca.verification_status = 'verified') then 'verified'::public.verification_status
      else p_status
    end,
    onboarding_completed_at = case when p_status = 'verified' then coalesce(onboarding_completed_at, now()) else onboarding_completed_at end,
    updated_at = now() where user_id = p_caddie_id;
  update public.verification_documents set verification_status = p_status, reviewed_by = actor, reviewed_at = now()
  where caddie_id = p_caddie_id and club_id = target_club;
  insert into public.caddie_verification_reviews(caddie_id, club_id, reviewer_id, status, reviewer_note)
  values (p_caddie_id, target_club, actor, p_status, nullif(trim(p_note), ''));
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (actor, 'caddie.verification_reviewed', 'caddie_profiles', p_caddie_id::text,
    jsonb_build_object('club_id', target_club, 'status', p_status, 'note', left(p_note, 500)));
end;
$$;

drop function if exists public.admin_set_caddie_active(uuid,boolean);
create or replace function public.admin_set_caddie_active(
  p_caddie_id uuid,
  p_active boolean,
  p_club_id uuid default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); target_club uuid;
begin
  select ca.club_id into target_club from public.caddie_club_assignments ca
  where ca.caddie_id = p_caddie_id and (p_club_id is null or ca.club_id = p_club_id)
    and private.manages_club(ca.club_id, actor)
  order by ca.is_primary desc, ca.created_at limit 1;
  if actor is null or target_club is null or p_active is null then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  update public.caddie_club_assignments set is_active = p_active, updated_at = now()
  where caddie_id = p_caddie_id and club_id = target_club;
  if not found then raise exception 'CADDIE_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (actor, 'caddie.active_changed', 'caddie_club_assignments', p_caddie_id::text, jsonb_build_object('active', p_active, 'club_id', target_club));
end;
$$;

create or replace function public.admin_report_caddie(p_caddie_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); target_club uuid; event_id uuid; open_count integer;
begin
  select ca.club_id into target_club from public.caddie_club_assignments ca
  where ca.caddie_id = p_caddie_id and private.manages_club(ca.club_id, actor)
  order by ca.is_primary desc, ca.created_at limit 1;
  if actor is null or target_club is null then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_reason, ''))) not between 3 and 1000 then raise exception 'INVALID_REPORT_REASON' using errcode = '22023'; end if;
  insert into public.caddie_compliance_events(caddie_id, club_id, reported_by, reason)
  values (p_caddie_id, target_club, actor, trim(p_reason)) returning id into event_id;
  select count(*) into open_count from public.caddie_compliance_events where caddie_id = p_caddie_id and club_id = target_club and resolved_at is null;
  if open_count >= 3 then
    update public.caddie_club_assignments set is_active = false, updated_at = now()
    where caddie_id = p_caddie_id and club_id = target_club;
  end if;
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (actor, 'caddie.reported', 'caddie_compliance_events', event_id::text, jsonb_build_object('caddie_id', p_caddie_id, 'club_id', target_club));
  return event_id;
end;
$$;

create or replace function public.admin_resolve_caddie_report(p_caddie_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); target_club uuid; event_id uuid;
begin
  select ca.club_id into target_club from public.caddie_club_assignments ca
  where ca.caddie_id = p_caddie_id and private.manages_club(ca.club_id, actor)
  order by ca.is_primary desc, ca.created_at limit 1;
  if actor is null or target_club is null then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  select ce.id into event_id from public.caddie_compliance_events ce
  where ce.caddie_id = p_caddie_id and ce.club_id = target_club and ce.resolved_at is null
  order by ce.created_at desc for update skip locked limit 1;
  if event_id is null then raise exception 'OPEN_REPORT_NOT_FOUND' using errcode = 'P0002'; end if;
  update public.caddie_compliance_events set resolved_at = now(), resolved_by = actor where id = event_id;
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (actor, 'caddie.report_resolved', 'caddie_compliance_events', event_id::text, jsonb_build_object('caddie_id', p_caddie_id, 'club_id', target_club));
end;
$$;

drop policy if exists verified_caddie_names_authenticated_read on public.profiles;
create policy profiles_self_platform_or_managed_caddie_read on public.profiles for select to authenticated using (
  id = (select auth.uid()) or private.is_platform_admin((select auth.uid())) or exists (
    select 1 from public.caddie_club_assignments ca where ca.caddie_id = profiles.id and private.manages_club(ca.club_id, (select auth.uid()))
  )
);
drop policy if exists caddie_profiles_read_verified on public.caddie_profiles;
create policy caddie_profiles_catalog_owner_or_manager_read on public.caddie_profiles for select to authenticated using (
  verification_status = 'verified' or user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())) or exists (
    select 1 from public.caddie_club_assignments ca where ca.caddie_id = caddie_profiles.user_id and private.manages_club(ca.club_id, (select auth.uid()))
  )
);
drop policy if exists assignments_read on public.caddie_club_assignments;
create policy assignments_owner_catalog_or_manager_read on public.caddie_club_assignments for select to authenticated using (
  caddie_id = (select auth.uid()) or private.is_platform_admin((select auth.uid()))
  or private.manages_club(club_id, (select auth.uid())) or (verification_status = 'verified' and is_active)
);
drop policy if exists assignments_public_read on public.caddie_club_assignments;
create policy assignments_active_public_read on public.caddie_club_assignments for select to anon using (
  verification_status = 'verified' and is_active
);
drop policy if exists assignments_manager_update on public.caddie_club_assignments;
revoke update on public.caddie_club_assignments from authenticated;
drop policy if exists caddie_compliance_admin_read on public.caddie_compliance_events;
create policy caddie_compliance_manager_read on public.caddie_compliance_events for select to authenticated using (
  private.is_platform_admin((select auth.uid())) or private.manages_club(club_id, (select auth.uid()))
);
drop policy if exists verification_reviews_participant_read on public.caddie_verification_reviews;
create policy verification_reviews_participant_manager_read on public.caddie_verification_reviews for select to authenticated using (
  caddie_id = (select auth.uid()) or private.is_platform_admin((select auth.uid()))
  or private.manages_club(club_id, (select auth.uid()))
);

create or replace function public.publish_tee_time(
  p_course_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_cutoff_at timestamptz,
  p_capacity smallint
) returns public.tee_times
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); target_club uuid; result public.tee_times;
begin
  select club_id into target_club from public.courses where id = p_course_id and is_active;
  if caller is null or target_club is null or not private.manages_club(target_club, caller) then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  if p_starts_at <= now() or p_ends_at <= p_starts_at or p_booking_cutoff_at >= p_starts_at or p_capacity not between 1 and 8 then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;
  insert into public.tee_times(course_id, starts_at, ends_at, booking_cutoff_at, player_capacity, status, source, published_at)
  values (p_course_id, p_starts_at, p_ends_at, p_booking_cutoff_at, p_capacity, 'open', 'club', now())
  returning * into result;
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (caller, 'tee_time.published', 'tee_times', result.id::text,
    jsonb_build_object('course_id', p_course_id, 'starts_at', p_starts_at, 'capacity', p_capacity));
  return result;
exception when unique_violation then
  raise exception 'TEE_TIME_ALREADY_EXISTS' using errcode = '23505';
end;
$$;

create or replace function public.update_published_tee_time(
  p_tee_time_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_booking_cutoff_at timestamptz,
  p_capacity smallint,
  p_status text
) returns public.tee_times
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); current_slot public.tee_times; target_club uuid; active_units bigint; result public.tee_times; booking_rules public.booking_policy;
begin
  select t, c.club_id into current_slot, target_club from public.tee_times t join public.courses c on c.id = t.course_id where t.id = p_tee_time_id for update of t;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or not private.manages_club(target_club, caller) then raise exception 'PERMISSION_DENIED' using errcode = '42501'; end if;
  select * into booking_rules from public.booking_policy where singleton;
  select coalesce(sum(case when booking_rules.capacity_unit = 'bookings' then 1 else a.capacity_units end), 0) into active_units
  from private.booking_allocations a join public.bookings b on b.id = a.booking_id
  where a.tee_time_id = p_tee_time_id and a.released_at is null
    and (b.status in ('confirmed','in_progress') or (b.status = 'pending' and b.expires_at > now()));
  if active_units > 0 and (p_starts_at <> current_slot.starts_at or p_ends_at <> current_slot.ends_at or p_status in ('closed','canceled')) then
    raise exception 'ACTIVE_BOOKINGS_PREVENT_SCHEDULE_CHANGE' using errcode = '23P01';
  end if;
  if p_status not in ('open','held','closed','canceled') or p_starts_at <= now()
     or p_capacity < active_units or p_capacity not between 1 and 8
     or p_booking_cutoff_at >= p_starts_at or p_ends_at <= p_starts_at then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;
  update public.tee_times set starts_at = p_starts_at, ends_at = p_ends_at,
    booking_cutoff_at = p_booking_cutoff_at, player_capacity = p_capacity, status = p_status
  where id = p_tee_time_id returning * into result;
  insert into private.audit_logs(actor_id, action, target_table, target_id, metadata)
  values (caller, 'tee_time.updated', 'tee_times', p_tee_time_id::text,
    jsonb_build_object('old_starts_at', current_slot.starts_at, 'new_starts_at', p_starts_at, 'capacity', p_capacity, 'status', p_status));
  return result;
end;
$$;

create or replace function public.run_booking_maintenance(p_limit integer default 100)
returns integer
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' and current_user <> 'postgres' then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  perform private.process_booking_events(p_limit);
  return private.expire_stale_booking_holds(p_limit, null, null);
end;
$$;

create or replace function public.claim_booking_emails(p_limit integer default 20)
returns table(id uuid, recipient_email text, subject text, body text, deep_link text)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  with claimed as (
    select o.id from private.notification_outbox o
    where o.attempts < 8 and o.dead_lettered_at is null and (
      (o.delivery_status in ('pending','failed') and o.available_at <= now()) or
      (o.delivery_status = 'sending' and o.locked_at < now() - interval '5 minutes')
    )
    order by o.available_at, o.created_at
    for update skip locked limit greatest(1, least(coalesce(p_limit, 20), 100))
  )
  update private.notification_outbox o
  set delivery_status = 'sending', attempts = attempts + 1, locked_at = now(), last_error = null
  from claimed where o.id = claimed.id
  returning o.id, o.recipient_email, o.subject, o.body, o.deep_link;
end;
$$;

drop function if exists public.complete_booking_email(uuid,boolean,text);
create or replace function public.complete_booking_email(
  p_id uuid, p_sent boolean, p_error text default null, p_provider_message_id text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare current_attempts smallint;
begin
  select attempts into current_attempts from private.notification_outbox where id = p_id and delivery_status = 'sending' for update;
  if not found then return; end if;
  update private.notification_outbox set
    delivery_status = case when p_sent then 'sent' else 'failed' end,
    sent_at = case when p_sent then now() else null end,
    locked_at = null,
    provider_message_id = case when p_sent then p_provider_message_id else provider_message_id end,
    last_error = case when p_sent then null else left(coalesce(p_error, 'delivery failed'), 500) end,
    available_at = case when p_sent then available_at else now() + make_interval(secs => least(3600, (power(2, least(current_attempts, 10))::integer * 15) + floor(random() * 15)::integer)) end,
    dead_lettered_at = case when not p_sent and current_attempts >= 8 then now() else dead_lettered_at end
  where id = p_id;
end;
$$;

revoke all on function public.list_bookable_tee_times(uuid,date,integer,timestamptz) from public, anon;
revoke all on function public.list_available_caddies_for_tee_time(uuid,integer) from public, anon;
revoke all on function public.create_mobile_booking(uuid,uuid,smallint,text) from public, anon;
revoke all on function public.respond_to_booking(uuid,boolean) from public, anon;
revoke all on function public.cancel_booking(uuid) from public, anon;
revoke all on function public.transition_booking(uuid,public.booking_status,text) from public, anon;
revoke all on function public.set_caddie_tee_time_availability(uuid[]) from public, anon;
revoke all on function public.admin_set_caddie_tee_time_availability(uuid,uuid,boolean) from public, anon;
revoke all on function public.list_verified_caddie_names(uuid[],integer) from public;
revoke all on function public.admin_enroll_existing_caddie(text,text,text,bigint,smallint,uuid) from public, anon;
revoke all on function public.admin_review_caddie(uuid,public.verification_status,text) from public, anon;
revoke all on function public.admin_set_caddie_active(uuid,boolean,uuid) from public, anon;
revoke all on function public.admin_report_caddie(uuid,text) from public, anon;
revoke all on function public.admin_resolve_caddie_report(uuid) from public, anon;
revoke all on function public.publish_tee_time(uuid,timestamptz,timestamptz,timestamptz,smallint) from public, anon;
revoke all on function public.update_published_tee_time(uuid,timestamptz,timestamptz,timestamptz,smallint,text) from public, anon;
revoke all on function public.run_booking_maintenance(integer) from public, anon, authenticated;
revoke all on function public.claim_booking_emails(integer) from public, anon, authenticated;
revoke all on function public.complete_booking_email(uuid,boolean,text,text) from public, anon, authenticated;
grant execute on function public.list_bookable_tee_times(uuid,date,integer,timestamptz) to authenticated;
grant execute on function public.list_available_caddies_for_tee_time(uuid,integer) to authenticated;
grant execute on function public.create_mobile_booking(uuid,uuid,smallint,text) to authenticated;
grant execute on function public.respond_to_booking(uuid,boolean) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.transition_booking(uuid,public.booking_status,text) to authenticated;
grant execute on function public.set_caddie_tee_time_availability(uuid[]) to authenticated;
grant execute on function public.admin_set_caddie_tee_time_availability(uuid,uuid,boolean) to authenticated;
grant execute on function public.list_verified_caddie_names(uuid[],integer) to anon, authenticated;
grant execute on function public.admin_enroll_existing_caddie(text,text,text,bigint,smallint,uuid) to authenticated;
grant execute on function public.admin_review_caddie(uuid,public.verification_status,text) to authenticated;
grant execute on function public.admin_set_caddie_active(uuid,boolean,uuid) to authenticated;
grant execute on function public.admin_report_caddie(uuid,text) to authenticated;
grant execute on function public.admin_resolve_caddie_report(uuid) to authenticated;
grant execute on function public.publish_tee_time(uuid,timestamptz,timestamptz,timestamptz,smallint) to authenticated;
grant execute on function public.update_published_tee_time(uuid,timestamptz,timestamptz,timestamptz,smallint,text) to authenticated;
grant execute on function public.run_booking_maintenance(integer) to service_role;
grant execute on function public.claim_booking_emails(integer) to service_role;
grant execute on function public.complete_booking_email(uuid,boolean,text,text) to service_role;

revoke all on function private.emit_booking_event(uuid,text,text,jsonb) from public, anon, authenticated;
revoke all on function private.release_booking_allocation(uuid,text) from public, anon, authenticated;
revoke all on function private.expire_stale_booking_holds(integer,uuid,uuid) from public, anon, authenticated;
revoke all on function private.process_booking_events(integer) from public, anon, authenticated;

-- Expired legacy holds stop blocking availability immediately after migration.
select private.expire_stale_booking_holds(500, null, null);
