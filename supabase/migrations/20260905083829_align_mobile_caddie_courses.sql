insert into public.golf_clubs(id, name, city, region)
values ('10000000-0000-4000-8000-000000000004', 'Tagaytay Highlands International Golf Club', 'Tagaytay', 'Cavite')
on conflict (id) do update set name=excluded.name, city=excluded.city, region=excluded.region, is_active=true, updated_at=now();

insert into public.courses(id, club_id, name)
values ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', 'Tagaytay Highlands Course')
on conflict (id) do update set club_id=excluded.club_id, name=excluded.name, is_active=true, updated_at=now();

create or replace function public.submit_caddie_onboarding(p_draft jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  course_id uuid;
  target_club_id uuid;
  experience smallint;
begin
  if actor is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if not private.has_role('caddie') then raise exception 'CADDIE_ROLE_REQUIRED' using errcode = '42501'; end if;

  course_id := case p_draft->>'homeCourseId'
    when 'manila-golf-country-club' then '20000000-0000-4000-8000-000000000001'::uuid
    when 'wack-wack-golf-country-club' then '20000000-0000-4000-8000-000000000002'::uuid
    when 'tagaytay-highlands' then '20000000-0000-4000-8000-000000000005'::uuid
    else null
  end;
  if course_id is null and coalesce(p_draft->>'homeCourseId','') ~* '^[0-9a-f-]{36}$' then
    course_id := (p_draft->>'homeCourseId')::uuid;
  end if;
  select c.club_id into target_club_id from public.courses c where c.id=course_id and c.is_active;
  if target_club_id is null then raise exception 'ACTIVE_HOME_COURSE_REQUIRED' using errcode = '22023'; end if;

  experience := case p_draft->>'yearsExperience' when 'less_than_one' then 0 when 'one_to_two' then 1 when 'three_to_five' then 3 when 'six_to_ten' then 6 when 'ten_plus' then 10 else 0 end;
  update public.profiles set display_name=left(coalesce(nullif(trim(p_draft->>'fullName'),''),display_name),120), updated_at=now() where id=actor;
  insert into public.caddie_profiles(user_id,tagline,bio,years_experience,verification_status)
  values(actor,left(p_draft->>'tagline',80),left(p_draft->>'bio',1000),experience,'pending')
  on conflict(user_id) do update set tagline=excluded.tagline,bio=excluded.bio,years_experience=excluded.years_experience,verification_status='pending',updated_at=now();
  insert into public.caddie_club_assignments(caddie_id,club_id,registry_number,verification_status,is_primary)
  values(actor,target_club_id,nullif(trim(p_draft->>'registryNumber'),''),'pending',true)
  on conflict(caddie_id,club_id) do update set registry_number=excluded.registry_number,verification_status='pending',is_primary=true,updated_at=now();
  update public.caddie_club_assignments set is_primary=false,updated_at=now() where caddie_id=actor and club_id<>target_club_id and is_primary;
  insert into public.caddie_onboarding_drafts(user_id,draft,submitted_at,updated_at)
  values(actor,p_draft-'password',now(),now())
  on conflict(user_id) do update set draft=excluded.draft,submitted_at=excluded.submitted_at,updated_at=now();
end; $$;

revoke all on function public.submit_caddie_onboarding(jsonb) from public, anon;
grant execute on function public.submit_caddie_onboarding(jsonb) to authenticated;
