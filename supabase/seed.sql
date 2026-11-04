-- Reference data only. Idempotent. No personal data.
insert into public.disciplines (code, name_fr, kind, lower_is_better) values
  ('60m', '60 m', 'time', true),
  ('100m', '100 m', 'time', true),
  ('200m', '200 m', 'time', true),
  ('400m', '400 m', 'time', true),
  ('800m', '800 m', 'time', true),
  ('1000m', '1000 m', 'time', true),
  ('long_jump', 'Longueur', 'distance', false),
  ('high_jump', 'Hauteur', 'distance', false),
  ('shot_put', 'Poids', 'distance', false),
  ('javelin', 'Javelot', 'distance', false)
on conflict (code) do nothing;

insert into public.achievement_definitions (code, name_fr, description_fr, xp) values
  ('first_participation', 'Premier départ', 'Tu as ajouté ta première compétition.', 50),
  ('first_result', 'Premier résultat', 'Ton premier résultat est enregistré.', 50),
  ('first_pb', 'Record personnel', 'Tu as battu ton record personnel.', 100),
  ('five_competitions', 'Régulier', 'Cinq compétitions disputées.', 150),
  ('season_consistency', 'Constance', 'Une compétition par mois pendant trois mois.', 200),
  ('hurdle_100', 'Échauffement', 'Tu as couru 100 m dans Pace Hurdle Run.', 50),
  ('hurdle_500', 'Sprinteur', 'Tu as couru 500 m dans Pace Hurdle Run.', 100),
  ('hurdle_1000', 'Marathonien', 'Tu as couru 1000 m dans Pace Hurdle Run.', 200)
on conflict (code) do nothing;
