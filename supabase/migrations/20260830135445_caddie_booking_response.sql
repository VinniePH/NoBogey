create or replace function public.respond_to_booking(p_booking_id uuid, p_accept boolean)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_booking public.bookings;
  next_status public.booking_status := case when p_accept then 'confirmed' else 'declined' end;
begin
  select * into current_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if caller is null or current_booking.caddie_id <> caller then
    raise exception 'PERMISSION_DENIED' using errcode = '42501';
  end if;
  if current_booking.status <> 'pending' then
    raise exception 'INVALID_BOOKING_STATUS' using errcode = '22023';
  end if;

  update public.bookings
  set status = next_status,
      confirmed_at = case when p_accept then now() else confirmed_at end
  where id = p_booking_id
  returning * into current_booking;

  insert into public.booking_status_history(booking_id, from_status, to_status, changed_by)
  values (p_booking_id, 'pending', next_status, caller);

  insert into public.notifications(user_id, kind, title, body, data)
  values (
    current_booking.golfer_id,
    case when p_accept then 'booking_confirmed' else 'booking_declined' end,
    case when p_accept then 'Your caddie confirmed the booking' else 'Your caddie declined the booking' end,
    case when p_accept then 'Your requested caddie accepted the assignment.' else 'Choose another available caddie for this tee time.' end,
    jsonb_build_object(
      'booking_id', p_booking_id,
      'deep_link', 'https://nobogeyofficial.com/golfer/bookings/' || p_booking_id::text
    )
  );

  return current_booking;
end;
$$;

revoke all on function public.respond_to_booking(uuid, boolean) from public, anon;
grant execute on function public.respond_to_booking(uuid, boolean) to authenticated;
