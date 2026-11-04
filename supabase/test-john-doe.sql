-- OPTIONAL TEST DATA: athlete "John Doe" for an existing user. Run in the Supabase SQL editor (runs as postgres, bypasses RLS).
-- PREREQUISITE: the user must already exist in Auth (sign in once through the app, or Authentication > Users > Add user).
-- Change the email below to the exact email of that Auth user.
-- Re-runnable: nothing is duplicated.

do $$
declare
  v_email text := 'david.browaeys@gmail.com';
  v_user uuid;
  v_athlete uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'No auth user with email %. Sign in once in the app first.', v_email;
  end if;

  insert into public.profiles (id) values (v_user) on conflict (id) do nothing;

  select id into v_athlete from public.athletes where parent_id = v_user order by created_at limit 1;
  if v_athlete is null then
    insert into public.athletes (parent_id, first_name, last_name, birth_date, gender)
    values (v_user, 'John', 'Doe', '2012-05-14', 'M')
    returning id into v_athlete;
  end if;

  -- Weekly training: Wednesday and Friday 18:00-20:00
  insert into public.athlete_training_slots (athlete_id, weekday, start_time, end_time)
  values (v_athlete, 3, '18:00', '20:00'), (v_athlete, 5, '18:00', '20:00')
  on conflict (athlete_id, weekday, start_time) do nothing;

  -- A few measurements
  insert into public.athlete_measurements (athlete_id, measured_on, height_cm, weight_kg) values
    (v_athlete, current_date - 365, 148.0, 38.5),
    (v_athlete, current_date - 180, 152.0, 42.0),
    (v_athlete, current_date,       155.5, 44.5)
  on conflict (athlete_id, measured_on) do nothing;
end $$;

-- Check:
-- select a.first_name, a.last_name, u.email from public.athletes a join auth.users u on u.id = a.parent_id;
