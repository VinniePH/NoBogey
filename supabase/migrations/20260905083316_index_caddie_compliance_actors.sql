create index if not exists caddie_compliance_reported_by_idx
  on public.caddie_compliance_events(reported_by);

create index if not exists caddie_compliance_resolved_by_idx
  on public.caddie_compliance_events(resolved_by)
  where resolved_by is not null;
