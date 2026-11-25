# WorldPatro — Vedic reference-wide feature icon coverage

Date: 2026-11-25 · Implementation branch: `feat/vedic-tool-icons-20261125` · Draft v1

## Scope and factual basis

Public reference: <https://www.vedicpatro.com/> (consulted November 25, 2026). The homepage currently enumerates **41 tool-category names** across three visible groups: **10** calendar/time, **16** astrology/astronomy, **15** daily timing/life rituals. We researched the menu **taxonomy**, not proprietary frontend source files, images, SVG paths, animation, product branding, labels beyond ordinary functional topic names, or calculated religious data.

**Original artwork:** WorldPatro now has 41 newly created, independently authored, vector-only SVG pictograms corresponding to those **functional categories**, designed in the WorldPatro navy/teal/antique-gold system. Each is scalable, local and has no icon-font dependency. The existing 78-icon library (27 nakshatras, 9 navagrahas, 9 calendars, 5 limbs, 8 tools, 12 rashis, 8 lunar phases) remains intact. **Total = 119 original icons.** No scraping of competitor datasets or copying of competitor icons.

## Complete category coverage

### पात्रो तथा काल गणना / Calendar & time (10)
| Nepali | English | WorldPatro integration |
| --- | --- | --- |
| बिदा तथा पर्व | Festivals & holidays | Related module only (/app/festivals) |
| मिति रूपान्तरण | Date converter | Existing feature (/app/tools) |
| सूर्यक्रान्ति | Solar ingress | Related module only (/app/astrology) |
| वार्षिक पञ्चाङ्ग चक्र | Annual Panchang cycle | Related module only (/app/patro) |
| दैनिक क्रान्ति | Daily solar declination | Related module only (/app/astrology) |
| पञ्चक पात्रो | Panchak calendar | Icon only · unimplemented |
| अधिक मास | Intercalary month | Related module only (/app/learn) |
| ऋतु | Seasons · Ritu | Icon only · unimplemented |
| ब्रह्म मान | Brahma time scales | Related module only (/app/learn) |
| वैदिक सिकाइ | Vedic learning | Existing feature (/app/learn) |

### ज्योतिष तथा मुहूर्त / Jyotish & astronomy (16)
| Nepali | English | WorldPatro integration |
| --- | --- | --- |
| अवकहडा चक्र | Avakahada Chakra | Icon only · unimplemented |
| अभिजित् मुहूर्त | Abhijit Muhurta | Existing feature (/app/vedic) |
| जन्मकुण्डली निर्माण | Birth chart | Existing feature (/app/kundli) |
| कुण्डली मिलान | Chart matching | Icon only · unimplemented |
| ई-पाठ | E-path · readings | Related module only (/app/learn) |
| राशिफल | Horoscope · Rāśi | Related module only (/app/astrology) |
| तिथि | Lunar tithi | Existing feature (/app/panchang) |
| नक्षत्र | Nakshatra | Existing feature (/app/panchang) |
| योग | Panchang Yoga | Existing feature (/app/panchang) |
| करण | Half-tithi Karana | Existing feature (/app/vedic) |
| चन्द्र राशि | Moon Rāśi | Existing feature (/app/moon) |
| ग्रह गोचर | Graha Gochar | Related module only (/app/astrology) |
| ग्रह अस्त | Planetary setting | Related module only (/app/astrology) |
| ग्रह वक्री | Retrograde motion | Related module only (/app/astrology) |
| चन्द्र ग्रहण | Lunar eclipse | Related module only (/app/jyotish-explorer) |
| सूर्य ग्रहण | Solar eclipse | Related module only (/app/jyotish-explorer) |

### दैनिक शुभाशुभ तथा संस्कार / Daily times & life rituals (15)
| Nepali | English | WorldPatro integration |
| --- | --- | --- |
| चौघडिया | Choghadiya | Existing feature (/app/vedic) |
| होरा | Planetary Hora | Existing feature (/app/vedic) |
| लग्न | Lagna · Ascendant | Related module only (/app/kundli) |
| चन्द्रबल | Chandra Bala | Related module only (/app/muhurat) |
| ताराबल | Tara Bala | Related module only (/app/muhurat) |
| पञ्चक रहित | Panchak Rahit | Icon only · unimplemented |
| पुष्कर नवांश | Pushkar Navamsa | Icon only · unimplemented |
| विवाह | Marriage · Vivaha | Related module only (/app/muhurat) |
| ब्रतबन्ध | Bratabandha | Related module only (/app/muhurat) |
| गृह आरम्भ | House construction | Related module only (/app/muhurat) |
| गृह प्रवेश | Housewarming | Related module only (/app/muhurat) |
| व्यापारिक प्रतिष्ठान | Business opening | Related module only (/app/muhurat) |
| रुद्री जुर्ने | Rudri ceremony | Related module only (/app/muhurat) |
| अग्नि जुर्ने | Fire ceremony | Related module only (/app/muhurat) |
| अन्नप्रासन | Annaprasan | Related module only (/app/muhurat) |

## Integration and truth-boundary

- Each item appears in a searchable, responsive, bilingual three-section grid on `/app/vedic`.
- The exact same new SVG records are reusable in the `/app/symbols` filter: **41 Vedic tools**. The atlas now has 119 icons and 8 actual families (plus the All filter).
- A matching existing module is labeled **Available module**; an adjacent module is marked **Related module** and does not claim feature equivalence. Missing dedicated calculations are **Icon concept** cards with no clickable link.
- Links to existing modules inherit the selected Gregorian date, location, IANA timezone and language via WorldPatro's shared `href` helper.
- Symbols for rituals are illustration only, **not verified muhurat windows**. Historical calendar data, religious calendars and eclipse timings retain their existing source/precision warnings.
- Navagraha lunar-node convention and traditional planetary meanings must remain distinct from observational astronomy.

## Design system

- Consistent `24×24` SVG coordinate system; no image downloads, third-party fonts or copyrighted SVG imports.
- 1.6px rounded strokes; original icon medallion visual treatment on the Vedic hub at 39px illustration size in 76px circular field.
- Adaptive 5→4→3→2 column card grid; keyboard focus states; label in Nepali or English; no decorative icons without textual name.
- Status and interaction visibly distinct: linked cards for existing/adjacent modules, unlinked concept cards.
- `prefers-reduced-motion` respected; vectors use text color and stay crisp in high-density screens.

## Verification & release

- `npm run test:icons` verifies all 41 reference category IDs, lengths, distinct paths, SVG path character safety, status/route honesty, and total 119 icon coverage.
- `npm run typecheck`, `npm run build`, production smoke and Vedic API checks remain required.
- GitHub PR review and Vercel preview verification required before any production rollout.

## Not implemented by icon work

The 41 pictograms **do not** add new astrology calculations, a 108-pada algorithm, verified festival rules, or authoritative marriage/ritual muhurat data. Each missing feature needs independent implementation, review, licensed/verifiable sources and tests.

Sources: [VedicPatro homepage](https://www.vedicpatro.com/), [VedicPatro's description of nakshatras](https://www.vedicpatro.com/learn/nakshatra), [WorldPatro existing icon research](ICON_RESEARCH_ATLAS.md).
