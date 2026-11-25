# World Patro — Researched Iconography Atlas

Written: 2026-11-25 (Wednesday) · Draft v1.0
PR: https://github.com/gsmktm/worldpatro/pull/35
Route: `/app/symbols` · Registry: `src/lib/world-iconography.ts`

## Why this exists

WorldPatro needs a coherent, original, accessible symbol vocabulary for a Nepal-rooted but globally plural calendar and learning platform. The existing navigation SVGs and 12 zodiac illustrations should be reused rather than adding icon packages, fonts or copied website artwork.

**Research classification:** Traditional names and conventions are references. The shapes are **new editorial design motifs**, not replicas of canonical temple carvings, religious seals, astronomical constellation shapes, or proprietary visual assets.

## Actual inventory

| Category | Count | Representational method |
| --- | ---: | --- |
| 27 Nakshatras | 27 | Named star-manor associations rendered as individually different original line motifs |
| Navagraha | 9 | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, ascending node Rahu and descending node Ketu |
| 9 global calendars | 9 | Neutral date-system markers, distinct from religious authority labels |
| Panchang five limbs | 5 | Vara, Tithi, Nakshatra, Yoga, Karana |
| Everyday tools | 8 | Birth chart, Muhurat, celebrations, graha, Moon, day/night, documented source and world |
| 12 Rāśi | 12 | Reuses existing one-of-a-kind original SVG symbols from the Moon Observatory |
| 8 Moon phases | 8 | Reuses existing phase MoonDisk SVG illustrations; northern-view orientation caveat |
| **Total** | **78** | 58 new line vectors + 20 existing original Moon/rāśi symbols |

The gallery has Nepali/English names, searchable metadata, eight visual family filters (including the "all" mode), keyboard-accessible buttons, and **Copy SVG** which copies the actual rendered SVG markup—including the Moon disk's internal gradient and clipping definitions. All drawings scale cleanly, and none downloads external fonts or assets.

## Icon system tokens

- Viewbox: `0 0 24 24` for line symbols; scalable vector composition.
- Strokes: `currentColor`, 1.45 px default; rounded line ends and joins.
- Background: WorldPatro midnight / Himalayan teal; foreground antique gold / pale ivory.
- Nav text and label are primary; the icon never replaces the text.
- Meaningful symbols: SVG has `role="img"` and accessible `aria-label`. Decorative icon in a labeled button uses `aria-hidden="true"`.
- UI states: keyboard focus outline, visible selected category, responsive 6→5→4→3→2-column grid and reduced-motion setting.
- Privacy: clipboard interaction only after the user's click, no analytics, tracking, network icon fetch or publication.

## Research review and source provenance

1. <https://www.drikpanchang.com/tutorials/nakshatra/nakshatra.html> — reference for the ordered 27 nakshatra names; no icons, data tables or copyrighted art copied.
2. <https://www.nepaljyotish.org/en/nakshatra-names/> — Nepal-specific English/Devanagari name conventions; verify regional spelling when maintaining localization.
3. <https://paramarsh.app/patrika/nakshatras/27-nakshatras-complete-guide> — source illustrating that symbolic associations (animal, tool, deity, etc.) may be listed differently; original motifs are design interpretations, not official renditions.
4. <https://www.carc.ox.ac.uk/XDB/DMS/Classical%20Art%20and%20Ancient%20India%20e-Book.pdf> — academic perspective on Navagraha in classical art; Rahu and Ketu are lunar nodes rather than material planets.
5. <https://design-system.w3.org/styles/svg-icons.html> — W3C SVG accessibility naming guidelines.
6. <https://lucide.dev/> — external open-source icon-system benchmark (ISC licensed), not embedded or copied as a dependency.

### No authority confusion

- **Astronomy:** computed Moon phases / geocentric quantities are not shown as nakshatra emblems or religious approval.
- **Tradition:** a 27-nakshatra sign is an **illustrative** design. Artwork does not determine an individual's natal nakshatra, auspicious times, a deity's form or a festival.
- **Navagraha:** Surya and Chandra are luminaries; Rahu and Ketu are the ascending/descending Moon-node concepts. The word "graha" does not mean nine physical planets.
- **Global calendars:** symbols are representative calendar abstractions; authoritative date releases remain source-labeled in the normal WorldPatro data API.
- **Nepal identity:** references to Om, Nepal Sun–Moon and Newa Mandala are context-specific design elements, not interchangeable with Buddhist, Jewish, Islamic, Persian or Chinese symbols. No cross/church icon is part of the atlas.

## Testing and release

- `npm run test:icons`: verifies all 58 new icon records, key uniqueness, valid path token conventions, 12 unique existing rāśi paths, reuse of 8 Moon phases, SVG copying, route and navigation integration.
- `npm run typecheck`, `npm run build`, `npm run test:vedic`, production smoke: GitHub PR CI.
- Confirm browser-level SVG clipboard permission behavior on HTTPS, both mobile and desktop. The clipboard API can be unavailable in some browser contexts.
- No primary database writes, no new packages and no deployment to `main` without PR merge.

## Later extensions

Tradition-reviewed motif choices per region/text, studio exports to sprite sheets, alignment of category tiles throughout the home screen, graphical audit with actual mobile screenshots, high-contrast contrast review, and a source-cited alternate Nakshatra symbol picker. These are **not** claimed as delivered.
