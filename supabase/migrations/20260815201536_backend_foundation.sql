-- NoBogey backend foundation.
-- All timestamps are UTC-aware. Money is stored as integer centavos.

create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('golfer', 'caddie', 'club_manager', 'admin', 'super_admin');
create type public.verification_status as enum ('draft', 'pending', 'changes_requested', 'verified', 'rejected');
create type public.booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'canceled', 'declined', 'conflicted');
create type public.payment_status as enum ('requires_payment', 'processing', 'paid', 'failed', 'abandoned', 'partially_refunded', 'refunded');
create type public.payout_status as enum ('held', 'eligible', 'processing', 'paid', 'failed', 'reversed');
create type public.dispute_status as enum ('open', 'under_review', 'resolved', 'rejected');
create type public.ledger_entry_type as enum ('payment_captured', 'refund', 'platform_fee', 'caddie_payable', 'payout', 'payout_reversal', 'adjustment');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  phone_e164 text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references public.profiles(id) on delete restrict,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.golfer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  handicap numeric(4,1) check (handicap between -10 and 54),
  bio text check (char_length(bio) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.caddie_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tagline text check (char_length(tagline) <= 80),
  bio text check (char_length(bio) <= 1000),
  years_experience smallint check (years_experience between 0 and 80),
  rate_amount_in_centavos bigint not null default 0 check (rate_amount_in_centavos >= 0),
  verification_status public.verification_status not null default 'draft',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playstyles (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique,
  is_active boolean not null default true
);

create table public.golfer_playstyles (
  golfer_id uuid not null references public.golfer_profiles(user_id) on delete cascade,
  playstyle_id bigint not null references public.playstyles(id) on delete restrict,
  weight smallint not null default 1 check (weight between 1 and 5),
  primary key (golfer_id, playstyle_id)
);

create table public.caddie_playstyles (
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  playstyle_id bigint not null references public.playstyles(id) on delete restrict,
  proficiency smallint not null default 1 check (proficiency between 1 and 5),
  primary key (caddie_id, playstyle_id)
);

create table public.golf_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  region text not null,
  country_code text not null default 'PH' check (country_code ~ '^[A-Z]{2}$'),
  timezone text not null default 'Asia/Manila',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, city, region)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.golf_clubs(id) on delete restrict,
  name text not null,
  holes smallint not null default 18 check (holes in (9, 18, 27, 36)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, name)
);

