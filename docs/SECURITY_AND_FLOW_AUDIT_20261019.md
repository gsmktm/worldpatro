# World Patro — code, route, data and operation audit
Date: 2026-10-19. Baseline: main at ef305834fd079a3894479c4b27feeb9d8131a29e.

## Verification boundary
This is a source-based review of critical routes, authentication, admin, SQL schema, calendar calculation and agent orchestration, supplemented by the existing CI route and smoke suite. It is **not** a penetration test, a full claim of end-to-end user testing, or a live database migration. The connected Supabase account exposed no accessible projects. Production availability and roles are unverified. No production database writes, deploys or main merges were made.

## Priority findings
| Priority | Component | Verified source-level finding | Next action |
| --- | --- | --- | --- |
| P0 | Supabase public.profiles | Original schema grants broad UPDATE including `role`; owner-update policy does not prevent changing a user's own role. | Review proposed hardening in PR #19; execute tested corrective SQL in the authorized project; verify effective privileges. |
| P0 | Supabase public.workflow_orders | Original grants UPDATE and DELETE and policy FOR ALL on owner's rows, allowing direct transition bypass and deletion of workflow evidence. | Review PR #19 privilege hardening; verify direct status edits/deletes fail and approved transitions use audited RPC. |
| P1 | Supabase public.notifications | Broad UPDATE includes trusted notification content, not just read/acknowledged timestamps. | Adopt narrower column grants in PR #19 after validation. |
| P1 | Login provider | main can display Firebase login whenever Firebase Admin and client keys exist, even if intended data backend is Supabase. | Review Supabase-only login fix and auth recovery in PR #19; validate real sign-in/confirmation/reset paths. |
| P1 | Birth-profile mutation API | PATCH read unbounded JSON without shared same-origin check; DELETE lacked same-origin check and reported success even if no matching row. | Fixed in this patch: bounded JSON guard, ID validation, empty-change rejection, ownership filtered deletion with 404 on absent row. |
| P1 | Notification mutation API | PATCH used unbounded request.json and custom inconsistent JSON/origin handling. | Fixed in this patch: common bounded mutation guard with negative-path regression tests. |
| P1 | Research items | An owner policy on research_items.user_id alone does not bind notebook_id to a notebook with the same owner. | Add an integrity constraint / trusted trigger or parent-owner RLS check; test direct Data API inserts across user boundaries. |
| P1 | Authenticated agents | AI execution depends on gateway credentials and access mode. Production defaults authenticated, but explicit public mode has potential usage/cost abuse. | Confirm production mode, add persistent per-identity quota/rate limits, exercise tool and model failure paths. |
| P2 | Route completeness | CI currently smoke tests public routes and negative paths without full authenticated CRUD/admin/RLS integration. | Add isolated test Supabase project + fixture accounts for owner/other/admin/editor/anon roles. |
| P2 | Nepal BS / Nepal Sambat | Verified Nepal BS conversions cover only published Bhadra/Asoj 2083; Nepal Sambat remains authority-required. | Import versioned official source releases before claiming complete calendar coverage. |
| P2 | Admin console | Server role checks use Supabase app_metadata (appropriate trust source); UI admin gate is UX only. | Test actual RLS/grants, audit events, state transitions, version conflicts and publish/rollback against an isolated database. |
| P2 | Jyotish | Calculations explicitly describe approximate ephemeris/ayanamsa limits; draft PR #21 adds independent features. | Cross-check golden charts, historical timezone changes, edge dates, DST folds, latitude bounds and privacy. |

## Flow inventory
- Browser navigation: Next.js App Router public pages, `/login`, `/app`, module pages, `/app/admin`.
- Accounts: Supabase SSR server/client/proxy, provider-specific Firebase adapter (legacy), personal report/profile/research endpoints.
- Admin: `requireAdmin` -> verified identity and trusted role -> record storage -> versioned state changes -> audit log -> published-content read. Test admin claims and DB authorization independently.
- Workflows: owner auth -> `workflow_orders` insert -> SQL audit trigger -> transition RPC -> event + notification. Do not rely only on API validation; database must forbid direct writes.
- World/time: source-backed country/FX/USGS providers, calendar conversion, astronomy-engine, BS authority tables.
- Agents: `/api/v1/agents/run` -> access guard -> supervisor model -> six specialist tool roles -> response with truth-boundary labels. External effects intentionally require human review.

## Required acceptance gates before production
1. Merge only reviewed and independently passing changes; compare PR #19 and this PR and confirm they do not conflict.
2. Run CI typecheck, Next build, astronomy golden tests, route graph, production smoke, WENS, auth and mutation guard checks.
3. Backup and apply reviewed least-privilege schema changes to an authorized **staging** Supabase project; run Supabase security/performance advisors and SQL privilege assertions.
4. Test anonymous/owner/other-user/editor/admin access, direct table writes, RPC workflow transitions, deleted/missing rows and CSRF/oversized bodies.
5. Test sign-up, confirmation callback, login, logout, reset, user-created content, admin publishing and version-conflict behavior using test accounts.
6. Review PR #21 independently for Jyotish tool accuracy, API validation, and routes. Do not auto-merge it.
7. Complete production preview smoke testing, security headers, accessibility/mobile review and rollback plan before deployment.

This audit does not claim that any live Supabase database has been modified, that production functionality is passing, or that all listed issues are resolved.
