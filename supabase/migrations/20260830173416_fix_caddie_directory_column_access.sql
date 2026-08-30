grant select (id, display_name) on public.profiles to anon;
create policy verified_caddie_names_anon_read on public.profiles for select to anon using (
  exists (select 1 from public.caddie_profiles cp where cp.user_id = profiles.id and cp.verification_status = 'verified')
);
