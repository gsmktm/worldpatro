# Kundli and Vimshottari — World Patro archive migration

The user's Arko Jyotish TAR informed these explicitly scoped calculations. This engine is **not** a certified ephemeris or proof of predictive astrology.

## Delivered
- POST /api/v1/jyotish/kundli: no automatic persistence, Zod strict input, max 4 KiB JSON, validation errors.
- /app/kundli and /app/astrology: functional, responsive birth chart with grahas, houses, divisional charts, Vimshottari timeline, JSON export, optional private saving through existing authenticated /api/v1/reports.
- IANA local-time → UTC resolver rejects DST gaps and ambiguous repeated hours (rather than making up the hour).
- Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, mean Rahu and opposite Ketu using astronomy-engine, Lahiri J2000/precession approximation.
- Approximate Lagna and whole-sign/equal houses, latitude limited to 66 degrees for this approximation.
- Seven Vargas: D1/D2/D3/D7/D9/D10/D12; not presented as all 16.
- Vimshottari major/sub/sub-sub chronology: 365.25 day year basis, with partial first Mahadasha antardashas clipped from full major timeline.

## Limitations
1. Accuracy of degree, Lagna and divisional boundaries needs independent ephemeris golden-chart comparison before specialist/professional use.
2. Mean lunar node only; true-node and house-system variants remain pending.
3. Birth-time uncertainty directly propagates to Lagna, divisional results and Dasha boundary placement.
4. Not currently rate-limited through distributed WAF; configure before public high-traffic access.
5. This is a computation/interpretation service, not evidence of physical or medical consequences.
6. Saving birth date, time and location is an explicit account action; account data deletion/consent UI remains pending.
7. Comprehensive Shodashavarga, Yoga/Dosha, forecasts, Muhurat and festival calculations remain separate migrations.

## Regression
CI verifies date/timezone normalization for Nepal, nine grahas, seven divisions, Dasha output, JSON validation, Gregorian invalid dates, DST fold/gap and non-persistence disclosure.


## Privacy CRUD

Account holders may inspect a lightweight saved-Kundli list and permanently delete a selected report from their primary Firebase/Supabase storage through the authenticated /api/v1/reports/{id} endpoint. Backup/log retention and broader account-deletion policy are not yet automated.
