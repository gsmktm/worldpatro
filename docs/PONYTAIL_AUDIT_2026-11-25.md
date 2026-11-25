# WorldPatro — Ponytail engineering correction audit

Written: 2026-11-25 (Wednesday) · Audit v1 · Target: `main` plus open Vedic-icon PR #37

## What this repository does and assumed load

WorldPatro is a public, Nepal-rooted Next.js calendar/Panchang and time site, with optional signed-in personal and administrative modules. Review assumes public traffic across timezones and potentially concurrent authenticated users; there is no verified SLO or complete traffic profile. This is a **critical-path audit**, not a claim that every file or live integration was tested.

## Skill installation — verified, no duplicate package added

Six `SKILL.md` files already exist under `.agents/skills` and `AGENTS.md` enables **Ponytail full mode** by default. On 2026-11-25 the content and Git blob hashes of all six matched current [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) upstream:

- ponytail · `d64edd32265ba21cbf5270158f04e97d96925f27`
- ponytail-review · `a50e3ac6ded6fccc9edae34ce37877bbce11e3fa`
- ponytail-audit · `ff9a95480700600fe2664d2d0906a4d750b2da0b`
- ponytail-debt · `3124f520a65d2a4fa75a2f5db6225c38ebdb8620`
- ponytail-gain · `1edff0e461fad6b671733ea6796aea9e417e266b`
- ponytail-help · `34fccb3ff542b3b8d4d131e6120a1812c9c4617a`

Ponytail is a set of agent instructions, **not** a code formatter, automatic error fixer, build plugin or proof of correctness. Adding a second installation, extra npm dependency or global shell scripts is unnecessary. Root agent policy retains license, security and authority boundaries. Source: <https://ponytail.dev/>.

## Corrected concrete code findings

### 1. Must fix — unbounded Node major selection on Vercel

**Case:** Production Vercel build log for commit `34f8a6b` reported that project setting Node `24.x` was overridden by `"engines":{"node":">=22"}`, automatically selecting Node `26.x`. CI was still Node 22. That silently changes production behavior without testing the same version.

**Minimal fix:** Set `package.json` and root `package-lock.json` engine to `24.x`, update GitHub CI's setup-node to 24, and have `/api/v1/health` report `process.version` rather than a stale static range. The installed skill validator and production smoke test check those invariants. A deployment after PR review is required for the real Vercel runtime to change.

### 2. Should fix — selected timezone ignored for missing-date API queries

**Case:** `readPatroQuery()` defaulted `date` via Kathmandu `dateInNepal()` even when a request specified `tz=Pacific/Honolulu` or `tz=Pacific/Kiritimati` and no `date`. Those zones can be a civil day apart, so such Moon/Panchang/Vedic API responses could represent the wrong day.

**Minimal fix:** For a missing `date`, derive the civil day using `dateInTimezone(new Date(), tz)` and propagate invalid timezone as an existing validation error. All explicit-date behavior stays unchanged. The existing Vedic API test checks both timezone extremes with a before/after clock allowance for midnight races. There are no new date conversions or festival claims.

### 3. Should fix — malformed explicit Origin treated as missing

**Case:** `isBrowserSameOrigin()` called `requestOrigin()`, which returned null both for a missing `Origin` and for present malformed/opaque values like `Origin: null`. An invalid **explicit** header was accidentally accepted as if absent, before subsequent user authentication.

**Minimal fix:** Distinguish a missing header from one provided with an unparsable origin. Reject the latter while retaining missing-Origin support for properly authenticated nonbrowser clients. Smoke tests ensure `Origin: null` and `Origin: not-a-valid-origin` return 403 in production authenticated mode. No authentication bypass is claimed to have been demonstrated; this is a fail-closed defense-in-depth improvement.

## Open operational findings requiring account access

### 4. Must investigate — live Supabase network unavailable

**Verified at 2026-11-25T17:04Z:** Production `/api/v1/supabase/status` returned `network-error`, `connected:false`, and `httpStatus:null`, despite `/api/v1/health` reporting environment configuration. The connected Supabase management app currently lists **no available projects**, so we could not inspect project health, DNS, public Data API exposure or RLS. Do **not** make up migrations, weaken RLS or reconfigure secrets as a guess. The operator should verify the project listed in `docs/SUPABASE_LIVE_SETUP.md`, read `/api/v1/supabase/status`, and then run the existing schema, Auth and ownership checks through the correct secure admin account. The correction branch does **not** imply user database readiness.

### 5. Must investigate — repository branch protection and real-user security

The older `docs/ENGINEERING_AUDIT_2026-11-17.md` recorded an unprotected main branch; this audit did **not** reverify live protection settings. Require review and CI in GitHub admin before claiming protected releases. Static RLS SQL checks and unauthenticated smoke tests are not substitutes for a live owner/other-user/admin matrix. No production secrets or private rows were read or changed.

### 6. Separate preview — new Vedic icon PR #37

The existing draft [PR #37](https://github.com/gsmktm/worldpatro/pull/37) contains 41 additional icons on a **separate feature branch**. The current audit starts from main and does not merge or alter that still-unreleased PR. The fixes must pass its tests once that feature is rebased or merged.

## Validation matrix

| Check | Evidence required |
| --- | --- |
| Six skills + Ponytail Full policy | `node scripts/validate-agent-ui.mjs` |
| Node and lockfile/CI agreement | `node scripts/validate-agent-ui.mjs` |
| Date-only input in distant timezones | `scripts/validate-vedic-api.mjs` in production smoke |
| Null/malformed Origin protection | `scripts/smoke-production.mjs` |
| TypeScript, existing astronomical tests, icon assets | CI `npm run typecheck`, `npm run test:vedic`, `npm run test:icons` |
| Production build and rest of API | `npm run build` and complete CI smoke |
| Live Vercel | PR preview deployment READY and HTTP probes; production only after explicit merge |
| Supabase, RLS, login, external services | **Unverified** without connected project and real test accounts |

## Not audited or modified

All source files were **not** exhaustively read: focus was runtime/tool configuration, shared civil-date parser, agent request origin validation, its callers/smoke tests, and documented operational database paths. Payment systems, unrelated Git repositories, private Firebase/Supabase rows, browser hydration, device accessibility, and load tests remain outside scope.

**Verdict:** Ship these narrow fixes after GitHub CI and preview pass. Do not present the live database as connected or conflate a passing build with complete operational readiness. Ponytail's smallest-safe-change principle is met: no new dependency, no duplicated skills, no schema changes.
