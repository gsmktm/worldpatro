# World Patro · Jyotish Observatory

Date: 2026-10-14

## Product inspiration, independently implemented

Reference feature research: https://vedicmarga.com/ and https://celeb.vedicmarga.com/. The sites publicly demonstrate a calculator catalogue, Panchang, planetary transits, chart-aware astrology and public-person discovery. World Patro uses an original Nepal-first interface and the repository's own existing astronomical engine. No third-party code, artwork, proprietary horoscope content or bulk databases were copied.

## New routes

- /app/jyotish-explorer — 10 searchable working entry points, six new read-only quick birth calculations and an interactive nine-graha transit desk.
- /app/people — curated searchable public biographies with categories and pagination.
- /app/people/[slug] — individual public profiles, biographical source links and explicit birth-time quality.
- POST /api/v1/jyotish/quick — Moon rashi, Lagna, nakshatra, D9, nine grahas and Vimshottari.
- GET /api/v1/jyotish/transits?date=YYYY-MM-DD — sidereal geocentric positions sampled at 12:00 Asia/Kathmandu.
- GET /api/v1/jyotish/people?search=&category=&page= — bounded public biography search.

Existing Kundli, Panchang, Muhurat and WENS calculators are linked directly rather than cloned. This addition does not require new database tables or authentication.

## Method, provenance, privacy

- World Patro uses astronomy-engine with a Lahiri/Chitrapaksha approximation. This is not an exact Swiss Ephemeris reproduction; historical timezone and sign-boundary cases must be cross-validated.
- Public birth times are marked unverified unless a primary source documents them. Do not infer birth-time-sensitive charts from unknown times.
- Queen Elizabeth II's time is recorded by the Royal Family. Historical timezone and location still need checking before creating a public chart.
- Transits are date-specified noon snapshots, not continuously sampled live ingress timestamps, life-event forecasts or scientific evidence for astrology.
- Rahu and Ketu are mathematical mean lunar nodes, not physical planets.
- No birth details are saved by these endpoints. The existing Kundli authenticated report save remains a separate explicit action.
- Each biography supplies a direct source URL and original editorial summary. All people require human curation and fact verification.

## Scope boundary

The reference site's complete set of 43 calculators, matching/Ashtakoota, named Raj Yogas, Shadbala, Sade Sati chronology, consultation booking, a bulk celebrity chart corpus and chart-aware AI chat are not implemented by this PR. Only truthful ready tools are clickable. Advanced modules need new methods, independently reviewed test fixtures, source/licensing assessments and explicit privacy safeguards.

## Acceptance

After Next.js build, run:

    BASE_URL=http://127.0.0.1:3100 node scripts/validate-jyotish-explorer.mjs

CI also runs typecheck, astronomical fixtures, production smoke and the existing regression checks. This is not evidence of live production deployment, private Supabase connectivity or external ephemeris parity.
