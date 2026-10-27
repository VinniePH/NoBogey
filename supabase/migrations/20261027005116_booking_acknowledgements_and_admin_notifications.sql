-- Persist participant acknowledgements and course-scoped administrator CRM events.

create table public.booking_acknowledgements (
  booking_id uuid not null references public.bookings(id) on delete restrict,
  step text not null check (step in ('meetup', 'payment')),
  participant_id uuid not null references public.profiles(id) on delete restrict,
  participant_role text not null check (participant_role in ('golfer', 'caddie')),
  confirmed_at timestamptz not null default now(),
  primary key (booking_id, step, participant_id),
  unique (booking_id, step, participant_role)
);

create index booking_acknowledgements_participant_idx
  on public.booking_acknowledgements(participant_id, confirmed_at desc);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete restrict,
  event_key text not null unique check (char_length(event_key) between 8 and 240),
  category text not null check (char_length(category) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 1000),
  destination_path text not null check (destination_path ~ '^/admin(?:/[-a-z0-9]+)*$'),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_notifications_course_created_idx
  on public.admin_notifications(course_id, created_at desc);

create table public.admin_notification_reads (
  notification_id uuid not null references public.admin_notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create index admin_notification_reads_user_idx
  on public.admin_notification_reads(user_id, read_at desc);

revoke all on public.booking_acknowledgements, public.admin_notifications, public.admin_notification_reads
  from public, anon, authenticated;

alter table public.booking_acknowledgements enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_notification_reads enable row level security;

create policy booking_acknowledgements_participant_select
on public.booking_acknowledgements for select to authenticated
using (
  exists (
    select 1
    from public.bookings b
    where b.id = booking_acknowledgements.booking_id
      and ((select auth.uid()) = b.golfer_id or (select auth.uid()) = b.caddie_id)
  )
);

create policy admin_notifications_authorized_select
on public.admin_notifications for select to authenticated
using (
  exists (
    select 1
    from public.courses c
    where c.id = admin_notifications.course_id
      and private.manages_club(c.club_id, (select auth.uid()))
  )
);

create policy admin_notification_reads_owner_select
on public.admin_notification_reads for select to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.admin_notifications n
    join public.courses c on c.id = n.course_id
    where n.id = admin_notification_reads.notification_id
      and private.manages_club(c.club_id, (select auth.uid()))
  )
);

create policy admin_notification_reads_owner_insert
on public.admin_notification_reads for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.admin_notifications n
    join public.courses c on c.id = n.course_id
    where n.id = admin_notification_reads.notification_id
      and private.manages_club(c.club_id, (select auth.uid()))
  )
);

grant select on public.booking_acknowledgements, public.admin_notifications, public.admin_notification_reads
  to authenticated;
grant insert(notification_id, user_id) on public.admin_notification_reads to authenticated;

