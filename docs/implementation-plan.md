# Implementation plan

- Phase 0 (done): spike, docs, provider interface, mappers (calendar, detail, results), client, mock provider, tests (25 passing).
- Phase 1 (scaffold done, 2026-11-04): Next.js 16 + Tailwind 4, Supabase SSR auth (password sign-in only, no signup), proxy session refresh, app shell + 5-tab bottom nav, PWA manifest with placeholder SVG icons, migration with RLS on all 10 tables + seed. NOT done: shadcn/ui, RLS integration tests (need a Supabase project/local stack), PNG icons, offline fallback, profile bootstrap row.
- Phase 2: athlete profile, LBFA category engine (configurable), calendar wired to provider with mock fallback, eligibility filter (unknown eligibility shown, not hidden), detail page.
- Phase 3: participations, disciplines, Google/Outlook/ICS.
- Phase 4: results (blocked until results endpoint is captured, else manual fixtures).
- Phase 5: progress. Phase 6: gamification. Phase 7: optional.

Open items: athlete search response shape; verify server-side access from Vercel; confirm pagination beyond loaded=50; apply migration to a Supabase project and run advisors.
