# WorldPatro Moon Observatory · visual astronomy and 12 original rāśi vectors

Written: 2026-11-25 (Wednesday) · Draft v1.1 · Feature branch `feat/vedic-daily-hub-20261125`

## Features delivered
- `/app/moon`: large responsive lunar vector, 14 selectable local-day snapshots, four upcoming main Moon-phase timestamps, Moonrise/Moonset, calculated illumination fraction, geocentric distance, angular diameter and 12 unique custom zodiac/rāśi SVG paths.
- `GET /api/v1/moon/day`: validated `YYYY-MM-DD`, IANA timezone, location and locale through existing WorldPatro query logic.
- Navigation: Moon & rāśi accessible from daily nav and the Vedic daily hub, with portable selected day, timezone, lat/lon and language parameters.
- Independent reversible feature: no auth/database writes, new secrets, external APIs, copied copyrighted image assets or third-party scraping.

## Astronomy methodology / data honesty
- Moon phase longitude: `astronomy-engine@2.1.19` `MoonPhase(instant)`.
- Actual illuminated fraction: `Illumination(Moon,instant).phase_fraction`, not a value fabricated from a moon emoji.
- Geocentric distance: `EclipticGeoMoon(instant).dist × 149,597,870.7 km/AU`.
- Angular diameter in arcminutes: `2·atan(1737.4 km / geocentric distance)·(180/π)·60`, using an approximate physical lunar radius.
- Four future milestone events: `SearchMoonPhase(0,90,180,270)`, geocentric Sun/Moon ecliptic longitude differences, rendered in requested IANA timezone. These are events **after selected local noon**.
- Fourteen daily snapshots at the user's **selected local noon**, including 3 earlier dates and 10 later dates. The eight moon-phase icon families are classified in 45° phase-longitude bands, not authoritative lunar festival dates.
- Sidereal Moon rāśi: WorldPatro's current approximate Lahiri longitude / 30°, resulting in 12 equal zodiac *signs*. **Not IAU star constellation geometry**; not a prediction, not a user's natal sign.
- Apparent diameter is geocentric and illustrated by subtle changes to the large 350px SVG: the design is **not physically to scale**. Real physical Moon diameter is effectively constant in this context.
- Moon visual is stylized with right-lit waxing / left-lit waning corresponding to a **Northern Hemisphere illustrated view**; actual observer orientation and terminator rotation vary with location and time. Include explicit caveat when presenting globally.

## Sign icon inventory
1. Mesha / मेष / Aries — stylized horns
2. Vrishabha / वृष / Taurus — horned circle
3. Mithuna / मिथुन / Gemini — twin columns
4. Karka / कर्कट / Cancer — curved shells
5. Simha / सिंह / Leo — tail swirl
6. Kanya / कन्या / Virgo — curved folded glyph
7. Tula / तुला / Libra — balance horizon
8. Vrishchika / वृश्चिक / Scorpio — rising tail
9. Dhanu / धनु / Sagittarius — arrow
10. Makara / मकर / Capricorn — rising/curved horn
11. Kumbha / कुम्भ / Aquarius — paired waves
12. Meena / मीन / Pisces — opposite arcs

These are newly authored stroked SVG paths, self-contained (no copied icon set/font). They support arbitrary resolution.

## UI & accessibility acceptance
- Large Moon and all text remain usable on widescreen and narrow/mobile layouts.
- Date form and all 14 date controls are keyboard operable. The selected lunar-day control has `aria-pressed`.
- SVG icons have meaningful screen-reader labels. Exact phase event times use `<time dateTime>`.
- No animated background loops; reduced-motion preference respected.
- API returns 400 on invalid local dates or timezone; missing astronomical values must not be replaced with fabricated data.
- Regression: `scripts/validate-moon-api.mjs` runs in the PR CI smoke stage along with typecheck, build, existing Vedic tests and other production smoke tests.

## Later improvements (not delivered here)
- Topocentric apparent lunar size/orientation by observer, parallactic angle and precise real-time lunar disk rotation.
- Planetarium map, constellation atlas and lunar eclipses by geographic visibility.
- Source-reviewed Nepal lunar festival/ritual overlays with official/nepali publisher rights and verified year-specific dates.
- Full moon-phase month view, offline cache of date-stamped calculations, export/notifications.
