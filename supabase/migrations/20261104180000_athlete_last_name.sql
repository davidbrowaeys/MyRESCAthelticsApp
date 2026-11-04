-- Last name on the athlete. Nullable so existing rows stay valid; the app asks for it on creation and in settings.
alter table public.athletes
  add column last_name text check (last_name is null or char_length(last_name) between 1 and 80);
