# Architecture

Target: Next.js (App Router) PWA on Vercel + Supabase (Postgres, Auth, RLS). Phase 0 only contains the framework-independent integration layer.

```text
Browser -> Next.js server -> CompetitionProvider -> BeAthleticsClient -> BeAthletics
                          -> Supabase (RLS)
```

The browser never calls BeAthletics.

## Domains (kept separate)
- External data: `lib/beathletics` (client, dto, mapper, provider, mock)
- Athletics domain: `lib/athletics` (Phase 2+)
- Personal domain: athlete, participation, preferences (Phase 1+)
- Motivation domain: `lib/gamification` (Phase 6)

## Phase 0 layout
- `lib/domain/types.ts` internal models
- `lib/beathletics/provider.ts` interface + `ProviderError`
- `lib/beathletics/dto.ts` zod schemas (never imported outside the folder)
- `lib/beathletics/mapper.ts` per-item safe mapping, Brussels date handling
- `lib/beathletics/client.ts` timeout, limited retry, Retry-After
- `lib/beathletics/beathletics-provider.ts`, `mock-provider.ts`, `fixtures/`
- `lib/logging/logger.ts` structured logger
