# World Patro OS · Engineering Agent Guide

Apply [Ponytail](.agents/skills/ponytail/SKILL.md) in **full** mode by default to coding work in this repository.
Source: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) at commit `96608e078b2d5ea607c5c3b8b5a54d1c1fba6846`, MIT. License retained in [PONYTAIL_LICENSE.txt](docs/third-party/PONYTAIL_LICENSE.txt).

## Local skills
- [Ponytail](.agents/skills/ponytail/SKILL.md) — smallest complete, safe change
- [Ponytail review](.agents/skills/ponytail-review/SKILL.md) — review diff, callers and tests
- [Ponytail audit](.agents/skills/ponytail-audit/SKILL.md) — ranked repository audit
- [Ponytail debt](.agents/skills/ponytail-debt/SKILL.md) — deliberate shortcut ledger
- [Ponytail gain](.agents/skills/ponytail-gain/SKILL.md) — upstream benchmark context
- [Ponytail help](.agents/skills/ponytail-help/SKILL.md) — command reference

## Repo-specific hard requirements
1. Nepal BS/AD dates must keep verifiable source and explicit `municipality-published` versus `public-open-dataset` classifications. Never invent Tithi, festivals, authoritative Muhrat or additional conversion coverage.
2. Astro calculations must state their method, timezone and approximation; they are not government or scientific proof of personal predictions.
3. Do not scrape Ashesh or Hamro Patro proprietary calendar data. Preserve linked publisher widgets and attribution.
4. No secret values in Git, documentation, logs or browser output. Supabase public keys are not proof of database connectivity; private rows need server identity and Row Level Security.
5. Keep validation, ownership checks, CSRF/source integrity, audit records, accessibility and privacy. Backend writes and deployment require explicit scope and evidence.
6. Prefer the existing Next.js, React, Zod, SVG Icon, CSS tokens and tests. New dependencies need a concrete unsolved requirement.
7. For any change affecting API behavior or date logic, inspect callers, update at least one regression test, run typecheck/build/smoke and verify production separately before claiming operational readiness.

## Release
Use a feature branch and reviewable PR. A green build does not certify live database, credentials, browser widgets or third-party service uptime.
