create table if not exists public.caddie_compliance_events (
  id uuid primary key default gen_random_uuid(),
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  reported_by uuid not null references public.profiles(id),
  reason text not null check (char_length(trim(reason)) between 3 and 1000),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check ((resolved_at is null) = (resolved_by is null))
);
create index if not exists caddie_compliance_open_idx on public.caddie_compliance_events(caddie_id, created_at desc) where resolved_at is null;
alter table public.caddie_compliance_events enable row level security;
grant select on public.caddie_compliance_events to authenticated;
create policy caddie_compliance_admin_read on public.caddie_compliance_events for select to authenticated
  using (private.is_platform_admin((select auth.uid())));

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
  if coalesce(p_draft->>'homeCourseId','') ~* '^[0-9a-f-]{36}$' then
    course_id := (p_draft->>'homeCourseId')::uuid;
    select c.club_id into target_club_id from public.courses c where c.id = course_id and c.is_active;
  else
    select c.id,c.club_id into course_id,target_club_id from public.courses c
    where c.is_active and trim(both '-' from regexp_replace(lower(c.name),'[^a-z0-9]+','-','g')) = p_draft->>'homeCourseId' limit 1;
  end if;
  if target_club_id is null then raise exception 'ACTIVE_HOME_COURSE_REQUIRED' using errcode = '22023'; end if;
  experience := case p_draft->>'yearsExperience' when 'less_than_one' then 0 when 'one_to_two' then 1 when 'three_to_five' then 3 when 'six_to_ten' then 6 when 'ten_plus' then 10 else 0 end;

  update public.profiles set display_name = left(coalesce(nullif(trim(p_draft->>'fullName'), ''), display_name), 120), updated_at = now() where id = actor;
  insert into public.caddie_profiles(user_id, tagline, bio, years_experience, verification_status)
  values (actor, left(p_draft->>'tagline', 80), left(p_draft->>'bio', 1000), experience, 'pending')
  on conflict (user_id) do update set tagline=excluded.tagline, bio=excluded.bio, years_experience=excluded.years_experience,
    verification_status='pending', updated_at=now();
  insert into public.caddie_club_assignments(caddie_id, club_id, registry_number, verification_status, is_primary)
  values (actor, target_club_id, nullif(trim(p_draft->>'registryNumber'), ''), 'pending', true)
  on conflict (caddie_id, club_id) do update set registry_number=excluded.registry_number, verification_status='pending', is_primary=true, updated_at=now();
  update public.caddie_club_assignments set is_primary=false, updated_at=now() where caddie_id=actor and club_id<>target_club_id and is_primary;
  insert into public.caddie_onboarding_drafts(user_id, draft, submitted_at, updated_at)
  values (actor, p_draft - 'password', now(), now())
  on conflict (user_id) do update set draft=excluded.draft, submitted_at=excluded.submitted_at, updated_at=now();
end; $$;

create or replace function public.admin_review_caddie(p_caddie_id uuid, p_status public.verification_status, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); target_club uuid;
begin
  if actor is null or not private.is_platform_admin(actor) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  if p_status not in ('verified','changes_requested','rejected') then raise exception 'INVALID_REVIEW_STATUS' using errcode='22023'; end if;
  if p_status <> 'verified' and nullif(trim(p_note),'') is null then raise exception 'REVIEW_NOTE_REQUIRED' using errcode='22023'; end if;
  update public.caddie_profiles set verification_status=p_status,
    onboarding_completed_at=case when p_status='verified' then coalesce(onboarding_completed_at,now()) else onboarding_completed_at end, updated_at=now()
  where user_id=p_caddie_id;
  if not found then raise exception 'CADDIE_NOT_FOUND' using errcode='P0002'; end if;
  update public.caddie_club_assignments set verification_status=p_status, updated_at=now() where caddie_id=p_caddie_id;
  update public.verification_documents set verification_status=p_status, reviewed_by=actor, reviewed_at=now() where caddie_id=p_caddie_id;
  insert into public.caddie_verification_reviews(caddie_id,reviewer_id,status,reviewer_note) values(p_caddie_id,actor,p_status,nullif(trim(p_note),''));
  if p_status='verified' then
    select club_id into target_club from public.caddie_club_assignments where caddie_id=p_caddie_id and is_primary limit 1;
    if target_club is not null and not exists(select 1 from public.caddie_availability where caddie_id=p_caddie_id and ends_at>now() and is_available) then
      insert into public.caddie_availability(caddie_id,club_id,starts_at,ends_at,is_available) values(p_caddie_id,target_club,date_trunc('day',now()),date_trunc('day',now())+interval '1 year',true);
    end if;
  end if;
end; $$;

create or replace function public.admin_set_caddie_active(p_caddie_id uuid, p_active boolean) returns void
language plpgsql security definer set search_path='' as $$ begin
  if auth.uid() is null or not private.is_platform_admin(auth.uid()) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  update public.profiles set is_active=p_active,updated_at=now() where id=p_caddie_id and exists(select 1 from public.caddie_profiles where user_id=p_caddie_id);
end; $$;

create or replace function public.admin_report_caddie(p_caddie_id uuid, p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$ declare event_id uuid; open_count int; begin
  if auth.uid() is null or not private.is_platform_admin(auth.uid()) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  insert into public.caddie_compliance_events(caddie_id,reported_by,reason) values(p_caddie_id,auth.uid(),trim(p_reason)) returning id into event_id;
  select count(*) into open_count from public.caddie_compliance_events where caddie_id=p_caddie_id and resolved_at is null;
  if open_count>=3 then update public.profiles set is_active=false,updated_at=now() where id=p_caddie_id; end if;
  return event_id;
end; $$;

create or replace function public.admin_resolve_caddie_report(p_caddie_id uuid) returns void
language plpgsql security definer set search_path='' as $$ begin
  if auth.uid() is null or not private.is_platform_admin(auth.uid()) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  update public.caddie_compliance_events set resolved_at=now(),resolved_by=auth.uid() where id=(select id from public.caddie_compliance_events where caddie_id=p_caddie_id and resolved_at is null order by created_at desc limit 1);
end; $$;

drop policy if exists verification_documents_owner_insert on public.verification_documents;
create policy verification_documents_owner_insert on public.verification_documents for insert to authenticated with check (
  caddie_id=(select auth.uid()) and verification_status='pending' and reviewed_by is null and reviewed_at is null
  and exists(select 1 from public.caddie_club_assignments a where a.caddie_id=(select auth.uid()) and a.club_id=verification_documents.club_id));

grant execute on function public.submit_caddie_onboarding(jsonb) to authenticated;
grant execute on function public.admin_review_caddie(uuid,public.verification_status,text) to authenticated;
grant execute on function public.admin_set_caddie_active(uuid,boolean) to authenticated;
grant execute on function public.admin_report_caddie(uuid,text) to authenticated;
grant execute on function public.admin_resolve_caddie_report(uuid) to authenticated;
revoke all on function public.submit_caddie_onboarding(jsonb), public.admin_review_caddie(uuid,public.verification_status,text), public.admin_set_caddie_active(uuid,boolean), public.admin_report_caddie(uuid,text), public.admin_resolve_caddie_report(uuid) from public, anon;
