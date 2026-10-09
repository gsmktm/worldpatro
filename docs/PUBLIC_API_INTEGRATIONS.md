# Public API Integration Policy

World Patro uses the `public-apis/public-apis` repository as a **discovery catalog**, not as a trust authority and not as a runtime dependency. Every selected API is reviewed against its own current documentation before production use.

Verified: 2026-10-09.

## Selected now

| Provider | Role | Auth | World Patro status | Trust boundary |
| --- | --- | --- | --- | --- |
| World Bank | population/GDP indicators | none | active | Tier A official API |
| USGS Earthquake Hazards Program | earthquake events and hazard intelligence | none | active | Tier A official API |
| Frankfurter v2 | FX reference/historical rates | none | active | Tier B aggregator over central-bank/official sources |
| Nager.Date | global civil public-holiday fallback | none | guarded | Tier C community aggregator; not Nepal authority |
| NASA Open APIs | space/NASA enrichment | API key recommended/configured | optional | Tier A official API |
| REST Countries v5 | normalized country metadata | API key | optional | Tier B aggregator |
| OpenCage | hosted geocoding | API key | optional | Tier B hosted open-data aggregator |
| Nominatim public OSMF service | development geocoding fallback | none | opt-in only | strict shared-service usage policy |
| Open-Meteo | weather/climate | conditional | optional | free hosted API is non-commercial; commercial customer API uses a key |

## Explicit non-substitutions

- World Patro's Panchang and astronomical sacred-time engine is not replaced by a third-party astrology API.
- Nepal public holidays are not treated as authoritative when returned by a generic holiday aggregator. The Nepal holiday layer remains authority-required until an official/reviewed Nepal government source is connected.
- Religious observance dates remain tradition/denomination/jurisdiction aware; a generic holiday API cannot become the universal religious calendar.
- World Bank indicator values remain World Bank-sourced even if another country API exposes similar values.

## Environment variables

Server-only optional keys:

- `NASA_API_KEY`
- `REST_COUNTRIES_API_KEY`
- `OPENCAGE_API_KEY`
- `OPEN_METEO_API_KEY`

Policy opt-ins:

- `WORLD_PATRO_ALLOW_PUBLIC_NOMINATIM=false`
- `WORLD_PATRO_ALLOW_NONCOMMERCIAL_APIS=false`

Never use `NEXT_PUBLIC_*` for secret third-party API keys.

## Current endpoints

- `GET /api/v1/integrations` — provider inventory and configuration status; never returns secret values.
- `GET /api/v1/calendar/public-holidays?country=US&year=2026`
- `GET /api/v1/finance/fx?base=USD&quote=NPR`
- `GET /api/v1/world/earthquakes?lat=27.7172&lon=85.3240&radiusKm=500&days=7&minMagnitude=2.5`

## Provider-specific production rules

### Nominatim

The public OSMF Nominatim service is a shared resource. If explicitly enabled, World Patro must identify the application, keep traffic at or below the published public-service limit, cache appropriately, and display attribution. For sustained production geocoding, use a hosted provider or self-host Nominatim instead.

### Open-Meteo

The free hosted API is for non-commercial use and requires attribution. Commercial production should use the customer endpoint with `OPEN_METEO_API_KEY` or self-host under compatible terms.

### REST Countries

Current v5 documentation requires an API key. Historical examples claiming unauthenticated access should not be copied into production.

### NASA

NASA allows exploration without authentication for some catalog use, but production/mobile-style use should configure an API key and respect each individual endpoint's current status. Do not build new dependencies on NASA endpoints marked archived or scheduled for archive.

## Why these APIs

The goal is not maximum API count. The goal is a small, explainable source graph with:
1. primary/official sources when available,
2. transparent aggregators when useful,
3. explicit licensing and rate-limit boundaries,
4. no secret leakage,
5. graceful unsupported states instead of fabricated data.
