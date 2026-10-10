# World Patro · Cross-Workspace UI/UX and Accessibility Baseline

This scope preserves the existing 20 functional app modules while aligning global navigation and instrumentation.

## Completed repository checks
- The `FEATURES` module registry drives the sidebar; active workspaces now advertise `aria-current="page"` for screen readers and selected-state styling.
- Every app workspace has a keyboard-operable **Skip to main content** link pointing to a focusable `<main>`.
- Mobile navigation, command center, WENS and System status links carry the same selected-page semantics.
- Accessible focus rings and reduced-motion preferences are supported across shared navigation.
- A single branded data-plane card performs the same **real**, bounded Supabase reference read on System and protected Admin pages.
- GitHub CI checks the 20-module registry, routes, navigation links, health API contracts, compilation and smoke tests.

## What automated UI checks do NOT prove
- The status of a deployed Supabase schema, because access to the specified project's management account has not been granted.
- Usability of login, password-reset, account permissions, workflows and private records against real test users.
- Actual visual rendering at all viewport widths or WCAG compliance across every feature screen. Conduct browser-based visual regression and keyboard/screen-reader testing.
- That third-party feeds, astrology sources or public authority data have been externally certified.

## Production readiness matrix

| Layer | Verified by CI | Requires runtime QA |
|---|---|---|
| Navigation and module links | 20 feature routes, no orphaned modules, keyboard jump target | visual and screen-reader review |
| Calendars and Jyotish | 9 calendar profiles, astronomy golden dates, payload validation | authority release freshness and local-date crosschecks |
| WENS / WBGR | 109 curated gates and 729 legacy-compatible combinations | provenance review and symbolic/astronomical boundary |
| Supabase connection | API response schema and no-data/no-secret output | actual 200/403/404 result from the target database |
| Admin | protected API routes and versioned editor code | role tests, RLS, content lifecycle and audit chain |
| Private workspaces | route coverage and server-side guards | account-owned CRUD, session invalidation and privacy export |
| Deployment | Next.js build and smoke | production environment, health checks, error rates |

## Release gates
1. Merge CI-passing changes; do not mass-merge old divergent branches.
2. Apply approved SQL migrations to the exact Supabase project after schema/backup review.
3. Verify live probe then authentication, RLS and owner-only data access.
4. Run production build and view on desktop, tablet and phone; test keyboard-only input and error handling.
5. Switch the primary data backend only after a verified rollback path and an explicit deployment.
