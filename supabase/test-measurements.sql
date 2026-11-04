-- OPTIONAL TEST DATA for athlete_measurements. Run in the Supabase SQL editor AFTER the migration.
-- Inserts 7 measurements (about 3 years of growth) for the first athlete found.
-- The SQL editor runs as postgres (bypasses RLS), so the athlete is picked explicitly.
-- Re-runnable: rows for the same date are overwritten.

insert into public.athlete_measurements (athlete_id, measured_on, height_cm, weight_kg)
select a.id, m.measured_on, m.height_cm, m.weight_kg
from (select id from public.athletes order by created_at limit 1) a
cross join (values
  (current_date - interval '36 months', 134.0, 29.5),
  (current_date - interval '30 months', 137.5, 31.0),
  (current_date - interval '24 months', 141.0, 33.5),
  (current_date - interval '18 months', 144.5, 36.0),
  (current_date - interval '12 months', 148.0, 38.5),
  (current_date - interval '6 months',  152.0, 42.0),
  (current_date,                        155.5, 44.5)
) as m(measured_on, height_cm, weight_kg)
on conflict (athlete_id, measured_on) do update
  set height_cm = excluded.height_cm, weight_kg = excluded.weight_kg;

-- Check:
-- select measured_on, height_cm, weight_kg from public.athlete_measurements order by measured_on;

-- Remove the test data again:
-- delete from public.athlete_measurements
--  where athlete_id = (select id from public.athletes order by created_at limit 1);
