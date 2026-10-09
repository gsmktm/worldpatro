# World Patro · WBE-9

**World Patro — Global Calendar & World Balance OS**

A Nepal-origin, globally neutral platform concept combining:

- **9 Calendars → One Patro**
- provenance-first calendar/date conversion
- Vedic Panchang as an astronomy-dependent sacred-time layer
- WBE-9 symbolic balance framework
- **9 traditions × 9 grahas × 9 powers = 729 Gates**
- a one-click command-center architecture for future public world intelligence

## Important truth boundary

This repository intentionally does **not** invent calendar dates.

The clean core currently calculates Gregorian, Islamic Civil Hijri, Chinese, Hebrew, Persian Solar Hijri and Thai Buddhist Era through the runtime's ICU/Intl calendar implementations.

Bikram Sambat and Nepal Sambat return explicit source-required states until validated versioned data/rules are connected. Vedic Panchang returns an ephemeris-required state until the astronomy/location pipeline is connected.

That is a product feature, not a failure: World Patro must distinguish **CALCULATED**, **OFFICIAL TABLE**, **ASTRONOMICAL EPHEMERIS**, **OBSERVATIONAL**, and **CURATED RULESET** data.

## WBE-9

WBE-9 is a symbolic comparative framework, not doctrine or scientific proof.

Nine anchor spokes are used as a design mandala; the complete cross-product generates exactly **729 Gates**. Cross-gates are comparative lenses and must never be presented as claims that a faith is ruled by a graha or foreign concept.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## API

- `GET /api/v1/health`
- `GET /api/v1/patro/today?date=2026-10-08`
- `GET /api/v1/wbe/gates?page=1&limit=27`
- `GET /api/v1/wbe/gates?anchors=true`
- `POST /api/v1/wbe/assess`

Example:

```bash
curl -X POST http://localhost:3000/api/v1/wbe/assess \
  -H 'content-type: application/json' \
  -d '{"scores":[6,5,8,7,6,7,5,8,4]}'
```

## Next production phases

1. authoritative/versioned Nepal BS connector
2. expert-reviewed Nepal Sambat lunisolar model
3. real Panchang astronomy pipeline with ephemeris, timezone and location
4. source registry + claim/evidence model
5. country/leader/diplomatic public-data connectors
6. Postgres/PostGIS persistence
7. auth, RBAC/ABAC, audit logs
8. notification/watchlist engine
9. safe order/workflow center
10. citation-first AI research copilot

## Design doctrine

**FACT → SOURCE → METHOD → VERSION → CONFIDENCE → INTERPRETATION**

WBE symbolism always remains visibly separate from empirical data.
