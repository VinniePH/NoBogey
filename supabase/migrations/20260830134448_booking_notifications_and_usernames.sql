-- Usernames, self-service role completion, booking receipts, and email outbox.

alter table public.profiles
  add column username text;

alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_]{3,32}$');

create unique index profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
begin
  if requested_username is not null and requested_username !~ '^[A-Za-z0-9_]{3,32}$' then
    raise exception 'INVALID_USERNAME' using errcode = '22023';
  end if;

  insert into public.profiles(id, display_name, username)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'NoBogey user'),
    requested_username
  );
  return new;
end;
$$;

create or replace function public.complete_signup(p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if p_role not in ('golfer', 'caddie') then
    raise exception 'INVALID_ROLE' using errcode = '22023';
  end if;

  insert into public.user_roles(user_id, role)
  values (caller, p_role)
  on conflict do nothing;

  if p_role = 'golfer' then
    insert into public.golfer_profiles(user_id)
    values (caller)
    on conflict do nothing;
  else
    insert into public.caddie_profiles(user_id)
    values (caller)
    on conflict do nothing;
  end if;
end;
$$;

revoke all on function public.complete_signup(public.app_role) from public, anon;
grant execute on function public.complete_signup(public.app_role) to authenticated;

create table private.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_email text not null,
  template_kind text not null check (template_kind in ('golfer_booking_confirmation', 'caddie_booking_assignment')),
  subject text not null,
  body text not null,
  deep_link text not null,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sending', 'sent', 'failed')),
  attempts smallint not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (booking_id, user_id, template_kind)
);

alter table private.notification_outbox enable row level security;
revoke all on private.notification_outbox from public, anon, authenticated;
create index notification_outbox_pending_idx
  on private.notification_outbox(created_at)
  where delivery_status = 'pending';

create or replace function private.enqueue_booking_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  golfer_name text;
  caddie_name text;
  course_name text;
  golfer_email text;
  caddie_email text;
  golfer_link text := 'https://nobogeyofficial.com/golfer/bookings/' || new.id::text;
  caddie_link text := 'https://nobogeyofficial.com/caddie/matches/' || new.id::text;
  tee_time_text text;
  reporting_time_text text;
begin
  select p.display_name, u.email into golfer_name, golfer_email
  from public.profiles p join auth.users u on u.id = p.id
  where p.id = new.golfer_id;

  select p.display_name, u.email into caddie_name, caddie_email
  from public.profiles p join auth.users u on u.id = p.id
  where p.id = new.caddie_id;

  select c.name into course_name from public.courses c where c.id = new.course_id;
  tee_time_text := to_char(new.starts_at at time zone 'Asia/Manila', 'FMMM/FMDD/YYYY | FMHH12:MI AM');
  reporting_time_text := to_char((new.starts_at - interval '30 minutes') at time zone 'Asia/Manila', 'FMMM/FMDD/YYYY | FMHH12:MI AM');

  insert into public.notifications(user_id, kind, title, body, data)
  values
    (new.golfer_id, 'golfer_booking_confirmation', 'Golf Booking & Confirmation Invoice',
      'Booking ' || new.id::text || ' at ' || course_name || ' with ' || caddie_name || '.',
      jsonb_build_object('booking_id', new.id, 'deep_link', golfer_link)),
    (new.caddie_id, 'caddie_booking_assignment', 'View Full Receipt & Manage Booking in App',
      'Assigned golfer: ' || golfer_name || '. Report 30 minutes before tee time.',
      jsonb_build_object('booking_id', new.id, 'deep_link', caddie_link));

  insert into private.notification_outbox(booking_id, user_id, recipient_email, template_kind, subject, body, deep_link)
  values
    (new.id, new.golfer_id, golfer_email, 'golfer_booking_confirmation',
      'Golf Booking & Confirmation Invoice',
      E'📲 Golf Booking & Confirmation Invoice\n\nGolfer: ' || golfer_name ||
      E'\nBooking ID: ' || new.id::text || E'\nTee Time: ' || tee_time_text ||
      E'\nCourse: ' || course_name || E'\n\n📲 View booking: ' || golfer_link,
      golfer_link),
    (new.id, new.caddie_id, caddie_email, 'caddie_booking_assignment',
      'View Full Receipt & Manage Booking in App',
      E'📲 View Full Receipt & Manage Booking in App\n\nCaddie Name: ' || caddie_name ||
      E'\nCaddie ID: #' || left(new.caddie_id::text, 8) || E'\nAssigned Golfer: ' || golfer_name ||
      E'\nReporting Time: ' || reporting_time_text || E' | 30 Mins Before Tee Time\n\n📲 Manage booking: ' || caddie_link,
      caddie_link);

  return new;
