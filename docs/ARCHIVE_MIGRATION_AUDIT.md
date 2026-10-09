# World Patro — Uploaded Archive Integration Audit

**Inputs inspected:** 
- \`workspace-4d45df5f-3cde-4fdc-a468-b67ef42b8095 (1)(2).tar\` — Arko Jyotish / World Patro predecessor, 225 files (excluding Git metadata), 46 API routes, 25 Jyotish TS computation modules and 24 Jyotish UI components.
- \`cosmic-balance-design-prompt.zip\` — WBE-style visual prototype, 33 archive entries, Next.js + Drizzle/Postgres.

## Implemented in current World Patro

1. **Interactive WBE-9 Mandala:** inspired by the ZIP's layered nine-node wheel, rebuilt with accessible HTML controls rather than copying its direct SVG click handlers.
2. **729 Gate Explorer:** filters, pagination, nine keynote flags, focused selection and a meaningful gate detail.
3. **WBE secure full-stack snapshot API:** user-scoped authenticated persistence via current Firebase or Supabase adapter; Zod score validation, cross-origin write protection and 4 KiB request limit. The ZIP's unauthenticated \`seed\`, \`snapshot\` and \`action\` write routes have **not** been imported.
4. **9-calendar UI:** real date selection, location/timezone input, locale selection, method disclosure and authority-required state handling.
5. **Astronomical Panchang UI:** tithi, nakshatra, yoga, Sun/Moon rise/set and calculation provenance from the existing \`astronomy-engine\` service.
6. **Numerology Laboratory:** an independently implemented and checked migration of the TAR's self-contained Pythagorean/Chaldean algorithms, with personal, comparison and business-name API/UI tools. It is marked as cultural interpretation rather than scientific prediction.
7. CI: real Next.js build and HTTP smoke checks, including security outcomes and numerical-tool validation.

## Legacy engines reviewed, not directly migrated

The TAR's detailed computation core includes:
- Sidereal Sankranti/official-anchor Bikram Sambat engine
- Chinese lunisolar calendar engine (new moons, solstice month 11, leap-month rules)
- Panchang and astronomical provider abstraction
- Natal Kundli, Vargas, Dasha, Milan, Yoga/Dosha and Transits
- Festival rule engine, Muhurat search, Baby Names, Tarot and Vastu data.

These remain separately staged in the supplied source archive. Their implementation is not silently equated with the current lightweight World Patro APIs.

### Reasons the old apps cannot be blindly merged

- Database architectures differ: Prisma/SQLite in the TAR; Drizzle/Postgres in the ZIP; Firebase/Auth plus optional Supabase in World Patro.
- The old TAR's \`GET /api/v1/kundli\` list query has no visible user-scoped authorization check; copying it could expose saved profile data.
- The ZIP's \`POST /api/patro/seed\`, \`/snapshot\` and \`/action\` routes write without visible authentication/authorization and must not be deployed unchanged.
- ZIP's seeded harmony percentages and decrees describe imagined WBE states, not measured world indicators.
- The ZIP's nine religion/planet assignments differ from the user-provided Ninefold Pattern; final canonical pairings are preserved in \`src/lib/wbe.ts\`.
- Both archives use different UI/dependency stacks and the old TAR includes local database and environment files. Secret-bearing \`.env\` and \`db/custom.db\` are not carried into a deployment bundle.
- Current Nepal BS and Nepal Sambat authority profiles must remain explicit about estimates and missing releases; computing an astronomical estimate is not proof of an official civil-date declaration.

## Remaining engineering migration work

1. **Astronomy parity test harness:** bring the TAR's computation engine into an isolated \`packages/jyotish-legacy\` workspace and compare golden dates across BS, Chinese lunar, Panchang and Kundli. Do not replace validated production APIs before tolerance/authority tests.
2. **Birth chart:** make a typed canonical BirthContext, import the TAR's Kundli/Dasha/Divisional-chart pipeline, add strict date/timezone validation, optional Firebase user-owned report storage and deep compatibility tests.
3. **Festivals:** build country/tradition/denomination/authority profiles, using official releases where available.
4. **Admin and marketplace:** rework authorization, idempotent data mutations, moderation, user-owned consultation bookings and auditable workflows before exposing old admin/shop routes.
5. **Global UX:** finish localized Nepal Bhasa and broader language layer, WCAG auditing, print/PDF exports, and mobile device testing.
6. **Release ops:** secrets in Vercel, authorized Firebase Auth domains, deployed Firestore rules, configured AI Gateway, rate limits/WAF, E2E staging and production URL smoke verification.

**Do not claim every legacy feature is production-ready.** Working screens and endpoints are listed above; later migrations require tests and account/service credentials.

## Release verification

CI must validate full TypeScript compilation, Next.js production build, route rendering, nine-gate invariants, authenticated snapshot write boundaries and invalid-date rejection before merge to `main`.


## Phase 2 Kundli progress

A typed astronomy-based Kundli calculator and API have been introduced, including local IANA birth-time validation, sidereal planets, seven selected divisional charts, and Vimshottari major/subperiods. Other legacy engines are not yet production-validated; see `docs/KUNDLI_ENGINE.md`.
