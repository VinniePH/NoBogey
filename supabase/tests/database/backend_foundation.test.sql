begin;

create extension if not exists pgtap with schema extensions;
select plan(35);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'user_roles', 'role assignments exist');
select has_table('public', 'caddie_availability', 'availability exists');
select has_table('public', 'bookings', 'bookings exist');
select has_table('public', 'payment_intents', 'payment intents exist');
select has_table('private', 'financial_ledger', 'private ledger exists');
select has_table('private', 'payment_callback_events', 'private callbacks exist');
select has_table('private', 'notification_outbox', 'private notification outbox exists');
select has_column('public', 'profiles', 'username', 'profiles have usernames');
select has_function('public', 'create_booking', array['uuid','uuid','timestamp with time zone','timestamp with time zone','smallint','text'], 'booking RPC exists');
select has_function('private', 'process_verified_payment_event', array['text','text','text','text','bigint'], 'payment callback transition exists');
select has_function('private', 'complete_booking', array['uuid'], 'completion transition exists');
select has_function('public', 'complete_signup', array['app_role'], 'signup completion RPC exists');
select has_function('public', 'respond_to_booking', array['uuid','boolean'], 'caddie response RPC exists');

select ok((select relrowsecurity from pg_class where oid = 'public.bookings'::regclass), 'bookings has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.payment_intents'::regclass), 'payment intents have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.verification_documents'::regclass), 'verification metadata has RLS');
select ok(not has_table_privilege('anon', 'public.bookings', 'SELECT'), 'anonymous users cannot read bookings');
select ok(not has_table_privilege('authenticated', 'private.financial_ledger', 'SELECT'), 'clients cannot read the private ledger');
select ok((select relrowsecurity from pg_class where oid = 'private.financial_ledger'::regclass), 'private ledger has defense-in-depth RLS');
select ok((select relrowsecurity from pg_class where oid = 'private.payment_callback_events'::regclass), 'private callbacks have defense-in-depth RLS');
select ok((select relrowsecurity from pg_class where oid = 'private.audit_logs'::regclass), 'private audit logs have defense-in-depth RLS');
select ok((select relrowsecurity from pg_class where oid = 'private.notification_outbox'::regclass), 'private notification outbox has defense-in-depth RLS');
select ok(has_table_privilege('anon', 'public.courses', 'SELECT'), 'anonymous users can browse active courses through RLS');
select ok(not has_function_privilege('authenticated', 'private.process_verified_payment_event(text,text,text,text,bigint)', 'EXECUTE'), 'clients cannot invoke payment callbacks');
select ok(has_function_privilege('service_role', 'private.process_verified_payment_event(text,text,text,text,bigint)', 'EXECUTE'), 'service role can invoke payment callbacks');
select ok(exists(select 1 from storage.buckets where id = 'verification-documents' and not public), 'verification bucket is private');

insert into auth.users(id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'golfer@example.test', '', now(), '{}', '{"display_name":"Test golfer"}'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'caddie@example.test', '', now(), '{}', '{"display_name":"Test caddie"}');
insert into public.user_roles(user_id, role) values
  ('10000000-0000-0000-0000-000000000001', 'golfer'),
  ('10000000-0000-0000-0000-000000000002', 'caddie');
insert into public.golfer_profiles(user_id) values ('10000000-0000-0000-0000-000000000001');
insert into public.caddie_profiles(user_id, verification_status, rate_amount_in_centavos)
values ('10000000-0000-0000-0000-000000000002', 'verified', 150000);
insert into public.golf_clubs(id, name, city, region) values ('20000000-0000-0000-0000-000000000001', 'Test Club', 'Manila', 'NCR');
insert into public.courses(id, club_id, name) values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Test Course');
insert into public.caddie_club_assignments(caddie_id, club_id, verification_status, is_primary)
values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'verified', true);
insert into public.caddie_availability(caddie_id, club_id, starts_at, ends_at)
values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', now() + interval '1 day', now() + interval '1 day 8 hours');

select throws_ok(
  $$insert into public.caddie_availability(caddie_id, club_id, starts_at, ends_at)
    values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', now() + interval '1 day 1 hour', now() + interval '1 day 2 hours')$$,
  '23P01', null, 'overlapping availability is rejected'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.create_booking(
    '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
    now() + interval '1 day 2 hours', now() + interval '1 day 6 hours', 4::smallint, 'booking-one')$$,
  'first booking succeeds'
);
select throws_ok(
  $$select public.create_booking(
    '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
    now() + interval '1 day 3 hours', now() + interval '1 day 5 hours', 2::smallint, 'booking-two')$$,
  '23P01', 'BOOKING_CONFLICT', 'overlapping booking is rejected atomically'
);
select is((select count(*) from public.bookings where golfer_id = '10000000-0000-0000-0000-000000000001'), 1::bigint, 'only one active booking persists');
reset role;
select is((select count(*) from private.notification_outbox where booking_id = (select id from public.bookings limit 1)), 2::bigint, 'booking queues golfer and caddie receipt emails');

update public.payment_intents set provider_reference = 'provider-payment-1' where booking_id = (select id from public.bookings limit 1);
set local role service_role;
select lives_ok(
  $$select private.process_verified_payment_event('gcash', 'event-1', 'provider-payment-1', repeat('a', 64), 150000)$$,
  'verified payment callback confirms booking'
);
select lives_ok(
  $$select private.process_verified_payment_event('gcash', 'event-1', 'provider-payment-1', repeat('a', 64), 150000)$$,
  'duplicate payment callback is idempotent'
);
reset role;
select is((select count(*) from private.financial_ledger where entry_type = 'payment_captured'), 1::bigint, 'duplicate callback creates one capture ledger entry');

select * from finish();
rollback;
