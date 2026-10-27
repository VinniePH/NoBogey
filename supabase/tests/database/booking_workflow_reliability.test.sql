begin;

create extension if not exists pgtap with schema extensions;
select plan(48);

select has_table('public', 'booking_policy', 'booking policy is explicit');
select has_table('public', 'caddie_tee_time_availability', 'caddie availability is linked to tee times');
select has_table('private', 'booking_allocations', 'booking allocations are private');
select has_table('private', 'api_idempotency', 'idempotency records are private');
select has_table('private', 'booking_events', 'transactional booking events exist');
select has_column('public', 'bookings', 'expires_at', 'bookings have an expiration timestamp');
select has_column('public', 'tee_times', 'booking_cutoff_at', 'tee times have a booking cutoff');
select has_column('public', 'caddie_club_assignments', 'is_active', 'caddie activity is scoped to a club assignment');
select has_column('public', 'caddie_compliance_events', 'club_id', 'compliance events retain their tenant boundary');
select has_column('public', 'caddie_verification_reviews', 'club_id', 'verification reviews retain their tenant boundary');
select has_function('public', 'list_bookable_tee_times', array['uuid','date','integer','timestamp with time zone'], 'bounded canonical availability RPC exists');
select has_function('public', 'list_available_caddies_for_tee_time', array['uuid','integer'], 'canonical caddie availability RPC exists');
select has_function('public', 'run_booking_maintenance', array['integer'], 'restart-safe expiration entry point exists');
select has_function('public', 'transition_booking', array['uuid','booking_status','text'], 'explicit operational state transition RPC exists');
select has_function('public', 'admin_set_caddie_tee_time_availability', array['uuid','uuid','boolean'], 'admin availability assignment uses an authorized API');
select has_function('public', 'list_verified_caddie_names', array['uuid[]','integer'], 'safe caddie display-name API exists');
select ok(not has_function_privilege('anon', 'public.create_mobile_booking(uuid,uuid,smallint,text)', 'EXECUTE'), 'anonymous users cannot book');
select ok(has_function_privilege('authenticated', 'public.create_mobile_booking(uuid,uuid,smallint,text)', 'EXECUTE'), 'authenticated clients can invoke booking RPC');
select ok(not has_table_privilege('authenticated', 'private.booking_allocations', 'SELECT'), 'clients cannot inspect private allocations');
select ok(not has_table_privilege('authenticated', 'public.caddie_club_assignments', 'UPDATE'), 'assignment mutations require an authorized RPC');

