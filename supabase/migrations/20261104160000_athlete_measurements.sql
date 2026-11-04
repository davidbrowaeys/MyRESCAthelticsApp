-- Height / weight evolution per athlete. BMI is derived in the app (never stored).
-- Ownership model: parent -> athletes -> athlete_measurements, same RLS pattern as sync_runs.

create table public.athlete_measurements (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  measured_on date not null,
  height_cm numeric(4, 1) check (height_cm between 30 and 250),
  weight_kg numeric(5, 1) check (weight_kg between 5 and 250),
  created_at timestamptz not null default now(),
  check (height_cm is not null or weight_kg is not null),
  unique (athlete_id, measured_on)
);
alter table public.athlete_measurements enable row level security;

grant select, insert, update, delete on public.athlete_measurements to authenticated;

create policy athlete_measurements_select_own on public.athlete_measurements for select to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_measurements_insert_own on public.athlete_measurements for insert to authenticated
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_measurements_update_own on public.athlete_measurements for update to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_measurements_delete_own on public.athlete_measurements for delete to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
