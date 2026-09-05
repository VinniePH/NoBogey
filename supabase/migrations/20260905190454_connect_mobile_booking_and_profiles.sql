alter table public.bookings
  add column if not exists tee_time_id uuid references public.tee_times(id) on delete restrict;

create unique index if not exists bookings_active_tee_time_idx
  on public.bookings(tee_time_id)
  where tee_time_id is not null and status in ('pending', 'confirmed', 'in_progress');

create or replace function public.list_bookable_tee_times(p_course_id uuid, p_day date)
returns table(id uuid, course_id uuid, starts_at timestamptz, ends_at timestamptz, player_capacity smallint, remaining_caddie_capacity bigint, status text, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select t.id, t.course_id, t.starts_at, t.ends_at, t.player_capacity,
    (select count(*) from public.caddie_availability a
      join public.caddie_profiles cp on cp.user_id=a.caddie_id and cp.verification_status='verified'
      join public.caddie_club_assignments ca on ca.caddie_id=a.caddie_id and ca.club_id=a.club_id and ca.verification_status='verified'
      join public.profiles p on p.id=a.caddie_id and p.is_active
      join public.courses c on c.id=t.course_id and c.club_id=a.club_id
      where a.is_available and tstzrange(a.starts_at,a.ends_at,'[)') @> tstzrange(t.starts_at,t.ends_at,'[)')
      and not exists(select 1 from public.bookings b where b.caddie_id=a.caddie_id and b.status in ('pending','confirmed','in_progress') and tstzrange(b.starts_at,b.ends_at,'[)') && tstzrange(t.starts_at,t.ends_at,'[)'))
    ) as remaining_caddie_capacity,
    t.status, t.updated_at
  from public.tee_times t
  where t.course_id=p_course_id and t.status='open'
    and (t.starts_at at time zone 'Asia/Manila')::date=p_day
    and t.starts_at>now()
    and not exists(select 1 from public.bookings b where b.tee_time_id=t.id and b.status in ('pending','confirmed','in_progress'))
  order by t.starts_at;
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
  quoted bigint;
  result public.bookings;
begin
  if caller is null or not private.has_role('golfer',caller) then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  select * into result from public.bookings where golfer_id=caller and idempotency_key=p_idempotency_key;
  if found then return result; end if;
  select * into slot from public.tee_times where id=p_tee_time_id for update;
  if not found or slot.status<>'open' or slot.starts_at<=now() or p_party_size not between 1 and slot.player_capacity then
    raise exception 'TEE_TIME_UNAVAILABLE' using errcode='22023';
  end if;
  if exists(select 1 from public.bookings b where b.tee_time_id=slot.id and b.status in ('pending','confirmed','in_progress')) then
    raise exception 'TEE_TIME_UNAVAILABLE' using errcode='23P01';
  end if;
  if not exists(
    select 1 from public.caddie_availability a
    join public.courses c on c.club_id=a.club_id
    join public.caddie_club_assignments ca on ca.caddie_id=a.caddie_id and ca.club_id=a.club_id
    join public.caddie_profiles cp on cp.user_id=a.caddie_id
    join public.profiles p on p.id=a.caddie_id
    where a.caddie_id=p_caddie_id and c.id=slot.course_id and a.is_available and p.is_active
      and ca.verification_status='verified' and cp.verification_status='verified'
      and tstzrange(a.starts_at,a.ends_at,'[)') @> tstzrange(slot.starts_at,slot.ends_at,'[)')
      and not exists(select 1 from public.bookings b where b.caddie_id=p_caddie_id and b.status in ('pending','confirmed','in_progress') and tstzrange(b.starts_at,b.ends_at,'[)') && tstzrange(slot.starts_at,slot.ends_at,'[)'))
  ) then raise exception 'CADDIE_UNAVAILABLE' using errcode='23P01'; end if;
  select rate_amount_in_centavos into quoted from public.caddie_profiles where user_id=p_caddie_id;
  insert into public.bookings(golfer_id,caddie_id,course_id,tee_time_id,starts_at,ends_at,party_size,quoted_amount_in_centavos,idempotency_key)
  values(caller,p_caddie_id,slot.course_id,slot.id,slot.starts_at,slot.ends_at,p_party_size,quoted,p_idempotency_key)
  returning * into result;
  insert into public.booking_status_history(booking_id,to_status,changed_by) values(result.id,'pending',caller);
  if result.quoted_amount_in_centavos>0 then
    insert into public.payment_intents(booking_id,provider,amount_in_centavos) values(result.id,'gcash',result.quoted_amount_in_centavos);
  end if;
  return result;
exception when unique_violation or exclusion_violation then
  raise exception 'BOOKING_CONFLICT' using errcode='23P01';
end; $$;

revoke all on function public.list_bookable_tee_times(uuid,date), public.create_mobile_booking(uuid,uuid,smallint,text) from public;
grant execute on function public.list_bookable_tee_times(uuid,date) to anon, authenticated;
grant execute on function public.create_mobile_booking(uuid,uuid,smallint,text) to authenticated;
