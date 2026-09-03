create or replace function public.admin_enroll_existing_caddie(
  p_email text,
  p_display_name text,
  p_tier text,
  p_rate_amount_in_centavos bigint,
  p_years_experience smallint,
  p_club_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  target_user uuid;
  target_club uuid;
begin
  if caller is null or not private.is_platform_admin(caller) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;
  if nullif(trim(p_email), '') is null or nullif(trim(p_display_name), '') is null then
    raise exception 'EMAIL_AND_NAME_REQUIRED' using errcode = '22023';
  end if;
  if p_rate_amount_in_centavos < 0 or p_years_experience not between 0 and 80 then
    raise exception 'INVALID_CADDIE_DETAILS' using errcode = '22023';
  end if;

  select id into target_user from auth.users where lower(email) = lower(trim(p_email));
  if target_user is null then
    raise exception 'CADDIE_ACCOUNT_NOT_FOUND' using errcode = 'P0002',
      hint = 'The caddie must create a NoBogey account before an administrator can enroll it.';
  end if;

  if p_club_id is null then
    select id into target_club from public.golf_clubs where is_active order by created_at limit 1;
  else
    select id into target_club from public.golf_clubs where id = p_club_id and is_active;
  end if;
  if target_club is null then
    raise exception 'ACTIVE_CLUB_NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.profiles(id, display_name, is_active)
  values (target_user, trim(p_display_name), true)
  on conflict (id) do update set display_name = excluded.display_name, is_active = true, updated_at = now();

  insert into public.user_roles(user_id, role) values (target_user, 'caddie') on conflict do nothing;
  insert into public.caddie_profiles(user_id, tagline, years_experience, rate_amount_in_centavos, verification_status, onboarding_completed_at)
  values (target_user, upper(trim(p_tier)), p_years_experience, p_rate_amount_in_centavos, 'verified', now())
  on conflict (user_id) do update set
    tagline = excluded.tagline,
    years_experience = excluded.years_experience,
    rate_amount_in_centavos = excluded.rate_amount_in_centavos,
    verification_status = 'verified',
    onboarding_completed_at = coalesce(public.caddie_profiles.onboarding_completed_at, now()),
    updated_at = now();

  insert into public.caddie_club_assignments(caddie_id, club_id, registry_number, verification_status, is_primary)
  values (target_user, target_club, 'NB-' || upper(substr(replace(target_user::text, '-', ''), 1, 10)), 'verified',
    not exists (select 1 from public.caddie_club_assignments where caddie_id = target_user and is_primary))
  on conflict (caddie_id, club_id) do update set verification_status = 'verified', updated_at = now();

  if not exists (select 1 from public.caddie_availability where caddie_id = target_user and ends_at > now() and is_available) then
    insert into public.caddie_availability(caddie_id, club_id, starts_at, ends_at, is_available)
    values (target_user, target_club, date_trunc('day', now()), date_trunc('day', now()) + interval '1 year', true);
  end if;

  return target_user;
end;
$$;

grant execute on function public.admin_enroll_existing_caddie(text, text, text, bigint, smallint, uuid) to authenticated;
revoke all on function public.admin_enroll_existing_caddie(text, text, text, bigint, smallint, uuid) from public, anon;

create index if not exists admin_portal_state_updated_by_idx on public.admin_portal_state(updated_by);
create index if not exists caddie_verification_reviews_caddie_id_idx on public.caddie_verification_reviews(caddie_id);
create index if not exists caddie_verification_reviews_reviewer_id_idx on public.caddie_verification_reviews(reviewer_id);
create index if not exists support_requests_user_id_idx on public.support_requests(user_id);
