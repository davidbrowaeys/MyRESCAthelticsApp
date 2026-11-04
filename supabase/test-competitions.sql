-- OPTIONAL TEST DATA: realistic competitions (planned/registered) and past results for one athlete.
-- Run in the Supabase SQL editor AFTER supabase/test-john-doe.sql (runs as postgres, bypasses RLS).
-- Change v_email to the Auth email of the parent. Dates are relative to today, so the data always looks current.
-- Re-runnable: rows are upserted on their natural keys.
-- Remove again: delete from public.participations where competition_external_id like 'test-%';
--               delete from public.results where external_result_id like 'test-%';

do $$
declare
  v_email text := 'david.browaeys@gmail.com';
  v_athlete uuid;
  v_p uuid;
begin
  select a.id into v_athlete
  from public.athletes a join auth.users u on u.id = a.parent_id
  where lower(u.email) = lower(v_email)
  order by a.created_at limit 1;
  if v_athlete is null then
    raise exception 'No athlete for %. Run supabase/test-john-doe.sql first.', v_email;
  end if;

  -- ---------------------------------------------------------- upcoming competitions
  insert into public.participations (athlete_id, competition_external_id, competition_name, start_date, end_date, venue_city, status)
  values
    (v_athlete, 'test-up-1', 'Meeting indoor de Louvain-la-Neuve', current_date + 9,   current_date + 9,   'Louvain-la-Neuve', 'registered'),
    (v_athlete, 'test-up-2', 'Championnat provincial en salle',     current_date + 23,  current_date + 23,  'Louvain-la-Neuve', 'planned'),
    (v_athlete, 'test-up-3', 'Cross des Lions',                     current_date + 37,  current_date + 37,  'Bruxelles',         'planned'),
    (v_athlete, 'test-up-4', 'Championnats de Belgique jeunes',     current_date + 65,  current_date + 66,  'Gent',              'planned'),
    (v_athlete, 'test-up-5', 'Meeting de printemps',                current_date + 110, current_date + 110, 'Uccle',             'planned')
  on conflict (athlete_id, competition_external_id) do update
    set competition_name = excluded.competition_name, start_date = excluded.start_date,
        end_date = excluded.end_date, venue_city = excluded.venue_city, status = excluded.status;

  -- disciplines of the first three
  for v_p in select id from public.participations where athlete_id = v_athlete and competition_external_id in ('test-up-1', 'test-up-2') loop
    insert into public.participation_disciplines (participation_id, discipline_external_id, discipline_name)
    values (v_p, '60m', '60 m'), (v_p, 'long_jump', 'Longueur')
    on conflict do nothing;
  end loop;
  select id into v_p from public.participations where athlete_id = v_athlete and competition_external_id = 'test-up-4';
  insert into public.participation_disciplines (participation_id, discipline_external_id, discipline_name)
  values (v_p, '800m', '800 m') on conflict do nothing;

  -- ---------------------------------------------------------- past results (progression over two seasons)
  insert into public.results
    (athlete_id, external_result_id, competition_name, event_date, discipline_name, discipline_code,
     display, value, kind, lower_is_better, venue_kind, ranking, round, category_code)
  values
    (v_athlete, 'test-r-01', 'Meeting indoor de Gand',      current_date - 330, '60 m',      '60m',       '9.12',   9.12,  'time',     true,  'indoor',  5, 'Finale', 'MIN'),
    (v_athlete, 'test-r-02', 'Meeting indoor de Gand',      current_date - 330, 'Longueur',  'long_jump', '3,95 m', 3.95,  'distance', false, 'indoor',  4, 'Finale', 'MIN'),
    (v_athlete, 'test-r-03', 'Championnat provincial',      current_date - 300, '60 m',      '60m',       '8.98',   8.98,  'time',     true,  'indoor',  3, 'Finale', 'MIN'),
    (v_athlete, 'test-r-04', 'Interclubs de printemps',     current_date - 240, '100 m',     '100m',      '14.85',  14.85, 'time',     true,  'outdoor', 6, 'Série',  'MIN'),
    (v_athlete, 'test-r-05', 'Interclubs de printemps',     current_date - 240, 'Longueur',  'long_jump', '4,10 m', 4.10,  'distance', false, 'outdoor', 3, 'Finale', 'MIN'),
    (v_athlete, 'test-r-06', 'Meeting de Bruxelles',        current_date - 200, '100 m',     '100m',      '14.52',  14.52, 'time',     true,  'outdoor', 4, 'Finale', 'MIN'),
    (v_athlete, 'test-r-07', 'Meeting de Bruxelles',        current_date - 200, 'Longueur',  'long_jump', '4,32 m', 4.32,  'distance', false, 'outdoor', 2, 'Finale', 'MIN'),
    (v_athlete, 'test-r-08', 'Championnats francophones',   current_date - 160, '600 m',     null,        '1:53.40', 113.40,'time',    true,  'outdoor', 7, 'Finale', 'MIN'),
    (v_athlete, 'test-r-09', 'Cross de la Cambre',          current_date - 90,  '1000 m',    '1000m',     '3:42.10', 222.10,'time',    true,  'outdoor', 9, 'Finale', 'MIN'),
    (v_athlete, 'test-r-10', 'Meeting indoor de Louvain',   current_date - 45,  '60 m',      '60m',       '8.76',   8.76,  'time',     true,  'indoor',  2, 'Finale', 'MIN'),
    (v_athlete, 'test-r-11', 'Meeting indoor de Louvain',   current_date - 45,  'Longueur',  'long_jump', '4,55 m', 4.55,  'distance', false, 'indoor',  1, 'Finale', 'MIN'),
    (v_athlete, 'test-r-12', 'Meeting indoor de Liège',     current_date - 14,  '60 m',      '60m',       '8.69',   8.69,  'time',     true,  'indoor',  2, 'Finale', 'MIN')
  on conflict (athlete_id, external_result_id) do update
    set display = excluded.display, value = excluded.value, event_date = excluded.event_date;
end $$;

-- Check:
-- select competition_name, start_date, status from public.participations order by start_date;
-- select event_date, discipline_name, display from public.results order by event_date;
