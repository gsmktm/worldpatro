# World Patro · BS 2083 open calendar and publisher widgets
Written: 2026-11-17 (Tuesday) · Version: Proposed source integration v1
Branch: `feat/calendar-reference-open-bs-2083-20261117`

## Purpose
Provide year-wide BS 2083 date correspondence and optional, clearly attributed third-party calendar widgets without scraping proprietary event/Panchang databases or copying another publisher's visual design.

## Native BS 2083 reference
- Municipality-published reviewed correspondence remains retained for BS months 5–7 (Bhadra, Asoj, Kartik) with its original publisher/URLs.
- Other months of BS 2083 use the open CC0 nMiti calendar core as a separately marked **public open dataset**, with exact month starts and lengths. It is NOT presented as a Nepal government, Panchanga Samiti, festival, or Muhurat determination.
- Source: https://namunaone.github.io/nMiti/data.html (CC0-1.0)
- Independent public cross-check of BS 2083 Mangsir 1 / November 17 and Mangsir length 29:
  - https://www.ashesh.com.np/nepali-calendar/?month=Mangsir&year=2083
  - https://www.hamropatro.com/en/calendar/2083/8
- Native source status: `authority-sourced` for municipal source months, `public-dataset` for the CC0 months.
- BS converter API status: `municipal_source` or `public_dataset`; unsupported years still return 404 `authority_required`.
- No external widgets are used as machine-readable APIs or to overwrite World Patro's calculations. Other BS years are not extended by this change.

## Browser widgets
- Ashesh publisher widget: https://www.ashesh.com.np/nepali-calendar/widget/
- Hamro Patro publisher widget: https://www.hamropatro.com/en/widgets
- The two iframe widgets appear in a new original navy/gold/crimson World Patro panel under `/app/patro#calendar-references`.
- Widgets load **only after a user clicks a provider**; visitors see a third-party/privacy disclosure and a persistent linked attribution and original site.
- Widgets operate in their own external context, not linked to the selected World Patro date. If the publisher rotates or withdraws embed tokens or denies iframe embedding, the publisher link remains available.
- Do not remove required credit and do not crawl/scrape or reproduce publisher-maintained festival text, photos, logos, tables or UI.

## Acceptance
1. `node scripts/validate-calendar-sources.mjs`: 12 months, continuous 365 days, 2083 Mangsir 1=2026-11-17, Mangsir 29=2026-12-15, next month starts 2026-12-16; UI source credits.
2. `npm run typecheck && npm run build` and existing smoke CI.
3. `scripts/smoke-production.mjs` checks reverse conversion, provenance classification, and unsupported dates outside 2083.
4. Verify responsive external iframe loading and keyboard interactions in preview, and inspect content security/privacy controls.
5. No production deployment or permanent schema changes without explicit approval.
