-- Defense-in-depth hardening from live Security and Performance Advisors.

alter table private.payment_callback_events enable row level security;
alter table private.financial_ledger enable row level security;
alter table private.audit_logs enable row level security;

-- This pre-existing event-trigger helper is not an application RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create index financial_ledger_payment_intent_id_idx on private.financial_ledger(payment_intent_id);
create index financial_ledger_payout_id_idx on private.financial_ledger(payout_id);
create index booking_status_history_changed_by_idx on public.booking_status_history(changed_by);
create index caddie_playstyles_playstyle_id_idx on public.caddie_playstyles(playstyle_id);
create index golfer_playstyles_playstyle_id_idx on public.golfer_playstyles(playstyle_id);
create index disputes_opened_by_idx on public.disputes(opened_by);
create index disputes_resolved_by_idx on public.disputes(resolved_by);
create index ratings_rater_id_idx on public.ratings(rater_id);
create index user_roles_granted_by_idx on public.user_roles(granted_by);
create index verification_documents_caddie_id_idx on public.verification_documents(caddie_id);
create index verification_documents_reviewed_by_idx on public.verification_documents(reviewed_by);

drop policy availability_owner_write on public.caddie_availability;
create policy availability_owner_insert on public.caddie_availability for insert to authenticated
with check (caddie_id = (select auth.uid()) and private.has_role('caddie'));
create policy availability_owner_update on public.caddie_availability for update to authenticated
using (caddie_id = (select auth.uid()))
with check (caddie_id = (select auth.uid()) and private.has_role('caddie'));
create policy availability_owner_delete on public.caddie_availability for delete to authenticated
using (caddie_id = (select auth.uid()));

drop policy caddie_playstyles_owner_write on public.caddie_playstyles;
create policy caddie_playstyles_owner_insert on public.caddie_playstyles for insert to authenticated
with check (caddie_id = (select auth.uid()));
create policy caddie_playstyles_owner_update on public.caddie_playstyles for update to authenticated
using (caddie_id = (select auth.uid())) with check (caddie_id = (select auth.uid()));
create policy caddie_playstyles_owner_delete on public.caddie_playstyles for delete to authenticated
using (caddie_id = (select auth.uid()));
