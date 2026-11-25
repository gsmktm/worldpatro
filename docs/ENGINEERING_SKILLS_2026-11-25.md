# WorldPatro · Audited Engineering Skills and Realistic Module UI

**Written:** 2026-11-25 (Wednesday) · **Version:** 1.0 · **Scope:** WorldPatro Next.js repository, not every unrelated GitHub repository.

## Situation and verified facts

Before this change, the shared navigation advertised **32** WorldPatro module routes, but `/api/v1/platform/modules` described only the **23** entries in `FEATURES`. Thus its command map was incomplete, while private services could be labeled `available` merely because a Supabase/Firebase configuration existed.

WorldPatro already installs six Ponytail skills and uses **Ponytail Full** as its top-level engineering guide. Keep that. Add only compatible skills with a concrete job and a retained license; do not install a forest of hooks or unrelated application runtimes.

## Selected, pinned, reviewed skill files

| Scope | Upstream | Local path | Upstream Git blob | License |
| --- | --- | --- | --- | --- |
| Reproduce hard bugs | [Matt Pocock: diagnosing-bugs](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs) | `.agents/skills/diagnosing-bugs/SKILL.md` | `d039541ddd1c46e6ddbd662fe99d49b686fc5e12` | [MIT](third-party/MATTPOCOCK_SKILLS_LICENSE.txt) |
| Accessibility/UI review | [ECC: accessibility](https://github.com/affaan-m/ECC/tree/main/skills/accessibility) | `.agents/skills/accessibility/SKILL.md` | `f0a08a25b7591fcdec69bd2d26e55bf103789886` | [MIT](third-party/ECC_LICENSE.txt) |
| Evidence-driven release | [Superpowers: verification-before-completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) | `.agents/skills/verification-before-completion/SKILL.md` | `7d45333cc4a49c57a80df6c1fe2fa777a207afbc` | [MIT](third-party/SUPERPOWERS_LICENSE.txt) |
| WorldPatro-specific UI consistency | Original project guidance | `.agents/skills/worldpatro-interface/SKILL.md` | Local original | Not third-party |

All copied `SKILL.md` files are text instructions, **not production dependencies**. No foreign installers or session hooks were run. No unchecked remote scripts, Claude-only settings or MCP servers were added.

### Evaluated as references, not blindly installed

- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) supplies optional visual/checklist practices, but its full package assumes external search scripts and data not required by this app.
- [Addy Osmani agent skills](https://github.com/addyosmani/agent-skills) offers frontend quality guidance; existing Next.js, CSS tokens and local SVG components are the implementation source of truth.
- [Karpathy-inspired guidelines](https://github.com/multica-ai/andrej-karpathy-skills) support explicit assumptions and surgical changes, already present in Ponytail.
- [anthropics/skills](https://github.com/anthropics/skills) covers general authoring and document skills; this repo's browser UI does not need document engines.
- Dify, cc-switch, Graphify, LobeHub, Deer Flow and unrelated application repositories are **full products**, not safe drop-in coding skills. JavaGuide, general code examples and video tools are not relevant to WorldPatro's Next.js runtime.
- Source-repository star rankings are not test results and do not demonstrate safety or performance.

## Realistic feature inventory implementation

**Source of truth:** `NAV_ITEMS` enumerates all navigable routes. `FEATURE_MAP` enriches the known 23 with detailed API contracts and implementation status. Remaining routes are marked `ui-route` until corresponding contracts exist. Group counts are computed from actual entries, avoiding drifting handwritten totals.

**Truthful states:** `available` means core interface only; `requires-database`, `requires-database-verification`, `requires-admin-role`, `requires-ai-access`, and `requires-published-sources` expose exactly what is still missing. The module API deliberately reports `backendConnectivityVerified:false` because a server environment variable alone cannot certify live database access.

The responsive, bilingual `/app/ecosystem` directory now displays every module with a clear readiness label, free-text search, group/readiness filters, independent diagnostic navigation, an empty state, user-activated refresh and accessible form labels. The system command map distinguishes **configuration** from a **verified connection**.

## Functional verification and release gates

- `node scripts/validate-agent-ui.mjs`: vetted skill identities, license notices and original Ponytail/accessibility conventions.
- `scripts/validate-route-graph.mjs`: every navigation route equals API inventory; each route returns HTTP 200; private feature gates cannot be mislabeled `available`; negative API checks retained.
- `scripts/validate-ecosystem.mjs`: SSR route, labels and readiness categories; existing calendar, festival and security regression tests.
- GitHub CI: pinned runtime, `npm run typecheck`, `npm run test:vedic`, `npm run test:icons`, checked data provenance, `npm run build`, production smoke test.
- Vercel **preview**: HTTP status of `/app/ecosystem`, `/app/system`, and `/api/v1/platform/modules`.
- Real readiness cannot be certified without separate Supabase/Firebase account testing, user-specific CRUD and RLS, representative mobile/desktop browser interaction, and source authority review.

## Outstanding production realities

The last documented public Supabase probe (2026-11-25, prior audit) returned `network-error` and `connected:false`. This change **does not** apply SQL or claim that issue is resolved. Source reliability for calendars, astronomy distinctions, cultural observances and third-party publishers remains guarded.

This PR is independent from existing draft PR #37 (new Vedic icons) and #38 (Node 24 / timezone / agent Origin fixes). It does not merge or deploy those PRs. Production release remains gated by explicit review and permission.

## Verdict

The full interface route inventory is now generated from navigation, not a partial static list. Special-purpose skills are installed selectively, with reproducible provenance. **A UI route is not the same thing as a completed, authorized production feature.** No dependency, new schema or unverified payment/auth service was added.
