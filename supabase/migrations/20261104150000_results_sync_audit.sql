-- Phase 4: per-athlete results sync audit log, written under the parent's own session (RLS).

alter table public.sync_runs
  add column athlete_id uuid references public.athletes (id) on delete cascade,
  add column items_updated integer not null default 0,
  add column items_unchanged integer not null default 0;

create index sync_runs_athlete_started_idx on public.sync_runs (athlete_id, started_at desc);

-- Parents may read, create and finish runs for their own athletes only. Rows without athlete_id stay service-role only.
grant select, insert, update on public.sync_runs to authenticated;

create policy sync_runs_select_own on public.sync_runs for select to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy sync_runs_insert_own on public.sync_runs for insert to authenticated
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy sync_runs_update_own on public.sync_runs for update to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
