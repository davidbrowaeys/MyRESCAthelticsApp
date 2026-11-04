-- My RESC Athletics: initial schema with Row Level Security enabled from the first migration.
-- Ownership model: auth.users -> profiles (parent) -> athletes. Every personal table is scoped to the parent.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------- athletes
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  birth_date date not null,
  gender text not null check (gender in ('M', 'F')),
  club_code text not null default 'RESC',
  beathletics_live_id text,
  created_at timestamptz not null default now()
);
create index athletes_parent_id_idx on public.athletes (parent_id);
alter table public.athletes enable row level security;

-- ------------------------------------------------- disciplines (reference)
create table public.disciplines (
  code text primary key,
  name_fr text not null,
  kind text not null check (kind in ('time', 'distance', 'other')),
  lower_is_better boolean not null
);
alter table public.disciplines enable row level security;

-- ----------------------------------------------------------- participations
create table public.participations (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  competition_external_id text not null,
  competition_name text not null,
  start_date date not null,
  end_date date not null,
  venue_city text,
  source_url text,
  status text not null default 'planned' check (status in ('planned', 'registered', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  unique (athlete_id, competition_external_id)
);
create index participations_athlete_start_idx on public.participations (athlete_id, start_date);
alter table public.participations enable row level security;

create table public.participation_disciplines (
  participation_id uuid not null references public.participations (id) on delete cascade,
  discipline_external_id text not null,
  discipline_name text not null,
  primary key (participation_id, discipline_external_id)
);
alter table public.participation_disciplines enable row level security;

-- ------------------------------------------------------------------ results
create table public.results (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  external_result_id text not null,
  competition_external_id text,
  competition_name text not null,
  event_date date not null,
  discipline_name text not null,
  discipline_code text references public.disciplines (code),
  display text not null,
  value numeric not null,
  kind text not null check (kind in ('time', 'distance', 'other')),
  lower_is_better boolean not null,
  venue_kind text not null default 'unknown' check (venue_kind in ('indoor', 'outdoor', 'unknown')),
  wind numeric,
  ranking integer,
  round text,
  category_code text,
  created_at timestamptz not null default now(),
  unique (athlete_id, external_result_id)
);
create index results_athlete_date_idx on public.results (athlete_id, event_date desc);
create index results_discipline_code_idx on public.results (discipline_code);
alter table public.results enable row level security;

-- ------------------------------------------------------------ gamification
create table public.achievement_definitions (
  code text primary key,
  name_fr text not null,
  description_fr text not null,
  xp integer not null check (xp >= 0)
);
alter table public.achievement_definitions enable row level security;

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  definition_code text not null references public.achievement_definitions (code),
  awarded_at timestamptz not null default now(),
  unique (athlete_id, definition_code)
);
create index achievements_definition_code_idx on public.achievements (definition_code);
alter table public.achievements enable row level security;

-- -------------------------------------------------------------- preferences
create table public.athlete_preferences (
  athlete_id uuid primary key references public.athletes (id) on delete cascade,
  locale text not null default 'fr' check (locale in ('fr', 'nl', 'en')),
  reminders_enabled boolean not null default false
);
alter table public.athlete_preferences enable row level security;

-- ---------------------------------------------------------------- sync_runs
-- Audit table written by server jobs with the service role only (no policies for end users).
create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('calendar', 'results')),
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_seen integer not null default 0,
  items_written integer not null default 0,
  error_code text
);
alter table public.sync_runs enable row level security;

-- ------------------------------------------------------------------ grants
-- Explicit grants: nothing for anon, least privilege for authenticated. RLS still filters rows.
revoke all on all tables in schema public from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.athletes to authenticated;
grant select on public.disciplines, public.achievement_definitions to authenticated;
grant select, insert, update, delete on public.participations, public.participation_disciplines to authenticated;
grant select, insert, update, delete on public.results to authenticated;
grant select, insert on public.achievements to authenticated;
grant select, insert, update on public.athlete_preferences to authenticated;
-- sync_runs: no grant to authenticated; service_role bypasses RLS.

-- ----------------------------------------------------------------- policies
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy athletes_select_own on public.athletes for select to authenticated
  using (parent_id = (select auth.uid()));
create policy athletes_insert_own on public.athletes for insert to authenticated
  with check (parent_id = (select auth.uid()));
create policy athletes_update_own on public.athletes for update to authenticated
  using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
create policy athletes_delete_own on public.athletes for delete to authenticated
  using (parent_id = (select auth.uid()));

create policy disciplines_read on public.disciplines for select to authenticated using (true);
create policy achievement_definitions_read on public.achievement_definitions for select to authenticated using (true);

-- Child tables: the athlete must belong to the signed-in parent.
create policy participations_all_own on public.participations for all to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));

create policy participation_disciplines_all_own on public.participation_disciplines for all to authenticated
  using (participation_id in (
    select p.id from public.participations p
    join public.athletes a on a.id = p.athlete_id
    where a.parent_id = (select auth.uid())))
  with check (participation_id in (
    select p.id from public.participations p
    join public.athletes a on a.id = p.athlete_id
    where a.parent_id = (select auth.uid())));

create policy results_all_own on public.results for all to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));

create policy achievements_select_own on public.achievements for select to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy achievements_insert_own on public.achievements for insert to authenticated
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));

create policy athlete_preferences_select_own on public.athlete_preferences for select to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_preferences_insert_own on public.athlete_preferences for insert to authenticated
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
create policy athlete_preferences_update_own on public.athlete_preferences for update to authenticated
  using (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())))
  with check (athlete_id in (select id from public.athletes where parent_id = (select auth.uid())));
