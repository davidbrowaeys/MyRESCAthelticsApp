# Data model

Phase 0 defines no database. The schema (profiles, athletes, participations, participation_disciplines, disciplines, results, achievement_definitions, achievements, athlete_preferences, sync_runs) follows section 20 of the solution design and is implemented as Supabase migrations in Phase 1 with RLS from the first migration.

Rules carried forward:
- Never store age or current category; derive per competition date.
- Store `result_display` and `result_numeric`; compute PB/SB from numeric only.
- Idempotency via unique constraints (`source + external_result_id` or fingerprint; `achievements.idempotency_key`).
- Competition snapshot persisted in `participations`; calendar itself is not replicated.

Domain types in `lib/domain/types.ts` map to these tables later (Competition -> participation snapshot, AthleteResult -> results).