create or replace function public.list_my_booking_acknowledgements()
returns table (
  booking_id uuid,
  step text,
  participant_id uuid,
  participant_role text,
  confirmed_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select a.booking_id, a.step, a.participant_id, a.participant_role, a.confirmed_at
  from public.booking_acknowledgements a
  join public.bookings b on b.id = a.booking_id
  where b.golfer_id = (select auth.uid()) or b.caddie_id = (select auth.uid())
  order by a.confirmed_at, a.booking_id, a.step, a.participant_role;
$$;

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

  insert into public.booking_acknowledgements(booking_id, step, participant_id, participant_role)
  values (p_booking_id, p_step, caller, caller_role)
  on conflict (booking_id, step, participant_id) do nothing;

  return query
  select a.booking_id, a.step, a.participant_id, a.participant_role, a.confirmed_at
  from public.booking_acknowledgements a
  where a.booking_id = p_booking_id
  order by a.confirmed_at, a.step, a.participant_role;
end;
$$;

create or replace function public.list_admin_notifications(
  p_unread_only boolean default false,
  p_limit integer default 100
)
returns table (
  id uuid,
  course_id uuid,
  booking_id uuid,
  category text,
  title text,
  description text,
  destination_path text,
  data jsonb,
  created_at timestamptz,
  read_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select n.id, n.course_id, n.booking_id, n.category, n.title, n.body,
    n.destination_path, n.data, n.created_at, r.read_at
  from public.admin_notifications n
  left join public.admin_notification_reads r
    on r.notification_id = n.id and r.user_id = (select auth.uid())
  where not coalesce(p_unread_only, false) or r.notification_id is null
  order by n.created_at desc, n.id
  limit greatest(1, least(coalesce(p_limit, 100), 200));
$$;

create or replace function public.get_admin_notification_counts()
returns table (total_count bigint, unread_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)::bigint,
    count(*) filter (where r.notification_id is null)::bigint
  from public.admin_notifications n
  left join public.admin_notification_reads r
    on r.notification_id = n.id and r.user_id = (select auth.uid());
$$;

create or replace function public.mark_admin_notification_read(p_notification_id uuid)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  result timestamptz;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if not exists (select 1 from public.admin_notifications n where n.id = p_notification_id) then
    raise exception 'NOTIFICATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  insert into public.admin_notification_reads(notification_id, user_id)
  values (p_notification_id, caller)
  on conflict (notification_id, user_id) do nothing;
  select r.read_at into result
  from public.admin_notification_reads r
  where r.notification_id = p_notification_id and r.user_id = caller;
  return result;
end;
$$;

create or replace function public.mark_all_admin_notifications_read(p_course_id uuid default null)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  affected integer;
begin
  if caller is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  insert into public.admin_notification_reads(notification_id, user_id)
  select n.id, caller
  from public.admin_notifications n
  where p_course_id is null or n.course_id = p_course_id
  on conflict (notification_id, user_id) do nothing;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function private.create_admin_notification_from_booking_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target record;
begin
  select b.course_id, b.id as booking_id into target
  from public.bookings b
  where b.id = new.booking_id;
  if not found or new.event_kind not in (
    'booking.requested', 'booking.confirmed', 'booking.declined', 'booking.expired',
    'booking.cancelled', 'booking.in_progress', 'booking.completed'
  ) then
    return new;
  end if;

  insert into public.admin_notifications(
    course_id, booking_id, event_key, category, title, body, destination_path, data, created_at
  ) values (
    target.course_id,
    target.booking_id,
    'booking-event:' || new.id::text,
    'Booking',
    case new.event_kind
      when 'booking.requested' then 'New booking request'
      when 'booking.confirmed' then 'Booking confirmed'
      when 'booking.declined' then 'Booking declined'
      when 'booking.expired' then 'Booking request expired'
      when 'booking.cancelled' then 'Booking cancelled'
      when 'booking.in_progress' then 'Round started'
      else 'Round completed'
    end,
    case new.event_kind
      when 'booking.requested' then 'A golfer submitted a caddie booking request.'
      when 'booking.confirmed' then 'The assigned caddie accepted the booking.'
      when 'booking.declined' then 'The assigned caddie declined the booking.'
      when 'booking.expired' then 'The booking request expired before acceptance.'
      when 'booking.cancelled' then 'A participant cancelled the booking.'
      when 'booking.in_progress' then 'The confirmed round moved into progress.'
      else 'The round was marked complete.'
    end,
    '/admin/assignments',
    jsonb_build_object('booking_id', target.booking_id, 'event_kind', new.event_kind),
    new.created_at
  ) on conflict (event_key) do nothing;
  return new;
end;
$$;

create trigger create_admin_notification_from_booking_event
after insert on private.booking_events
for each row execute function private.create_admin_notification_from_booking_event();

create or replace function private.create_admin_notification_from_acknowledgement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_course uuid;
begin
  select b.course_id into target_course
  from public.bookings b
  where b.id = new.booking_id;

  insert into public.admin_notifications(
    course_id, booking_id, event_key, category, title, body, destination_path, data, created_at
  ) values (
    target_course,
    new.booking_id,
    'booking-acknowledgement:' || new.booking_id::text || ':' || new.step || ':' || new.participant_role,
    case new.step when 'meetup' then 'Meetup' else 'Payment' end,
    initcap(new.participant_role) || case new.step when 'meetup' then ' confirmed meetup' else ' acknowledged payment' end,
    case new.step
      when 'meetup' then 'A booking participant confirmed meeting at the course.'
      else 'A booking participant recorded the payment acknowledgement.'
    end,
    '/admin/assignments',
    jsonb_build_object(
      'booking_id', new.booking_id,
      'step', new.step,
      'participant_id', new.participant_id,
      'participant_role', new.participant_role
    ),
    new.confirmed_at
  ) on conflict (event_key) do nothing;
  return new;
end;
$$;

create trigger create_admin_notification_from_acknowledgement
after insert on public.booking_acknowledgements
for each row execute function private.create_admin_notification_from_acknowledgement();

-- Make already-recorded booking lifecycle events visible in the CRM exactly once.
insert into public.admin_notifications(
  course_id, booking_id, event_key, category, title, body, destination_path, data, created_at
)
select b.course_id, b.id, 'booking-event:' || e.id::text, 'Booking',
  case e.event_kind
    when 'booking.requested' then 'New booking request'
    when 'booking.confirmed' then 'Booking confirmed'
    when 'booking.declined' then 'Booking declined'
    when 'booking.expired' then 'Booking request expired'
    when 'booking.cancelled' then 'Booking cancelled'
    when 'booking.in_progress' then 'Round started'
    else 'Round completed'
  end,
  case e.event_kind
    when 'booking.requested' then 'A golfer submitted a caddie booking request.'
    when 'booking.confirmed' then 'The assigned caddie accepted the booking.'
    when 'booking.declined' then 'The assigned caddie declined the booking.'
    when 'booking.expired' then 'The booking request expired before acceptance.'
    when 'booking.cancelled' then 'A participant cancelled the booking.'
    when 'booking.in_progress' then 'The confirmed round moved into progress.'
    else 'The round was marked complete.'
  end,
  '/admin/assignments',
  jsonb_build_object('booking_id', b.id, 'event_kind', e.event_kind),
  e.created_at
from private.booking_events e
join public.bookings b on b.id = e.booking_id
where e.event_kind in (
  'booking.requested', 'booking.confirmed', 'booking.declined', 'booking.expired',
  'booking.cancelled', 'booking.in_progress', 'booking.completed'
)
on conflict (event_key) do nothing;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array[
      'booking_acknowledgements', 'admin_notifications', 'admin_notification_reads'
    ] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end;
$$;

revoke all on function public.list_my_booking_acknowledgements() from public, anon;
revoke all on function public.confirm_booking_acknowledgement(uuid, text) from public, anon;
revoke all on function public.list_admin_notifications(boolean, integer) from public, anon;
revoke all on function public.get_admin_notification_counts() from public, anon;
revoke all on function public.mark_admin_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_admin_notifications_read(uuid) from public, anon;
grant execute on function public.list_my_booking_acknowledgements() to authenticated;
grant execute on function public.confirm_booking_acknowledgement(uuid, text) to authenticated;
grant execute on function public.list_admin_notifications(boolean, integer) to authenticated;
grant execute on function public.get_admin_notification_counts() to authenticated;
grant execute on function public.mark_admin_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_admin_notifications_read(uuid) to authenticated;

revoke all on function private.create_admin_notification_from_booking_event() from public, anon, authenticated;
revoke all on function private.create_admin_notification_from_acknowledgement() from public, anon, authenticated;
