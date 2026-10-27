begin;

create extension if not exists pgtap with schema extensions;
select plan(45);

select has_table('public', 'booking_acknowledgements', 'booking acknowledgements are persisted');
select has_table('public', 'admin_notifications', 'CRM notifications are persisted');
select has_table('public', 'admin_notification_reads', 'administrator read receipts are persisted');
select has_column('public', 'booking_acknowledgements', 'participant_id', 'acknowledgements retain participant identity');
select has_function('public', 'confirm_booking_acknowledgement', array['uuid','text'], 'authorized acknowledgement RPC exists');
select has_function('public', 'list_my_booking_acknowledgements', array[]::text[], 'participant acknowledgement listing exists');
select has_function('public', 'list_admin_notifications', array['boolean','integer'], 'CRM notification listing exists');
select has_function('public', 'get_admin_notification_counts', array[]::text[], 'CRM notification counts exist');
select has_function('public', 'mark_admin_notification_read', array['uuid'], 'individual read RPC exists');
select has_function('public', 'mark_all_admin_notifications_read', array['uuid'], 'bulk read RPC exists');
select ok((select relrowsecurity from pg_class where oid = 'public.booking_acknowledgements'::regclass), 'acknowledgements have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.admin_notifications'::regclass), 'CRM notifications have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.admin_notification_reads'::regclass), 'CRM read receipts have RLS');
select ok(not has_table_privilege('anon', 'public.booking_acknowledgements', 'SELECT'), 'anonymous users cannot read acknowledgements');
select ok(not has_table_privilege('authenticated', 'public.booking_acknowledgements', 'INSERT'), 'participants cannot bypass the acknowledgement RPC');
select ok(has_function_privilege('authenticated', 'public.confirm_booking_acknowledgement(uuid,text)', 'EXECUTE'), 'participants can invoke acknowledgement RPC');
select ok(not has_function_privilege('anon', 'public.confirm_booking_acknowledgement(uuid,text)', 'EXECUTE'), 'anonymous users cannot invoke acknowledgement RPC');
select ok(has_function_privilege('authenticated', 'public.list_admin_notifications(boolean,integer)', 'EXECUTE'), 'administrators can invoke CRM listing RPC');

