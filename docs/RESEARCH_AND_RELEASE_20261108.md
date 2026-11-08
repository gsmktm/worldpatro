# World Patro · Product research and release decisions

Written: 2083 Kartik 22 BS / 2026-11-08 AD, Sunday
Posted/Published: tracked by this release's GitHub commit and Vercel deployment
Last updated: 2026-11-08
Version: 1.0

## Situation

The existing repository contains twenty functional or integration-ready core modules, plus observatory/public-profile/authority routes. Its previous home emphasizes platform architecture, while everyday calendar tasks are several links away. A separate initial design-foundation PR exists. This release carries those foundations into the working product, adds three core modules and preserves the existing engines and URLs.

Production deployment inspected: Vercel worldpatro under gsmktms-projects. Starting main: 3eb439504bf18e12c4d9153287bf475fa12ca6a4. Existing production health returned HTTP 500; runtime logs locate the failure in a Firebase dependency imported before provider selection.

## Reality: researched facts

| Source | Observed fact | Product implication |
| --- | --- | --- |
| Hamro Patro official product page | Calendar, Panchang, festivals, rates, news, radio and notes/reminders form a broad ecosystem. | Daily calendar utility is an anchor for discovery. |
| Nepali Patro official about/FAQ | Its product describes BS/AD/Nepal Sambat, personal calendars and offline basic utilities. | Personal organization and clear date context matter alongside content. |
| Kathmandu Metropolitan City calendar | Kartik 2083 runs October 18–November 16, 2026; the published grid pairs BS and AD dates and lists observances. | Add only this verified month to BS conversion; publish a bounded festival release. |
| Nepal Panchanga Nirnayak Bikas Samiti notices | The 2083 notices discuss calculation methods and a later clarification; authority decisions are specific and versioned. | Do not equate an algorithm, municipal calendar or symbolic system with official Panchang approval. |
| Firebase Admin upstream issue #3181 and Auth0 #507 | CommonJS jwks-rsa can attempt to require ESM-only jose; upstream reports match the observed production stack. | Isolate unused provider imports and apply a scoped compatibility override, then test production Node loading. |
| Supabase server-side auth guidance | Server verification and row-level ownership remain necessary for private data. | Reuse verified session and owner-protected storage; do not expose server secrets or trust user-supplied owner IDs. |
| RFC 5545 | Calendar text has escaping, CRLF and UTF-8 octet-based folding rules. | Export real all-day calendar events, including Nepali text, with non-inclusive next-day DTEND. |
| WCAG 2.2 | Keyboard operation, visible focus, unobscured controls and minimum target dimensions matter. | Use modal semantics, labelled controls, focus outlines, reduced motion and adequately spaced actions. |

These are product/design observations, not claims that competitor designs were copied or that every advertised third-party feature was independently tested.

## Options

| Option | Benefit | Cost / risk |
| --- | --- | --- |
| More modules in the existing long menu | Lowest initial restructuring cost | Daily tasks remain hard to find; route duplication persists |
| Separate apps for each service | Independent ownership and releases | Fragmented context, accounts and maintenance |
| One daily workspace with layered discovery — selected | Clear entry point, shared design, portable date context and retained engines | Requires consistent navigation, accurate capability states and ongoing UI maintenance |

## Best move: delivered architecture

1. Lead with the selected civil day, published BS correspondence, astronomical reading and next reviewed festivals.
2. Put calendar, festivals, planner and utilities in immediate reach.
3. Give advanced Jyotish, WENS and research a searchable ecosystem and grouped menus.
4. Apply one shell/theme across every retained screen.
5. Use plain provenance: calculated, authority-sourced, interpretation, symbolism or unresolved.
6. Keep account writes authenticated and optional; retain a usable device planner.
7. Repair the real production module-loading failure and test the complete route/API graph before release.

## Ecosystem map

