-- Optional contact details on the parent profile and an optional nickname on the athlete.
-- Existing RLS policies and grants (select/insert/update own rows) already cover the new columns.

alter table public.profiles
  add column contact_email text check (contact_email is null or char_length(contact_email) <= 120),
  add column phone text check (phone is null or char_length(phone) <= 20);

alter table public.athletes
  add column nickname text check (nickname is null or char_length(nickname) between 1 and 30);
