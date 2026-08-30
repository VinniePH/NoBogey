create or replace function public.claim_booking_emails(p_limit integer default 20)
returns table(id uuid, recipient_email text, subject text, body text, deep_link text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with claimed as (
    select o.id
    from private.notification_outbox o
    where o.delivery_status in ('pending', 'failed') and o.attempts < 5
    order by o.created_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update private.notification_outbox o
  set delivery_status = 'sending', attempts = attempts + 1, last_error = null
  from claimed
  where o.id = claimed.id
  returning o.id, o.recipient_email, o.subject, o.body, o.deep_link;
end;
$$;

create or replace function public.complete_booking_email(p_id uuid, p_sent boolean, p_error text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.notification_outbox
  set delivery_status = case when p_sent then 'sent' else 'failed' end,
      sent_at = case when p_sent then now() else null end,
      last_error = case when p_sent then null else left(coalesce(p_error, 'Unknown delivery error'), 2000) end
  where id = p_id and delivery_status = 'sending';
end;
$$;

revoke all on function public.claim_booking_emails(integer) from public, anon, authenticated;
revoke all on function public.complete_booking_email(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_booking_emails(integer) to service_role;
grant execute on function public.complete_booking_email(uuid, boolean, text) to service_role;
