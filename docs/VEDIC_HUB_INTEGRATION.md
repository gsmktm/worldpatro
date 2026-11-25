# World Patro · Vedic daily hub (2026-11-25, v1)

## Purpose and reference

Feature-gap review of [VedicPatro](https://www.vedicpatro.com/) (public pages reviewed on 2026-11-25) for the original **World Patro OS**. We are integrating useful *concepts and independent calculations*, not copying the publisher's designs, scripts, images, festival datasets or proprietary Panchang records.

Vision: **Nepal-origin, nine-calendar, globally respectful time OS** — rooted in the Vedic/Panchang knowledge tradition but not imposing a religious calendar on other cultures. Keep civil time, astronomical measurement, authority/observance, astrological interpretation and the WENS/WBGR symbolic layer distinct.

## Implemented in this branch

- `/app/vedic`: original responsive Nepali/English daily dashboard; synchronized date, city, timezone, working navigation and quick access to World Patro modules.
- `GET /api/v1/vedic/day`: validates the same date and IANA timezone inputs as `/api/v1/patro/day`; recalculates the astronomical snapshot on request; explicitly returns source/tradition boundaries.
- **Five limbs**: Vara, Tithi, Nakshatra, Yoga and newly computed Karana. Tithi and Karana are *local-noon* instantaneous readings, **not their start/end-time predictions**.
- Sunrise, sunset, moonrise and moonset from the existing astronomy engine and selected location.
- **Daytime Choghadiya (8)**, **daytime planetary Hora (12)**, **Rahu Kala** and a conventional **Abhijit interval** calculated from *minute-rounded local sunrise/sunset* using standard weekday sequences. Interpretation is marked as traditional and region-dependent; these are **not certified Muhurat**.
- Clear unavailable state where valid solar-event data cannot be established.
- Existing nine-calendar statuses, Nepal BS municipal/open-dataset labels, protected reports, editorial sources, world knowledge, AI/agents and WENS are preserved. No database schema migration or production credentials are needed for this addition.
- Deterministic tests in `npm run test:vedic`.

## Existing World Patro connections

| Area | Current working destination | Trust boundary |
| --- | --- | --- |
| Nine calendars / BS↔AD | `/app/patro` | Municipal vs CC0 dataset must remain distinct |
| Full solar/lunar Panchang | `/app/panchang` | Approximate Lahiri astronomy, local noon |
| Birth charts / selected Varga / Dasha | `/app/kundli` | Calculation methods & limits disclosed |
| Event candidate windows | `/app/muhurat` | Traditional screening; individual review required |
| Graha observatory | `/app/astrology` | Astronomy separate from interpretation |
| Religious traditions | `/app/religions` | Reviewed sources; no fabricated event dates |
| Festivals | `/app/festivals` | Only published/reviewed records |
| Learning | `/app/learn` | Only published approved articles |
| Evidence and sources | `/app/sources`, `/app/authorities` | Provenance and retrieval history |

## Reference-site feature gaps — **not** claimed as complete

1. **P0: Panchang precision** — sunrise-anchored transitions and exact tithi/nakshatra/yoga/karana start/end times; Lahiri vs other ayanamsa profiles; ephemeris golden-date verification across city/zone combinations.
2. **P0: Calendar/observance sources** — authority-reviewed Nepal Sambat and official BS festival/holiday records with licenses, versioned provenance and clear uncertainty.
3. **P1: More auspicious-time views** — night Choghadiya, night Hora, Lagna, Chandra Bala, Tara Bala, Panchaka and regional variations; explicitly cite rulebooks/authorities and independent fixtures before publishing.
4. **P1: Advanced Jyotish** — Kundli Milan, Avastha, detailed Gochar, graha retrogression/combustion and eclipse models; accuracy and disclosure checks.
5. **P2: Daily rituals and learning** — verified e-Path texts and educational articles, user-chosen reminders, offline caching with dates of last update, search and accessible print/export.
6. **P2: Expansion** — region-specific ceremony categories (Vivaha, Bratabandha, Griha Pravesh, Rudri, Annaprashan) and festival push notifications under human-reviewed authority data.

No VedicPatro live API or reuse license was discovered or verified for this integration. Do **not** scrape the public site or describe its calculated results as World Patro data. Our "live" output means calculation from a user's selected date/location on request, **not** live certification or continuous streaming from the reference site.

## Calculation contract

- Only local-day astronomy is used as input to traditional daytime windows.
- Sunrise and sunset are minute-rounded `HH:mm` strings, so window boundaries are approximate to a minute. Abhijit uses the central fifteenth of the daylight interval; on Wednesdays it is not universally recommended.
- Planetary daytime Hora starts with the weekday lord, cycles Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars (repeated), then daytime is split into twelve equal units.
- Choghadiya uses eight equal daylight units, regional/traditional sequence and weekday-specific first unit; Rahu Kala uses an independent weekday position in eight equal daylight units.
- If solar event data is missing, reversed or unusable, intervals are unavailable rather than synthesized.
- Times are **local wall-clock labels**, not UTC instants; do not use as a high-precision DST-crossing astronomical engine.
- Karana: 60 half-tithi sectors at six degrees each (Kimstughna first; repeating seven variable Karanas; Shakuni/Chatushpada/Naga last). At Purnima/Amavasya the correct name is chosen from Paksha.
- Sources: `astronomy-engine@2.1.19` (existing), standard traditional weekday time tables (non-authoritative), source-aware World Patro civil calendar modules.

## Acceptance and release

Run `npm run test:vedic`, `npm run typecheck`, `npm run build`, then existing module tests and manual desktop/mobile keyboard/browser checks. Check API invalid dates/timezones, local-date rollover, short daylight and unavailable sunrise. Verify deployment and backend separately. This branch is review-only until PR approval; **no automatic production publishing or DB write**.
