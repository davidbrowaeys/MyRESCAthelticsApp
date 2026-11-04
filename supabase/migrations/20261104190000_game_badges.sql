-- _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
-- Badges for the Pace Hurdle Run game (distance milestones). Codes match lib/game/hurdle-engine.ts.
insert into public.achievement_definitions (code, name_fr, description_fr, xp) values
  ('hurdle_100', 'Échauffement', 'Tu as couru 100 m dans Pace Hurdle Run.', 50),
  ('hurdle_500', 'Sprinteur', 'Tu as couru 500 m dans Pace Hurdle Run.', 100),
  ('hurdle_1000', 'Marathonien', 'Tu as couru 1000 m dans Pace Hurdle Run.', 200)
on conflict (code) do nothing;
-- __________________________GenAI: Generated code ends here______________________________
