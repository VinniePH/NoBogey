create table public.tee_times (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  starts_at timestamptz not null, ends_at timestamptz not null,
  player_capacity smallint not null default 4 check (player_capacity between 1 and 8),
  status text not null default 'open' check (status in ('open', 'held', 'closed', 'canceled')),
  source text not null default 'club', source_reference text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at), unique (course_id, starts_at)
);
alter table public.tee_times enable row level security;
grant select on public.tee_times to anon, authenticated;
grant insert, update, delete on public.tee_times to authenticated;
create policy tee_times_catalog_read on public.tee_times for select to anon, authenticated using (status in ('open', 'held'));
create policy tee_times_admin_write on public.tee_times for all to authenticated
  using (private.is_platform_admin((select auth.uid()))) with check (private.is_platform_admin((select auth.uid())));

create or replace view public.caddie_directory with (security_invoker = true) as
select p.id, p.display_name from public.profiles p join public.caddie_profiles cp on cp.user_id = p.id
where p.is_active and cp.verification_status = 'verified';
grant select on public.caddie_directory to anon, authenticated;
revoke select on public.profiles from anon;
drop policy if exists verified_caddie_names_public_read on public.profiles;
create policy verified_caddie_names_authenticated_read on public.profiles for select to authenticated using (
  id = (select auth.uid()) or private.is_platform_admin((select auth.uid())) or exists (
    select 1 from public.caddie_profiles cp where cp.user_id = profiles.id and cp.verification_status = 'verified'));

create table public.legal_acceptances (
  id bigint generated always as identity primary key, user_id uuid not null references public.profiles(id) on delete cascade,
  document_kind text not null check (document_kind in ('terms', 'privacy')), document_version text not null,
  accepted_at timestamptz not null default now(), unique (user_id, document_kind, document_version)
);
alter table public.legal_acceptances enable row level security;
grant select, insert on public.legal_acceptances to authenticated;
create policy legal_acceptances_self_read on public.legal_acceptances for select to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())));
create policy legal_acceptances_self_insert on public.legal_acceptances for insert to authenticated with check (user_id = (select auth.uid()));

create or replace function private.handle_new_auth_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare requested_username text := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
begin
  if requested_username is not null and requested_username !~ '^[A-Za-z0-9_]{3,32}$' then raise exception 'INVALID_USERNAME' using errcode = '22023'; end if;
  insert into public.profiles(id, display_name, username) values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'NoBogey user'), requested_username);
  if new.raw_user_meta_data ? 'legal_accepted_at' then
    insert into public.legal_acceptances(user_id, document_kind, document_version, accepted_at) values
      (new.id, 'terms', coalesce(new.raw_user_meta_data ->> 'terms_version', 'unknown'), (new.raw_user_meta_data ->> 'legal_accepted_at')::timestamptz),
      (new.id, 'privacy', coalesce(new.raw_user_meta_data ->> 'privacy_version', 'unknown'), (new.raw_user_meta_data ->> 'legal_accepted_at')::timestamptz);
  end if; return new;
end; $$;

drop trigger if exists bookings_enqueue_notifications on public.bookings;
create trigger bookings_enqueue_notifications_after_confirmation after update of status on public.bookings
for each row when (new.status = 'confirmed' and old.status is distinct from new.status)
execute function private.enqueue_booking_notifications();

insert into public.tee_times(course_id, starts_at, ends_at, player_capacity, source)
select c.id, d + make_interval(hours => h), d + make_interval(hours => h + 5), 4, 'initial-club-schedule'
from public.courses c cross join generate_series(
  date_trunc('day', now() at time zone 'Asia/Manila') + interval '1 day',
  date_trunc('day', now() at time zone 'Asia/Manila') + interval '30 days', interval '1 day') d
cross join unnest(array[7,9,11,13]) h where c.is_active
on conflict (course_id, starts_at) do nothing;