| Product area | Included capability | Dependency / boundary |
| --- | --- | --- |
| Daily time | Nine calendar profiles, Panchang, local sunrise/sunset, month navigation | Astronomy is instantaneous at selected local noon; calendar systems retain their methods |
| Nepal calendar | Reviewed AD↔BS in Bhadra/Asoj/Kartik 2083 | Other months/years need reviewed data; Nepal Sambat lunar profile remains authority-required |
| Culture | Reviewed Kartik festivals, source links, planner links, ICS | Municipality-level dates; no national holiday or ritual saait certification |
| Personal | Event CRUD, notes, completion, filters, JSON/ICS exports | Device storage is separate from optional account storage; no scheduled notifications |
| Everyday tools | Civil date/age calculation, digit conversion, world clocks | Gregorian civil arithmetic and browser timezone database |
| Jyotish | Existing Kundli, Vargas, Dasha, Muhurat, numerology and observatory | Approximate astronomy limits and traditional interpretations remain visible |
| World | Existing country data, earthquakes and FX connectors | Upstream availability/freshness must be checked per response |
| Knowledge | Research notebooks, sources, public profiles, reviewed articles | Private work requires authentication; published content depends on editorial records |
| WENS | WBGR-109, 1799 BS designation and 729 symbolic gates | Symbolic framework is not scientific causation or prediction |
| Operations | Existing workflows, roles, admin and consultation requests | Requires live backend permissions and existing policy validation; booking is a request, not a confirmed service |
| Platform | Search, mobile menus, appearance, URL compatibility and install metadata | Full content localization and complete offline cold-start are not part of this release |

## Risks and concrete limits

- Supabase project management access returned permission denied. No production database migration was attempted. Authenticated planner writes, signup/recovery delivery, role policies and existing private CRUD cannot be certified from anonymous tests.
- Existing schema hardening files and audit findings still need live privilege/advisor checks against the actual project. A source-level SQL check is not a live RLS test.
- Calendar coverage is three reviewed months, not a complete BS year or a historical conversion library.
- Festival coverage ends November 16, 2026; no annual/lunar recurrence is fabricated.
- Appearance and navigation span the app; retained studios are not all translated into Nepali.
- Manifest metadata supports home-screen use but does not promise cached offline pages.
- Device records depend on browser storage. Exports provide portable copies.
- No payment, subscription, video-call provider, native push delivery or automatic AI action is represented as completed.

## Next step: evidence-led expansion order

| Priority | Work | Acceptance evidence |
| --- | --- | --- |
| 1 | Restore access to the existing Supabase project; verify schema/security and real account flows | Separate test users; owner/other/admin/anonymous direct API and RLS tests |
| 2 | Obtain reviewed BS and Nepal Sambat datasets and authority notices | Versioned source releases, complete boundary/roundtrip tests, independent cross-checks |
| 3 | Expand festival records to a full reviewed annual release | Regional variants, authority links, correction history and explicit ritual timing scopes |
| 4 | Add opt-in notification delivery | Timezone-safe schedule, explicit consent, delivery receipt, cancellation and retry evidence |
| 5 | Add trustworthy utilities from available providers | Source timestamp, freshness state, outages/fallbacks and provider terms |
| 6 | Mature consultations and commerce | Real expert publishing, availability, consent, payment/reconciliation/refund tests |
| 7 | Broaden localization, installability and accessibility | Human-reviewed Nepali strings, device installs, screen-reader/contrast and performance audits |

## Source register

All references below were consulted or retrieved during this work on 2026-11-08. Retained historical source-month checks remain dated separately in code.

- Hamro Patro official product/features: https://www.hamropatro.com/en/apps/nepali-patro
- Hamro Patro web update description: https://hamropatrowebsite.hamropatro.com/en/whats-new
- Nepali Patro about: https://nepalipatro.com.np/en/about
- Nepali Patro FAQ: https://nepalipatro.com.np/en/faq
- KMC published month grid: https://kathmandu.gov.np/en/calendar
- NPNS 2083 clarification: https://npns.gov.np/content/13/press-release-20251216/
- NPNS subsequent publication notice: https://npns.gov.np/content/18/notice-regarding-publication-of-panchang/
- Firebase Admin issue: https://github.com/firebase/firebase-admin-node/issues/3181
- Auth0 jwks-rsa issue: https://github.com/auth0/node-jwks-rsa/issues/507
- Supabase Next.js account/server auth: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
- Supabase server-side auth: https://supabase.com/docs/guides/auth/server-side
- RFC 5545: https://www.rfc-editor.org/rfc/rfc5545.html
- W3C target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- W3C focus appearance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance
- MDN manifest reference: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference

The attempted Supabase changelog markdown fetch was unsupported by the search fetcher; relevant current implementation guidance was obtained from Supabase's documentation connector instead.
