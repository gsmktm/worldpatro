# World Patro · Global Time & Intelligence OS

**World Patro** is a Nepal-origin, globally neutral full-stack operating system for time, calendar truth, astronomical sacred time, public-source world intelligence, evidence workflows, WBGR-109 / WENS symbolism and bounded AI orchestration.

> **Spirit:** From the Himalayas · Nepal → the World. Quiet center, clear method, source before claim.

## Production principles

1. **No fabricated dates or sources.**
2. **Authority beats algorithmic guesswork** for official or observational calendars.
3. **FACT, AUTHORITY, ASTRONOMY, INTERPRETATION, WBGR-109 / WENS SYMBOLISM, SCENARIO and UNKNOWN are separate truth states.**
4. **Every factual record can carry provenance, retrieval time and verification state.**
5. **Supabase is the primary authenticated persistence layer; the Firebase adapter is legacy and disabled unless deliberately selected.**
6. **Consequential workflow actions require explicit human confirmation.**
7. **Agents orchestrate trusted tools; they are not a second truth system.**

## Product routes

- `/` — cinematic public landing
- `/app` — World Patro command cockpit
- `/app/patro` — 9 Calendars · One Patro
- `/app/panchang` — astronomical Panchang
- `/app/astrology`
- `/app/kundli`
- `/app/muhurat`
- `/app/religions`
- `/app/world`
- `/app/research`
- `/app/sources`
- `/app/alerts`
- `/app/wbe`
- `/app/gates`
- `/app/agents` — Conductor + six specialist agents
- `/app/workflows`
- `/app/consult`
- `/app/learn`
- `/login`

## Core APIs

### Time and astronomy
- `GET /api/v1/health`
- `GET /api/v1/patro/today?date=2026-10-09`
- `POST /api/v1/calendar/convert`
- `GET /api/v1/panchang/day?date=2026-10-09&lat=27.7172&lon=85.3240&tz=Asia/Kathmandu`

### Public world intelligence
- `GET /api/v1/world/country?iso3=NPL`
- `GET /api/v1/world/entities`
- `GET /api/v1/world/events`
- `GET /api/v1/claims`
- `GET /api/v1/sources`

### WBE-9
- `GET /api/v1/wbe/gates`
- `POST /api/v1/wbe/assess`

### Agent system
- `GET /api/v1/agents/status`
- `POST /api/v1/agents/run`

### Firebase
- `GET /api/v1/firebase/status`
- `POST /api/auth/firebase-session`
- `DELETE /api/auth/firebase-session`

### Authenticated persistence / operations
- `GET|POST /api/v1/profiles`
- `GET|POST /api/v1/reports`
- `GET|POST /api/v1/research/notebooks`
- `GET|POST /api/v1/research/items`
- `GET|POST /api/v1/watchlists`
- `GET /api/v1/notifications`
- `GET|POST /api/v1/workflows/orders`

## Agent architecture

World Patro uses one bounded supervisor and six specialists.

| Agent | Responsibility | Boundary |
| --- | --- | --- |
| **World Patro Conductor** | Delegation and synthesis | Never blurs truth layers |
| **Kala / काल** | Calendars and chronology | Never invents official dates |
| **Jyoti / ज्योति** | Astronomy and Panchang | Astronomy ≠ interpretation |
| **Prithvi / पृथ्वी** | Public-source world facts | No covert/private surveillance |
| **Sutra / सूत्र** | Evidence and research | Facts/claims/gaps stay distinct |
| **Mandala / मण्डल** | WBE-9 | Symbolism only |
| **Karma / कर्म** | Workflow planning | No consequential execution without human confirmation |

Default Vercel AI Gateway model split:

- Supervisor: `openai/gpt-5.6-sol`
- Specialists: `openai/gpt-5.6-luna`

Runtime limits:
- supervisor: maximum 7 steps
- specialist: maximum 4 steps
- Zod-validated tool inputs
- no background model loop on page load
- model use begins only after explicit user action

See `docs/AGENT_ARCHITECTURE.md`.

## Firebase

Firebase is the preferred authenticated backend.

