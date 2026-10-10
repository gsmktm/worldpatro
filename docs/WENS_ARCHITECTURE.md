# WENS · World Equilibrium & Navagraha System

**Scope:** World Patro cultural-astronomical *interface*, not a replacement global time standard, faith authority, geopolitics engine or scientific theory.

## System composition

- Nine separately identified religious traditions (an editorial collection, not a classification of all world religions).
- Nine Jyotish grahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu. The first seven include two luminaries; the last two are lunar nodes **rather than physical planets**.
- Nine comparative powers/themes reused from the existing WBE catalog; none is said to govern a faith.
- A Cartesian 9×9×9 cube with **729** symbolic combinations.
- **WBGR-109** contains the nine diagonal keynote gates and 100 deterministic additional points (modular stride 73). The 109 is an editorial selection size, **not** 729 redefined and **not** a metaphysical measurement.
- The letter G in the center of the mandala is the project identity, not a claim to governmental or supernatural authority.

## Hanuman Dhoka 0°

The **symbolic** WENS zero is anchored to the Hanuman Dhoka Durbar Square UNESCO monument-zone location at N 27°42′14″ E 85°18′30″. Source: https://whc.unesco.org/en/list/121/maps/

Converted to decimal: 27.7038888889 N, 85.3083333333 E. The default elevation 1312 m is an approximate modeling parameter, not surveyed height of a monument. Never transform actual longitude to 0°; do not change UTC, IANA time zones, standard meridians, ayanamsa or ephemeris coordinates.

## API

- `GET /api/v1/wens/snapshot?date=2026-10-10`: time snapshot, existing nine calendar profiles, Panchang, nine calculated grahas, provenance, three thematic dimensions and the selected symbolic gate of date. The sampling instant is **local civil noon** (not a transit forecast, election prediction or natal chart).
- `GET /api/v1/wens/snapshot?date=2026-10-10&lat=27.7&lon=85.3&tz=Asia/Kathmandu`: another real observer position, with unchanged Hanuman Dhoka symbolic origin.
- `GET /api/v1/wens/gates`: paginated curated 109.
- `GET /api/v1/wens/gates?view=all`: paginated full 729.
- `GET /api/v1/wens/gates?view=all&tradition=1&graha=2&power=3`: specific cube selection, **1-based** filters.
- Existing `/api/v1/religions/observances` remains the authority-dependent festival feed. The API does not generate invented festival dates.

## Method and integrity

1. All date and timezone validation reuses `readPatroQuery` from World Patro.
2. Navagraha longitude reuses the existing approximate sidereal birth-chart engine, called at noon solely to extract planetary positions. House interpretations, natal predictions and dashas are **not** included in the WENS response. Rahu/Ketu use mean lunar nodes.
3. Religious observances are kept independent of planetary associations, with source/authority review.
4. Symbolic gates do not measure the balance of religions, countries or the world.
5. The public UI supports explicit date selection, per-dimension navigation, a disclosure layer, registry browser, JSON export and cross-links into independent modules.
6. Automated smoke checks verify 109, 729, the 0° symbol and nine calculated grahas.

## Roadmap / not implemented in this change

- Full regional festival feeds for every faith and jurisdiction require reviewed authorities and licensed data.
- Predictive world-balance or cross-religion causal scoring is intentionally not implemented; it would falsely imply evidence.
- Arbitrary location input is available through the API; the UI defaults to the Hanuman Dhoka reference.
- The legacy WBE-9 personal assessment stays intact for backwards compatibility.
