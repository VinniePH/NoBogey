create table public.caddie_onboarding_drafts (
  user_id uuid primary key references public.caddie_profiles(user_id) on delete cascade,
  draft jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.caddie_onboarding_drafts enable row level security;
alter table public.user_preferences enable row level security;
grant select, insert, update on public.caddie_onboarding_drafts, public.user_preferences to authenticated;
create policy onboarding_owner_all on public.caddie_onboarding_drafts for all to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())))
  with check (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())));
create policy preferences_owner_all on public.user_preferences for all to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())))
  with check (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())));