### Browser/public configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Server-only configuration
- `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
- `FIREBASE_SESSION_COOKIE_NAME=worldpatro_session`

Never commit or expose the Firebase service-account JSON.

The browser uses Firebase Auth. The server verifies the Firebase ID token and issues an HttpOnly session cookie. Firestore application writes currently go through trusted Next.js server routes using Firebase Admin. Direct browser Firestore access is denied by the committed `firestore.rules` until a reviewed client rule is intentionally added.

See `docs/FIREBASE.md`.

## Supabase fallback

The repository retains a complete Supabase/Postgres fallback design and migrations:

- `supabase/migrations/20261009000000_world_patro_core.sql`
- `supabase/migrations/20261009010000_operational_flows.sql`

The fallback includes RLS, claims/evidence, research, alerts and audited workflow transitions.

## Live trust coverage

### Deterministic / live code
- Gregorian
- Islamic Civil
- Chinese
- Hebrew
- Persian Solar Hijri
- Thai Buddhist Era
- astronomy-backed Vedic Panchang core
- World Bank country indicator connector
- 729 WBE Gates / 9 Anchor Gates
- bounded AI agent orchestration

### Authority connector still required before claiming exact official output
- Nepal Bikram Sambat authority release profile
- Nepal Sambat lunisolar authority/research profile
- observational Hijri declarations
- regional religious-calendar declarations
- government holiday overlays

Unsupported or variant-sensitive data is labeled rather than guessed.

## Local development

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

## Deployment

### Vercel
The Next.js application is connected to Vercel. Production and preview builds use Node 22.

### Firebase
Create/enable:
1. Firestore Standard edition in Production mode.
2. Firebase Authentication → Email/Password.
3. Authorized domains for the production host.
4. Firebase Admin service-account credential stored only as a sensitive Vercel environment variable.

## Design system

World Patro v2 uses:
- midnight / deep navy
- antique gold
- ivory
- restrained Nepal crimson
- contextual ॐ
- Himalaya line geometry
- grouped desktop navigation
- sticky command context
- mobile bottom dock
- reduced-motion support
- explicit provenance and truth-state labels

The design goal is **calm authority**, not visual noise.


## Production hardening v2.0.1

The AI Conductor is **authenticated by default in production**. Public calendar, Panchang, WBE and public-source world APIs remain independently usable.

Agent hardening includes:
- 16 KiB request-body ceiling before model execution
- authenticated/public/API-key access modes
- request IDs and server timing
- structured logs without prompts or personal identifiers
- Vercel Custom Metrics for request count, duration and delegation count
- no-store responses for agent status/runtime results
- additional HSTS, COOP/CORP and DNS-prefetch security headers

Platform-level Vercel Firewall configuration should still be enabled when the account scope permits it; application-level access controls do not replace WAF/DDoS protections.


## Curated public API integrations

World Patro uses the community `public-apis/public-apis` repository for discovery, then verifies each selected provider against its own documentation before use.

Active no-key additions:
- USGS Earthquake Hazards Program
- Frankfurter v2 FX rates
- Nager.Date as a guarded global civil-holiday fallback (not Nepal authority)

Optional/controlled providers:
- NASA Open APIs — `NASA_API_KEY`
- REST Countries v5 — `REST_COUNTRIES_API_KEY`
- OpenCage — `OPENCAGE_API_KEY`
- Open-Meteo commercial customer API — `OPEN_METEO_API_KEY`
- public Nominatim — explicit opt-in only

Operational endpoints:
- `GET /api/v1/integrations`
- `GET /api/v1/calendar/public-holidays?country=US&year=2026`
- `GET /api/v1/finance/fx?base=USD&quote=NPR`
- `GET /api/v1/world/earthquakes?lat=27.7172&lon=85.3240&radiusKm=500&days=7&minMagnitude=2.5`

See `docs/PUBLIC_API_INTEGRATIONS.md`.


## Uploaded-archive integration

Archive-derived interactive studios and a security audit are documented in `docs/ARCHIVE_MIGRATION_AUDIT.md`.
Functional routes include `/app/wbe`, `/app/gates`, `/app/patro`, `/app/panchang`, `/app/numerology`, `/api/v1/wbe/snapshots`, and `/api/v1/numerology/calculate`.

The full predecessor Kundli/Chinese lunar/BS algorithms are intentionally **not** claimed as migrated until authority and regression tests pass.


## Kundli engine and Dasha (archive migration phase 2)

The birth-chart module has functional routes `/app/kundli`, `/app/astrology`, and `POST /api/v1/jyotish/kundli`. It calculates a timezone-resolved birth instant, nine grahas, approximate Lagna/houses, seven selected vargas, and a Vimshottari tree. Calculation does not save data; optional saving uses authenticated `/api/v1/reports`. See `docs/KUNDLI_ENGINE.md` for full limitations.


## Muhurat Finder migration

The real /app/muhurat page and POST /api/v1/muhurat/search calculate location-aware sunrise, sunrise Panchang, traditional weekday/tithi screening, Rahu Kala exclusion and candidate windows (up to 31 days). These are review aids, not certified or universally accepted auspiciousness declarations. See docs/MUHURAT_ENGINE.md.


## Private saved birth charts

Authenticated reports now support safe lightweight listings via GET /api/v1/reports?kind=kundli&view=summary and user-scoped permanent deletion via DELETE /api/v1/reports/{id}. The Kundli UI can show saved chart titles and let an authenticated owner delete a report after explicit confirmation. Cross-site authenticated writes and deletes are rejected. See docs/REPORT_PRIVACY.md.


## Verified partial Nepal BS coverage · 2083

World Patro now derives BS/AD correspondences **only** inside Bhadra 2083 (17 August–16 September 2026) and Asoj 2083 (17 September–17 October 2026), from Kathmandu Metropolitan City's published BS/AD month grids. Other dates are reported as `authority_required`. Use `GET /api/v1/calendar/bs/convert?ad=2026-10-09` or `?bs=2083-06-23`. This is municipal civil-date provenance, not official holiday or Panchang certification. See `docs/NEPAL_CALENDAR_AUTHORITY.md`.

## Account Privacy Center

`/app/privacy` and `GET /api/v1/account/export?limit=100` provide bounded private application-data snapshots with truncation warnings. The endpoint does not include authentication provider exports or backups and is not an account-wide erasure service. Saved reports retain owner-only deletion.


## Administration + editorial database

- `/app/admin`: server-verified administrator console for source registry, calendar authority, religious observances and educational articles.
- `GET /api/v1/admin/session`, `GET /api/v1/admin/overview`, `GET|POST /api/v1/admin/content`, `PATCH|DELETE /api/v1/admin/content/:id`.
- `GET /api/v1/content?kind=article|observance|source|authority` returns **published records only**.
- Public `/app/learn` and `/app/religions` use the reviewed editorial records, showing an empty state when none are approved.
- Firebase: server-verified Auth custom claim `worldpatro_role=admin` plus Firestore `adminContent` and `adminAudit`; browser Firestore access remains deny-all. Composite index in `firestore.indexes.json`.
- Supabase: migration SQL in `supabase/admin_content_schema.sql`, to be run ONLY on the correct World Patro Supabase project—not on unrelated jhuto-com. Admin RLS checks trusted app_metadata roles, enforces content lifecycle and appends audit logs.
- Secure admin credentials and the appropriate production database are still required. See `docs/ADMIN_CONSOLE.md`. This is a protected editorial admin release, not a claim that all organization functions or integrations are complete.


## Admin activation and public registry
- Approved sources: `/app/sources`; approved authority notices: `/app/authorities`.
- Firebase Admin role provisioning is an explicit offline, trusted-only action: `node scripts/grant-firebase-role.mjs <uid> admin --confirm-world-patro`. Requires a secure `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` environment variable for the **world-patro** Firebase project; the script rejects the wrong Firebase project and revokes existing refresh tokens after role changes.
- User sessions must re-authenticate after role changes.


## Linked Patro full-stack workspace

/app/patro and /app/panchang now share one date/location context through GET /api/v1/patro/day, including 9 calendars and astronomical Panchang at timezone-resolved local noon. A 42-day calendar grid, verified AD↔BS tool, four city presets, JSON/ICS export, sharing, printing, source notices and links to all platform modules are wired. Optional authenticated Panchang report storage uses existing /api/v1/reports. Unsupported BS/Nepal Sambat/holiday coverage remains clearly labeled. See docs/PATRO_FULLSTACK.md.


## All 20 linked modules — operational workspaces

This release adds dedicated working screens for `/app/world` (country indicator and USGS data), `/app/research` (notebooks and evidence notes), `/app/alerts` (watchlists and notification acknowledgements), `/app/workflows` (human-review transition controls), `/app/consult` (consent-aware consultation requests) and `/app/agents` (Conductor runtime and all six subagent profiles). `/app/sources` renders the built-in verified provider catalogue independently from any unpublished editorial database. `/app/system` and `GET /api/v1/platform/modules` report the routes, capabilities and server-side activation gates.

Firebase Admin-powered user-collection adapters are added for research items, consultation requests and notification acknowledgements. These require a verified Firebase session and configured `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`. Neither a consultation request nor a workflow status change is an external booking/payment/action. No bot is given publication authority, and agent execution remains gated by the configured AI Gateway and authentication mode. See `docs/MODULE_OPERATIONAL_AUDIT.md`.

## WBGR-109 · 1799 BS · WENS

World Patro's symbolic balance module is publicly renamed **WBGR-109 · 1799 BS · WENS** throughout the landing page, command dashboard, WBE legacy routes and specialist-agent descriptions.

This does not alter the original mathematical model: 9 traditions × 9 grahas × 9 themes = 729 combinations and nine anchor gates. 1799 BS is treated as the user-defined designation, **not** an official date or a count of 1,799 gates.

New endpoints: /api/v1/wbgr, /api/v1/wbgr/gates, /api/v1/wbgr/assess, /api/v1/wbgr/snapshots. The original /api/v1/wbe endpoints and existing kind=wbe saved records remain compatible. New API gate codes include the older legacyCode value for references and search. See docs/WBGR_109_WENS.md.