insert into auth.users(id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('71000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'workflow-golfer-1@example.test', '', now(), '{}', '{"display_name":"Workflow golfer one"}'),
  ('71000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'workflow-golfer-2@example.test', '', now(), '{}', '{"display_name":"Workflow golfer two"}'),
  ('71000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'workflow-caddie@example.test', '', now(), '{}', '{"display_name":"Workflow caddie"}'),
  ('71000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'workflow-admin@example.test', '', now(), '{}', '{"display_name":"Workflow admin"}'),
  ('71000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'other-club-admin@example.test', '', now(), '{}', '{"display_name":"Other club admin"}');
insert into public.user_roles(user_id, role) values
  ('71000000-0000-4000-8000-000000000001', 'golfer'),
  ('71000000-0000-4000-8000-000000000002', 'golfer'),
  ('71000000-0000-4000-8000-000000000003', 'caddie'),
  ('71000000-0000-4000-8000-000000000004', 'club_manager'),
  ('71000000-0000-4000-8000-000000000005', 'club_manager');
insert into public.golfer_profiles(user_id) values
  ('71000000-0000-4000-8000-000000000001'), ('71000000-0000-4000-8000-000000000002');
insert into public.caddie_profiles(user_id, verification_status, rate_amount_in_centavos)
values ('71000000-0000-4000-8000-000000000003', 'verified', 150000);
insert into public.golf_clubs(id, name, city, region) values
  ('72000000-0000-4000-8000-000000000001', 'Workflow Test Club', 'Manila', 'NCR'),
  ('72000000-0000-4000-8000-000000000002', 'Other Workflow Test Club', 'Manila', 'NCR');
insert into public.courses(id, club_id, name)
values ('73000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', 'Workflow Test Course');
insert into public.club_staff(club_id, user_id, role) values
  ('72000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000004', 'club_manager'),
  ('72000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000005', 'club_manager');
insert into public.caddie_club_assignments(caddie_id, club_id, verification_status, is_primary)
values ('71000000-0000-4000-8000-000000000003', '72000000-0000-4000-8000-000000000001', 'verified', true);
insert into public.tee_times(id, course_id, starts_at, ends_at, booking_cutoff_at, player_capacity, status)
values
  ('74000000-0000-4000-8000-000000000001', '73000000-0000-4000-8000-000000000001', now() + interval '2 days', now() + interval '2 days 4 hours', now() + interval '1 day 22 hours', 4, 'open'),
  ('74000000-0000-4000-8000-000000000002', '73000000-0000-4000-8000-000000000001', now() + interval '3 days', now() + interval '3 days 4 hours', now() + interval '2 days 22 hours', 4, 'open');
insert into public.caddie_tee_time_availability(tee_time_id, caddie_id) values
  ('74000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000003'),
  ('74000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000003')
on conflict (tee_time_id, caddie_id) do nothing;
update public.booking_policy set reserve_tee_time_inventory = true, capacity_unit = 'golfers', hold_minutes = 15, max_pending_per_golfer = 3;

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.create_mobile_booking('74000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003',4::smallint,'workflow-key-0001')$$,
  'first reservation succeeds'
);
select lives_ok(
  $$select public.create_mobile_booking('74000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003',4::smallint,'workflow-key-0001')$$,
  'same idempotent request returns its original result'
);
select throws_ok(
  $$select public.create_mobile_booking('74000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003',3::smallint,'workflow-key-0001')$$,
  '22023', 'IDEMPOTENCY_KEY_REUSED', 'idempotency key cannot be reused with another payload'
);
reset role;
select set_config('test.booking_id', (select id::text from public.bookings where idempotency_key = 'workflow-key-0001'), true);
select is((select count(*) from public.bookings where idempotency_key = 'workflow-key-0001'), 1::bigint, 'duplicate submission creates one booking');
select is((select count(*) from private.booking_allocations where booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0001')), 1::bigint, 'reservation creates one allocation');
select is((select count(*) from private.booking_events where event_kind = 'booking.requested' and booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0001')), 1::bigint, 'reservation and event commit together');

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select throws_ok(
  format('select public.cancel_booking(%L)', current_setting('test.booking_id')),
  '42501', 'PERMISSION_DENIED', 'another golfer cannot cancel the booking'
);
select throws_ok(
  $$select public.create_mobile_booking('74000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000003',1::smallint,'workflow-key-0002')$$,
  '23P01', 'CADDIE_UNAVAILABLE', 'capacity or caddie contention is rejected'
);
select throws_ok(
  $$select public.admin_set_caddie_tee_time_availability('74000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000003',false)$$,
  '42501', 'PERMISSION_DENIED', 'a golfer cannot mutate club-managed caddie availability'
);
select is((select count(*) from public.profiles where id = '71000000-0000-4000-8000-000000000003'), 0::bigint, 'a golfer cannot read another user profile row through the caddie directory');
reset role;

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000005', true);
set local role authenticated;
select throws_ok(
  $$select public.admin_set_caddie_tee_time_availability('74000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000003',false)$$,
  '42501', 'PERMISSION_DENIED', 'a manager cannot mutate another club caddie schedule'
);
reset role;

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select lives_ok(
  format('select public.respond_to_booking(%L, true)', (select id from public.bookings where idempotency_key = 'workflow-key-0001')),
  'assigned caddie can accept before expiration'
);
reset role;
select is((select status::text from public.bookings where idempotency_key = 'workflow-key-0001'), 'confirmed', 'acceptance confirms the booking');

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok(
  format('select public.transition_booking(%L, %L::public.booking_status, null)', (select id from public.bookings where idempotency_key = 'workflow-key-0001'), 'completed'),
  '22023', 'INVALID_BOOKING_TRANSITION', 'invalid and unauthorized state transitions are rejected'
);
reset role;

select lives_ok($$select private.process_booking_events(100)$$, 'booking event worker processes a committed batch');
select lives_ok($$select private.process_booking_events(100)$$, 'booking event worker replay is safe');
select is((select count(*) from public.notifications where source_event_id in (select id from private.booking_events where booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0001'))), 1::bigint, 'replayed event delivery does not duplicate notifications');

select set_config('test.outbox_id', (select id::text from public.claim_booking_emails(1) limit 1), true);
select lives_ok(format('select public.complete_booking_email(%L, false, %L, null)', current_setting('test.outbox_id'), 'provider unavailable'), 'notification provider failure is recorded independently');
select ok((select delivery_status = 'failed' and available_at > now() from private.notification_outbox where id = current_setting('test.outbox_id')::uuid), 'failed notification is retained with delayed retry');

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select throws_ok(
  $$select public.update_published_tee_time('74000000-0000-4000-8000-000000000001', now() + interval '2 days 1 hour', now() + interval '2 days 5 hours', now() + interval '1 day 23 hours', 4::smallint, 'open')$$,
  '23P01', 'ACTIVE_BOOKINGS_PREVENT_SCHEDULE_CHANGE', 'active allocations prevent unsafe tee-time edits'
);
reset role;

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(format('select public.cancel_booking(%L)', (select id from public.bookings where idempotency_key = 'workflow-key-0001')), 'owner can cancel');
select lives_ok(format('select public.cancel_booking(%L)', (select id from public.bookings where idempotency_key = 'workflow-key-0001')), 'repeated cancellation is idempotent');
reset role;
select is((select count(*) from private.booking_allocations where booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0001') and released_at is not null), 1::bigint, 'allocation is released exactly once');
select is((select count(*) from private.booking_events where booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0001') and event_kind = 'booking.cancelled'), 1::bigint, 'cancellation event is deduplicated');

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.create_mobile_booking('74000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000003',1::smallint,'workflow-key-0003')$$,
  'second slot can be reserved'
);
reset role;
update public.bookings set expires_at = now() - interval '1 second' where idempotency_key = 'workflow-key-0003';
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select lives_ok(format('select public.respond_to_booking(%L, true)', (select id from public.bookings where idempotency_key = 'workflow-key-0003')), 'late acceptance commits expiration instead');
reset role;
select is((select status::text from public.bookings where idempotency_key = 'workflow-key-0003'), 'expired', 'database time decides expiration');
select ok((select released_at is not null from private.booking_allocations where booking_id = (select id from public.bookings where idempotency_key = 'workflow-key-0003')), 'expired allocation is released');

select * from finish();
rollback;