create table public.club_staff (
  club_id uuid not null references public.golf_clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null check (role = 'club_manager'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table public.caddie_club_assignments (
  id uuid primary key default gen_random_uuid(),
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  club_id uuid not null references public.golf_clubs(id) on delete restrict,
  registry_number text,
  verification_status public.verification_status not null default 'draft',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (caddie_id, club_id)
);
create unique index caddie_one_primary_club_idx on public.caddie_club_assignments(caddie_id) where is_primary;

create table public.caddie_availability (
  id uuid primary key default gen_random_uuid(),
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  club_id uuid not null references public.golf_clubs(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  exclude using gist (
    caddie_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (is_available)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  golfer_id uuid not null references public.golfer_profiles(user_id) on delete restrict,
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  party_size smallint not null check (party_size between 1 and 8),
  quoted_amount_in_centavos bigint not null check (quoted_amount_in_centavos >= 0),
  currency text not null default 'PHP' check (currency = 'PHP'),
  status public.booking_status not null default 'pending',
  idempotency_key text not null,
  confirmed_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (golfer_id, idempotency_key),
  exclude using gist (
    caddie_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'in_progress'))
);

create table public.booking_status_history (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete restrict,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references public.profiles(id) on delete restrict,
  reason text,
  created_at timestamptz not null default now()
);

create table public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  provider text not null,
  provider_reference text unique,
  amount_in_centavos bigint not null check (amount_in_centavos > 0),
  currency text not null default 'PHP' check (currency = 'PHP'),
  status public.payment_status not null default 'requires_payment',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.payment_callback_events (
  id bigint generated always as identity primary key,
  provider text not null,
  provider_event_id text not null,
  payment_intent_id uuid references public.payment_intents(id) on delete restrict,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  signature_verified boolean not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  outcome text,
  unique (provider, provider_event_id)
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete restrict,
  amount_in_centavos bigint not null check (amount_in_centavos >= 0),
  currency text not null default 'PHP' check (currency = 'PHP'),
  status public.payout_status not null default 'held',
  eligible_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.financial_ledger (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings(id) on delete restrict,
  payment_intent_id uuid references public.payment_intents(id) on delete restrict,
  payout_id uuid references public.payouts(id) on delete restrict,
  entry_type public.ledger_entry_type not null,
  amount_in_centavos bigint not null check (amount_in_centavos <> 0),
  currency text not null default 'PHP' check (currency = 'PHP'),
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  rater_id uuid not null references public.profiles(id) on delete restrict,
  ratee_id uuid not null references public.profiles(id) on delete restrict,
  score smallint not null check (score between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  check (rater_id <> ratee_id),
  unique (booking_id, rater_id)
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  status public.dispute_status not null default 'open',
  reason text not null check (char_length(reason) between 1 and 4000),
  resolution text,
  resolved_by uuid references public.profiles(id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  club_id uuid not null references public.golf_clubs(id) on delete restrict,
  storage_object_name text not null unique,
  document_type text not null,
  verification_status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table private.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete restrict,
  action text not null,
  target_table text not null,
  target_id text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Foreign-key and authorization-path indexes.
create index user_roles_role_user_idx on public.user_roles(role, user_id);
create index courses_club_id_idx on public.courses(club_id);
create index club_staff_user_id_idx on public.club_staff(user_id) where is_active;
create index caddie_club_assignments_club_id_idx on public.caddie_club_assignments(club_id, caddie_id);
create index caddie_availability_lookup_idx on public.caddie_availability(club_id, starts_at, ends_at) where is_available;
create index bookings_golfer_created_idx on public.bookings(golfer_id, created_at desc);
create index bookings_caddie_starts_idx on public.bookings(caddie_id, starts_at) where status in ('pending', 'confirmed', 'in_progress');
create index bookings_course_starts_idx on public.bookings(course_id, starts_at);
create index booking_status_history_booking_idx on public.booking_status_history(booking_id, created_at);
create index payment_intents_status_idx on public.payment_intents(status, created_at);
create index payouts_caddie_status_idx on public.payouts(caddie_id, status);
create index ratings_ratee_idx on public.ratings(ratee_id, created_at desc);
create index disputes_booking_idx on public.disputes(booking_id);
create index notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index verification_documents_club_idx on public.verification_documents(club_id, verification_status);
create index payment_callback_intent_idx on private.payment_callback_events(payment_intent_id);
create index financial_ledger_booking_idx on private.financial_ledger(booking_id, created_at);
create index audit_logs_actor_idx on private.audit_logs(actor_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','golfer_profiles','caddie_profiles','golf_clubs','courses','caddie_club_assignments','caddie_availability','bookings','payment_intents','payouts','disputes']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

create or replace function private.has_role(required_role public.app_role, subject uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select subject is not null and exists (
    select 1 from public.user_roles ur where ur.user_id = subject and ur.role = required_role
  );
$$;

create or replace function private.is_platform_admin(subject uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_role('admin', subject) or private.has_role('super_admin', subject);
$$;

create or replace function private.manages_club(target_club uuid, subject uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select subject is not null and (
    private.is_platform_admin(subject) or exists (
      select 1 from public.club_staff cs
      where cs.club_id = target_club and cs.user_id = subject and cs.is_active
    )
  );
$$;

create or replace function private.can_view_booking(target_booking uuid, subject uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select subject is not null and exists (
    select 1
    from public.bookings b
    join public.courses c on c.id = b.course_id
    where b.id = target_booking
      and (b.golfer_id = subject or b.caddie_id = subject or private.manages_club(c.club_id, subject))
  );
$$;

create or replace function private.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'NoBogey user'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_auth_user();

create or replace function public.create_booking(
  p_caddie_id uuid,
  p_course_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_party_size smallint,
  p_idempotency_key text
) returns public.bookings
language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  quoted bigint;
  result public.bookings;
begin
  if caller is null or not private.has_role('golfer', caller) then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_ends_at <= p_starts_at or p_starts_at <= now() or p_party_size not between 1 and 8 then
    raise exception 'VALIDATION_FAILED' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.caddie_availability a
    join public.courses c on c.club_id = a.club_id
    join public.caddie_club_assignments ca on ca.caddie_id = a.caddie_id and ca.club_id = a.club_id
    join public.caddie_profiles cp on cp.user_id = a.caddie_id
    where a.caddie_id = p_caddie_id and c.id = p_course_id and a.is_available
      and ca.verification_status = 'verified' and cp.verification_status = 'verified'
      and tstzrange(a.starts_at, a.ends_at, '[)') @> tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    raise exception 'BOOKING_CONFLICT' using errcode = '23P01';
  end if;
  select rate_amount_in_centavos into quoted from public.caddie_profiles where user_id = p_caddie_id;
  begin
    insert into public.bookings(golfer_id, caddie_id, course_id, starts_at, ends_at, party_size, quoted_amount_in_centavos, idempotency_key)
    values (caller, p_caddie_id, p_course_id, p_starts_at, p_ends_at, p_party_size, quoted, p_idempotency_key)
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

create or replace function private.process_verified_payment_event(
  p_provider text,
  p_provider_event_id text,
  p_provider_reference text,
  p_payload_sha256 text,
  p_amount_in_centavos bigint
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare intent public.payment_intents; booking public.bookings;
begin
  if current_user not in ('service_role', 'postgres') then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  insert into private.payment_callback_events(provider, provider_event_id, payload_sha256, signature_verified)
  values (p_provider, p_provider_event_id, p_payload_sha256, true)
  on conflict (provider, provider_event_id) do nothing;
  if not found then
    select payment_intent_id into intent.id from private.payment_callback_events
    where provider = p_provider and provider_event_id = p_provider_event_id;
    return intent.id;
  end if;
  select * into intent from public.payment_intents
  where provider = p_provider and provider_reference = p_provider_reference for update;
  if not found or intent.amount_in_centavos <> p_amount_in_centavos then
    update private.payment_callback_events set processed_at = now(), outcome = 'rejected' where provider = p_provider and provider_event_id = p_provider_event_id;
    raise exception 'PAYMENT_FAILED' using errcode = '22023';
  end if;
  select * into booking from public.bookings where id = intent.booking_id for update;
  if booking.status <> 'pending' then
    raise exception 'INVALID_BOOKING_TRANSITION' using errcode = '22023';
  end if;
  update public.payment_intents set status = 'paid', paid_at = now() where id = intent.id;
  update public.bookings set status = 'confirmed', confirmed_at = now() where id = booking.id;
  insert into public.booking_status_history(booking_id, from_status, to_status, reason) values (booking.id, booking.status, 'confirmed', 'verified payment callback');
  insert into private.financial_ledger(booking_id, payment_intent_id, entry_type, amount_in_centavos, external_reference)
  values (booking.id, intent.id, 'payment_captured', intent.amount_in_centavos, p_provider_event_id);
  insert into public.payouts(booking_id, caddie_id, amount_in_centavos) values (booking.id, booking.caddie_id, intent.amount_in_centavos);
  update private.payment_callback_events set payment_intent_id = intent.id, processed_at = now(), outcome = 'confirmed' where provider = p_provider and provider_event_id = p_provider_event_id;
  return intent.id;
end;
$$;

create or replace function private.complete_booking(p_booking_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare booking public.bookings; payout public.payouts;
begin
  if current_user not in ('service_role', 'postgres') then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  select * into booking from public.bookings where id = p_booking_id for update;
  if not found or booking.status <> 'in_progress' then
    raise exception 'INVALID_BOOKING_TRANSITION' using errcode = '22023';
  end if;
  update public.bookings set status = 'completed', completed_at = now() where id = booking.id;
  update public.payouts set status = 'eligible', eligible_at = now()
  where booking_id = booking.id and status = 'held' returning * into payout;
  if not found then
    raise exception 'PAYOUT_NOT_HELD' using errcode = '22023';
  end if;
  insert into public.booking_status_history(booking_id, from_status, to_status, reason)
  values (booking.id, booking.status, 'completed', 'server-verified session completion');
  insert into private.financial_ledger(booking_id, payout_id, entry_type, amount_in_centavos)
  values (booking.id, payout.id, 'caddie_payable', payout.amount_in_centavos);
  insert into private.audit_logs(actor_id, action, target_table, target_id)
  values (auth.uid(), 'booking.completed', 'bookings', booking.id::text);
end;
$$;

-- Append-only financial/audit records.
create or replace function private.reject_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'APPEND_ONLY';
end;
$$;
create trigger financial_ledger_append_only before update or delete on private.financial_ledger for each row execute function private.reject_mutation();
create trigger payment_callbacks_append_only before delete on private.payment_callback_events for each row execute function private.reject_mutation();
create trigger audit_logs_append_only before update or delete on private.audit_logs for each row execute function private.reject_mutation();

-- Deny by default, then explicitly expose only intended operations.
revoke all on table
  public.profiles, public.user_roles, public.golfer_profiles, public.caddie_profiles,
  public.playstyles, public.golfer_playstyles, public.caddie_playstyles,
  public.golf_clubs, public.courses, public.club_staff, public.caddie_club_assignments,
  public.caddie_availability, public.bookings, public.booking_status_history,
  public.payment_intents, public.payouts, public.ratings, public.disputes,
  public.notifications, public.verification_documents
from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.golfer_profiles enable row level security;
alter table public.caddie_profiles enable row level security;
alter table public.playstyles enable row level security;
alter table public.golfer_playstyles enable row level security;
alter table public.caddie_playstyles enable row level security;
alter table public.golf_clubs enable row level security;
alter table public.courses enable row level security;
alter table public.club_staff enable row level security;
alter table public.caddie_club_assignments enable row level security;
alter table public.caddie_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payouts enable row level security;
alter table public.ratings enable row level security;
alter table public.disputes enable row level security;
alter table public.notifications enable row level security;
alter table public.verification_documents enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()) or private.is_platform_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy user_roles_self_select on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or private.is_platform_admin());
create policy golfer_profiles_self on public.golfer_profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy caddie_profiles_read_verified on public.caddie_profiles for select to authenticated using (verification_status = 'verified' or user_id = (select auth.uid()) or private.is_platform_admin());
create policy caddie_profiles_self_update on public.caddie_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy playstyles_authenticated_read on public.playstyles for select to authenticated using (is_active);
create policy golfer_playstyles_owner on public.golfer_playstyles for all to authenticated using (golfer_id = (select auth.uid())) with check (golfer_id = (select auth.uid()));
create policy caddie_playstyles_read on public.caddie_playstyles for select to authenticated using (true);
create policy caddie_playstyles_owner_write on public.caddie_playstyles for all to authenticated using (caddie_id = (select auth.uid())) with check (caddie_id = (select auth.uid()));
create policy clubs_authenticated_read on public.golf_clubs for select to authenticated using (is_active or private.is_platform_admin());
create policy courses_authenticated_read on public.courses for select to authenticated using (is_active or private.is_platform_admin());
create policy club_staff_self_select on public.club_staff for select to authenticated using (user_id = (select auth.uid()) or private.manages_club(club_id));
create policy assignments_read on public.caddie_club_assignments for select to authenticated using (caddie_id = (select auth.uid()) or verification_status = 'verified' or private.manages_club(club_id));
create policy assignments_manager_update on public.caddie_club_assignments for update to authenticated using (private.manages_club(club_id)) with check (private.manages_club(club_id));
create policy availability_read on public.caddie_availability for select to authenticated using (is_available or caddie_id = (select auth.uid()) or private.manages_club(club_id));
create policy availability_owner_write on public.caddie_availability for all to authenticated using (caddie_id = (select auth.uid())) with check (caddie_id = (select auth.uid()) and private.has_role('caddie'));
create policy bookings_participant_select on public.bookings for select to authenticated using (private.can_view_booking(id));
create policy booking_history_participant_select on public.booking_status_history for select to authenticated using (private.can_view_booking(booking_id));
create policy payment_participant_select on public.payment_intents for select to authenticated using (private.can_view_booking(booking_id));
create policy payout_caddie_select on public.payouts for select to authenticated using (
  caddie_id = (select auth.uid()) or private.is_platform_admin() or exists (
    select 1 from public.bookings b join public.courses c on c.id = b.course_id
    where b.id = booking_id and private.manages_club(c.club_id)
  )
);
create policy ratings_participant_select on public.ratings for select to authenticated using (private.can_view_booking(booking_id));
create policy ratings_eligible_insert on public.ratings for insert to authenticated with check (
  rater_id = (select auth.uid()) and exists (
    select 1 from public.bookings b where b.id = booking_id and b.status = 'completed'
      and ((b.golfer_id = rater_id and b.caddie_id = ratee_id) or (b.caddie_id = rater_id and b.golfer_id = ratee_id))
  )
);
create policy disputes_participant_select on public.disputes for select to authenticated using (opened_by = (select auth.uid()) or private.can_view_booking(booking_id));
create policy disputes_participant_insert on public.disputes for insert to authenticated with check (opened_by = (select auth.uid()) and private.can_view_booking(booking_id));
create policy notifications_owner_select on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy verification_documents_authorized_select on public.verification_documents for select to authenticated using (caddie_id = (select auth.uid()) or private.manages_club(club_id));
create policy verification_documents_owner_insert on public.verification_documents for insert to authenticated with check (
  caddie_id = (select auth.uid()) and verification_status = 'pending' and reviewed_by is null and reviewed_at is null
  and exists (select 1 from public.caddie_club_assignments a where a.caddie_id = (select auth.uid()) and a.club_id = club_id)
);

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update(display_name, phone_e164) on public.profiles to authenticated;
grant select on public.user_roles, public.playstyles, public.golf_clubs, public.courses, public.club_staff, public.booking_status_history, public.payment_intents, public.payouts to authenticated;
grant select, insert, update, delete on public.golfer_profiles, public.golfer_playstyles, public.caddie_playstyles, public.caddie_availability to authenticated;
grant select on public.caddie_profiles, public.caddie_club_assignments, public.notifications to authenticated;
grant update(tagline, bio, years_experience, rate_amount_in_centavos, onboarding_completed_at) on public.caddie_profiles to authenticated;
grant update on public.caddie_club_assignments to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant select on public.bookings to authenticated;
grant select, insert on public.ratings, public.disputes, public.verification_documents to authenticated;
grant execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, smallint, text) to authenticated;
revoke all on function public.create_booking(uuid, uuid, timestamptz, timestamptz, smallint, text) from public, anon;
grant usage on schema private to authenticated, service_role;
grant execute on function private.has_role(public.app_role, uuid), private.is_platform_admin(uuid), private.manages_club(uuid, uuid), private.can_view_booking(uuid, uuid) to authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon;
grant execute on function private.process_verified_payment_event(text, text, text, text, bigint) to service_role;
grant execute on function private.complete_booking(uuid) to service_role;

-- Private verification documents. Object paths must start with the caddie's user UUID.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('verification-documents', 'verification-documents', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy verification_objects_owner_insert on storage.objects for insert to authenticated
with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy verification_objects_authorized_select on storage.objects for select to authenticated
using (
  bucket_id = 'verification-documents' and (
    (storage.foldername(name))[1] = (select auth.uid())::text or exists (
      select 1 from public.verification_documents d where d.storage_object_name = name and private.manages_club(d.club_id)
    )
  )
);
