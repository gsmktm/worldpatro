# World Patro OS · Full-Stack and UX Engineering Audit
Written: Tuesday, 17 November 2026 · Version: Audit v1 · Base: `main@3dce2e5`

## What this repository does
Public, Nepal-origin Next.js 16/React 19 time, BS and other calendars, astronomical Panchang, Kundli, Muhurat, personal planner, research, source-backed festivals, WENS and bounded AI orchestration.
Expected load assumed: public multi-user read traffic plus signed-in account writes; no workload or SLO measurements supplied.

This is a **targeted critical-path audit**, not a certification of all 391 Git tree entries. Read: package/deploy/CI, calendar converter, icon/navigation, monthly UI and callers, planner, Supabase health and auth setup, database health UI, current public production probes. Did not modify external databases or credentials.

## Must fix / external work
1. **Supabase connectivity not verified.** Production `GET /api/v1/supabase/status` returned `network-error` with `connected:false` and `httpStatus:null` at 2026-11-17T07:41:26Z. `GET /api/v1/health` reports `supabaseConfigured:true` and `authenticatedBackendReady:true` from environment presence. A configured client is NOT a working user database. Inspect the correct Supabase project and URL/DNS/network in secure admin interfaces, then test separate users' reads and writes; no credentials have been accessed or changed.
2. **Branch protection absent.** GitHub main returned `protected:false`. Add required PR review + CI and protect main through repository administration. This connected GitHub toolset does not expose a branch-protection write action; don't claim protection enabled.
3. **Live database RLS/security and historical Firebase credential revocation not proven.** Source migration scripts/tests exist but do not certify the deployed schema. Verify via database advisors and separate anonymous/owner/other/admin accounts; require source-level credential rotation evidence.
4. **AI runtime not enabled.** Health returned `aiGateway.configured:false`. Enable only with a governed provider and per-user budget/rate limits; never silently enable paid AI calls.
5. **Calendar/observance authority boundaries remain.** BS 2083 reference coverage is present but full Panchang, Nepal Sambat and religious-observance permissions remain incomplete. Do not scrape proprietary Ashesh/Hamro records; keep publisher-hosted widgets and references.

## Fixed in this branch
6. **Ponytail installation.** Six reviewed MIT-licensed upstream `SKILL.md` files vendored under `.agents/skills/`, root `AGENTS.md` makes review/test/scope rules discoverable. No shell script, privileged plugin or app dependency installed.
7. **Icon duplication/semantics.** Navigation reused generic star, book, grid and layers for unrelated modules. Reuse existing local SVG component, add a small set of domain icons and map modules to their actual meaning; test that every named navigation icon exists. No new icon dependency.
8. **Calendar current-day access.** The month grid could highlight the selected date but not today's actual date or jump to it. Add timezone-aware `aria-current="date"`, a Today control, Nepali text and keyboard-target size; test the selected IANA timezone flows from the command center.
9. **BS source visibility.** Previously the month grid showed a tiny BS number without municipal versus open reference distinction. Add source hint and visible open-source styling, keeping official determination separate.
10. **Contradictory README backend instructions.** Documentation called Firebase both preferred and legacy while production configuration is Supabase-first; update wording without changing backend or migrations.

## Further engineering backlog (not shipped here)
- Private authenticated end-to-end workflows: signup, reset email delivery, CRUD isolation, export and deletion, RLS, staff publish approval.
- Broader browser/device matrix: narrow screens, screen reader, theme/language switches, third-party iframe permission and responsive behavior.
- Add secure observability for the difference between `backend configured` and `backend connected` in health and agent surfaces without breaking clients.
- Secure secrets inventory, disaster-recovery rehearsal, performance budgets, full BS year sources, festival review process, and audit of external API terms.

## Release gates
- `node scripts/validate-agent-ui.mjs` for all vendored skills, nav SVG names, today and timezone, CC0 source label.
- `npm run typecheck`; `npm run build`; previous CI astronomy/Supabase-source/calendar validations; full smoke suite.
- Manual preview of `/app`, `/app/patro`, `/app/system` on mobile and desktop. Automatic deployment must not be presented as authentication/RLS clearance.

## External documentation
- https://github.com/DietrichGebert/ponytail (commit `96608e078b2d5ea607c5c3b8b5a54d1c1fba6846`, MIT)
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- https://supabase.com/kb/troubleshooting/nxdomain-error-connecting-to-a-supabase-project
- https://github.com/gsmktm/worldpatro
