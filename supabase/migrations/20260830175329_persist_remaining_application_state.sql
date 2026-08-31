create table public.admin_portal_state (
  id text primary key default 'primary' check (id = 'primary'),
  state jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
alter table public.admin_portal_state enable row level security;
grant select, insert, update on public.admin_portal_state to authenticated;
create policy admin_portal_state_admin_all on public.admin_portal_state for all to authenticated
  using (private.is_platform_admin((select auth.uid())))
  with check (private.is_platform_admin((select auth.uid())));

create table public.caddie_verification_reviews (
  id uuid primary key default gen_random_uuid(),
  caddie_id uuid not null references public.caddie_profiles(user_id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  status public.verification_status not null,
  reviewer_note text check (char_length(reviewer_note) <= 4000),
  created_at timestamptz not null default now()
);
alter table public.caddie_verification_reviews enable row level security;
grant select, insert on public.caddie_verification_reviews to authenticated;
create policy verification_reviews_participant_read on public.caddie_verification_reviews for select to authenticated
  using (caddie_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())));
create policy verification_reviews_admin_insert on public.caddie_verification_reviews for insert to authenticated
  with check (private.is_platform_admin((select auth.uid())) and reviewer_id = (select auth.uid()));
create policy caddie_profiles_admin_verify on public.caddie_profiles for update to authenticated
  using (private.is_platform_admin((select auth.uid()))) with check (private.is_platform_admin((select auth.uid())));

create table public.support_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.support_requests enable row level security;
grant select, insert on public.support_requests to authenticated;
create policy support_owner_read on public.support_requests for select to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_admin((select auth.uid())));
create policy support_owner_insert on public.support_requests for insert to authenticated with check (user_id = (select auth.uid()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('caddie-verification', 'caddie-verification', false, 10485760, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy caddie_documents_owner_read on storage.objects for select to authenticated
  using (bucket_id = 'caddie-verification' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_platform_admin((select auth.uid()))));
create policy caddie_documents_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'caddie-verification' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy caddie_documents_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'caddie-verification' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'caddie-verification' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy caddie_documents_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'caddie-verification' and (storage.foldername(name))[1] = (select auth.uid())::text);
