-- Recurring weekly training sessions per athlete (weekday + time range). Shown in the app calendar.
-- Ownership model: parent -> athletes -> athlete_training_slots, same RLS pattern as athlete_measurements.

create table public.athlete_training_slots (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7), -- 1 = Monday ... 7 = Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (athlete_id, weekday, start_time)
);
alter table public.athlete_training_slots enable row level security;

grant select, insert, update, delete on public.athlete_training_slots to authenticated;

create policy athlete_training_slots_select_own on public.athlete_training_slots for select to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_training_slots_insert_own on public.athlete_training_slots for insert to authenticated
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_training_slots_update_own on public.athlete_training_slots for update to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_training_slots_delete_own on public.athlete_training_slots for delete to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
