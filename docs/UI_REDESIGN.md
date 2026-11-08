# World Patro v3 · Himalayan Observatory

Written: 2083 Kartik 22 BS / 2026-11-08 AD, Sunday
Published: release deployment tracked in GitHub/Vercel
Last updated: 2026-11-08
Version: 3.0.0

## Result

World Patro opens directly into a daily workspace. The shared shell covers retained calculation, research, world, account and administration screens. The release adds a personal planner, reviewed festival calendar, everyday tools and searchable ecosystem.

The initial truth-chip, token and moment-context foundation from PR #23 is incorporated and extended here. This release includes backend changes as well as visual changes; the earlier phase-one-only scope no longer describes this implementation.

## Visual system

- Midnight teal/navy surfaces, antique gold accents, warm ivory type, restrained borders and a geometric ॐ orbital illustration.
- Editorial serif headings and system sans-serif controls; no remote font dependency.
- Persistent light/dark appearance, reduced-motion support, visible keyboard focus and native modal dialogs.
- Desktop navigation grouped by everyday tasks, Jyotish, culture/world, WENS and personal workspaces.
- Mobile bottom navigation plus an all-menus drawer. Every retained module remains accessible.
- Search via the header or Command/Ctrl+K; Tab/Enter/Escape navigation; mobile tap entry.

## Architecture

| Layer | Implementation |
| --- | --- |
| Shared interface | AppShell, NAV_ITEMS, native search/menu dialogs |
| Shared date/place | Validated URL date, latitude, longitude, timezone and navigation language |
| Daily home | One location-aware /api/v1/patro/day request; failures stay within the daily-reading panel |
| Calendar | Six-week Gregorian grid with bounded municipality-sourced BS day annotations and reviewed observance dots |
| Festivals | Versioned Kartik 2083 release, source links, search, planner deep links and ICS API |
| Personal planner | Device-local events; separately selected Supabase account CRUD in existing owner-protected saved_reports |
| Utilities | AD/BS conversion, civil age/day count, digit-shape conversion, timezone clocks |
| Retained studios | Existing calculations, auth, content, privacy, operations and research with shared shell/theme |
| Compatibility | 14 explicit legacy URL redirects; obsolete generic module placeholder removed so invalid paths return 404 |
| Install metadata | Web app manifest, icon and shortcuts; no service worker caches private pages |

Navigation labels have English/Nepali variants. Retained studio content is not fully translated. The moment URL is supported by the daily dashboard and Patro links; studios with their own birth/event inputs retain those independent inputs.

## Backend design

Planner events use the existing extensible report store:
kind=research; request_context.module=worldpatro-planner-v1; validated event in result.
The account route performs owner filtering, a planner-namespace filter, strict input validation, bounded JSON reads and same-origin mutation checks. It never accepts a user_id from the client. Existing account export/report deletion can include these records. No production schema migration is required by this feature.

Device and account storage are separate choices. There is no silent upload, automatic sync, browser push or email delivery. ICS export lets users import dates into their own calendar software.

## Runtime repair

Production /api/v1/health returned 500 on 2026-11-08. Vercel logs identified firebase-admin -> jwks-rsa -> jose CommonJS/ESM incompatibility. Pin the jwks-rsa-scoped jose dependency to 5.10.0 in package.json and the npm-generated lockfile. Other dependency branches are unchanged. A Node 24 import with --no-experimental-require-module passes. Firebase user verification is also loaded only after selecting Firebase and finding a session.

## Verification

The release uses typecheck, production build, astronomical golden dates, SQL privilege source checks, existing production/route/auth/WENS/mutation/Jyotish suites, and the new ecosystem acceptance suite. The ecosystem suite covers source boundaries, Kartik roundtrips, UTF-8 ICS line folding, account API guards, legacy redirects, page reachability and install metadata.

Build-time checks and anonymous/negative API tests do not prove authenticated database CRUD. Live Supabase project management access was denied in this session. Private sync, existing role policies and authenticated account operations require access to the configured project for end-to-end verification.

See RESEARCH_AND_RELEASE_20261108.md for sources, decisions and remaining ecosystem priorities.