end;
$$;

create trigger bookings_enqueue_notifications
after insert on public.bookings
for each row execute function private.enqueue_booking_notifications();

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_booking public.bookings;
  previous_status public.booking_status;
begin
  select * into current_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or (current_booking.golfer_id <> caller and not private.is_platform_admin(caller)) then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if current_booking.status not in ('pending', 'confirmed') then
    raise exception 'INVALID_BOOKING_STATUS' using errcode = '22023';
  end if;

  previous_status := current_booking.status;
  update public.bookings set status = 'canceled', canceled_at = now()
  where id = p_booking_id returning * into current_booking;
  insert into public.booking_status_history(booking_id, from_status, to_status, changed_by)
  values (p_booking_id, previous_status, 'canceled', caller);
  return current_booking;
end;
$$;

revoke all on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- Public marketplace catalog. Personal and booking data remain authenticated and RLS protected.
grant select on public.golf_clubs, public.courses, public.playstyles,
  public.caddie_profiles, public.caddie_club_assignments, public.caddie_availability,
  public.caddie_playstyles, public.profiles to anon;

create policy clubs_public_read on public.golf_clubs for select to anon using (is_active);
create policy courses_public_read on public.courses for select to anon using (is_active);
create policy playstyles_public_read on public.playstyles for select to anon using (is_active);
create policy caddie_profiles_public_read on public.caddie_profiles for select to anon
  using (verification_status = 'verified');
create policy assignments_public_read on public.caddie_club_assignments for select to anon
  using (verification_status = 'verified');
create policy availability_public_read on public.caddie_availability for select to anon
  using (is_available);
create policy caddie_playstyles_public_read on public.caddie_playstyles for select to anon using (true);
create policy verified_caddie_names_public_read on public.profiles for select to anon
  using (exists (
    select 1 from public.caddie_profiles cp
    where cp.user_id = profiles.id and cp.verification_status = 'verified'
  ));

-- Stable catalog IDs make local fixtures, test data, and deep links repeatable.
insert into public.playstyles(slug, name) values
  ('course-strategy', 'Course Strategy'),
  ('green-reading', 'Green Reading'),
  ('pace-of-play', 'Pace of Play'),
  ('beginner-friendly', 'Beginner Friendly')
on conflict (slug) do update set name = excluded.name, is_active = true;

insert into public.golf_clubs(id, name, city, region) values
  ('10000000-0000-4000-8000-000000000001', 'Manila Golf and Country Club', 'Makati', 'Metro Manila'),
  ('10000000-0000-4000-8000-000000000002', 'Wack Wack Golf and Country Club', 'Mandaluyong', 'Metro Manila'),
  ('10000000-0000-4000-8000-000000000003', 'The Orchard Golf and Country Club', 'Dasmariñas', 'Cavite')
on conflict (id) do update set name = excluded.name, city = excluded.city, region = excluded.region, is_active = true;

insert into public.courses(id, club_id, name, holes) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Manila Golf Course', 18),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'East Course', 18),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'West Course', 18),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', 'Palmer Course', 18)
on conflict (id) do update set club_id = excluded.club_id, name = excluded.name, holes = excluded.holes, is_active = true;