insert into auth.users(id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('81000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ack-golfer@example.test', '', now(), '{}', '{"display_name":"Ack golfer"}'),
  ('81000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ack-caddie@example.test', '', now(), '{}', '{"display_name":"Ack caddie"}'),
  ('81000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ack-admin@example.test', '', now(), '{}', '{"display_name":"Ack admin"}'),
  ('81000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'other-admin@example.test', '', now(), '{}', '{"display_name":"Other admin"}');
insert into public.user_roles(user_id, role) values
  ('81000000-0000-4000-8000-000000000001', 'golfer'),
  ('81000000-0000-4000-8000-000000000002', 'caddie'),
  ('81000000-0000-4000-8000-000000000003', 'club_manager'),
  ('81000000-0000-4000-8000-000000000004', 'club_manager');
insert into public.golfer_profiles(user_id) values ('81000000-0000-4000-8000-000000000001');
insert into public.caddie_profiles(user_id, verification_status, rate_amount_in_centavos)
values ('81000000-0000-4000-8000-000000000002', 'verified', 150000);
insert into public.golf_clubs(id, name, city, region) values
  ('82000000-0000-4000-8000-000000000001', 'Acknowledgement Club', 'Manila', 'NCR'),
  ('82000000-0000-4000-8000-000000000002', 'Other Acknowledgement Club', 'Manila', 'NCR');
insert into public.courses(id, club_id, name)
values ('83000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'Acknowledgement Course');
insert into public.club_staff(club_id, user_id, role) values
  ('82000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000003', 'club_manager'),
  ('82000000-0000-4000-8000-000000000002', '81000000-0000-4000-8000-000000000004', 'club_manager');
insert into public.caddie_club_assignments(caddie_id, club_id, verification_status, is_primary)
values ('81000000-0000-4000-8000-000000000002', '82000000-0000-4000-8000-000000000001', 'verified', true);
insert into public.bookings(
  id, golfer_id, caddie_id, course_id, starts_at, ends_at, party_size,
  quoted_amount_in_centavos, status, idempotency_key, confirmed_at
) values (
  '84000000-0000-4000-8000-000000000001',
  '81000000-0000-4000-8000-000000000001',
  '81000000-0000-4000-8000-000000000002',
  '83000000-0000-4000-8000-000000000001',
  now() + interval '1 day', now() + interval '1 day 4 hours', 1, 150000,
  'confirmed', 'acknowledgement-test-booking', now()
);

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok(
  $$insert into public.booking_acknowledgements(booking_id, step, participant_id, participant_role)
    values ('84000000-0000-4000-8000-000000000001', 'meetup', '81000000-0000-4000-8000-000000000001', 'golfer')$$,
  '42501', null, 'direct acknowledgement inserts are denied'
);
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select throws_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'meetup')$$,
  '42501', 'PERMISSION_DENIED', 'non-participants cannot acknowledge a booking'
);
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'payment')$$,
  '22023', 'MUTUAL_MEETUP_REQUIRED', 'payment requires mutual meetup confirmation'
);
select lives_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'meetup')$$,
  'golfer can confirm meetup'
);
select set_config('test.golfer_meetup_at', (
  select confirmed_at::text from public.booking_acknowledgements
  where booking_id = '84000000-0000-4000-8000-000000000001' and step = 'meetup' and participant_role = 'golfer'
), true);
select lives_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'meetup')$$,
  'repeated meetup confirmation is safe'
);
select is((select count(*) from public.booking_acknowledgements where participant_role = 'golfer' and step = 'meetup'), 1::bigint, 'repeat submission creates one row');
select is((select confirmed_at::text from public.booking_acknowledgements where participant_role = 'golfer' and step = 'meetup'), current_setting('test.golfer_meetup_at'), 'repeat submission preserves the server timestamp');
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select lives_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'meetup')$$,
  'caddie can confirm meetup'
);
select is((select count(*) from public.booking_acknowledgements where step = 'meetup'), 2::bigint, 'meetup stores both participants');
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'payment')$$,
  'golfer can acknowledge payment after mutual meetup'
);
reset role;
select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select lives_ok(
  $$select public.confirm_booking_acknowledgement('84000000-0000-4000-8000-000000000001', 'payment')$$,
  'caddie can acknowledge payment after mutual meetup'
);
select is((select count(*) from public.booking_acknowledgements), 4::bigint, 'both steps retain both participant identities');
select is((select count(*) from public.booking_acknowledgements where confirmed_at is not null), 4::bigint, 'all acknowledgements have server timestamps');
select is((select count(*) from public.list_my_booking_acknowledgements()), 4::bigint, 'participant listing returns synchronized state');
select is((select count(*) from public.booking_acknowledgements), 4::bigint, 'participant RLS exposes the booking acknowledgements');
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select is((select count(*) from public.list_admin_notifications(false, 100)), 4::bigint, 'course administrator receives acknowledgement CRM events');
select is((select count(*) from public.list_admin_notifications(false, 100) where destination_path = '/admin/assignments'), 4::bigint, 'CRM events include relevant destination links');
select is((select unread_count from public.get_admin_notification_counts()), 4::bigint, 'unread count is scoped to the administrator');
select set_config('test.notification_id', (select id::text from public.list_admin_notifications(false, 100) limit 1), true);
select lives_ok(format('select public.mark_admin_notification_read(%L)', current_setting('test.notification_id')), 'administrator can mark one notification read');
select is((select unread_count from public.get_admin_notification_counts()), 3::bigint, 'individual read updates the unread count');
select lives_ok(format('select public.mark_admin_notification_read(%L)', current_setting('test.notification_id')), 'individual read update is idempotent');
select is((select count(*) from public.admin_notification_reads), 1::bigint, 'repeat individual update creates one read receipt');
select lives_ok($$select public.mark_all_admin_notifications_read(null)$$, 'administrator can mark all notifications read');
select is((select unread_count from public.get_admin_notification_counts()), 0::bigint, 'bulk read clears the administrator unread count');
reset role;

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select is((select count(*) from public.list_admin_notifications(false, 100)), 0::bigint, 'another course administrator cannot list CRM notifications');
select is((select count(*) from public.booking_acknowledgements), 0::bigint, 'non-participant cannot read acknowledgement rows');
select is((select total_count from public.get_admin_notification_counts()), 0::bigint, 'CRM counts cannot cross course boundaries');
reset role;

select * from finish();
rollback;
