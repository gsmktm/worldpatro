# World Patro · Global Calendar, Astrology & World Intelligence OS

World Patro is a Nepal-origin, globally neutral full-stack platform connecting **time, nine calendar profiles, astronomical sacred time, public-source world intelligence, research, alerts, authorized workflows and WBE-9**.

## Production principles

1. **No fabricated dates or sources.**
2. **Authority beats algorithmic guesswork** for official/observational calendars.
3. **Facts, reported claims, interpretation, forecasts and WBE symbolism are separate types.**
4. **Every factual record can carry provenance, retrieval time and verification state.**
5. **User data is protected by Supabase RLS.**
6. **Consequential workflow actions require human confirmation.**

The source blueprint specifically argues that World Patro cannot be a collection of date-offset formulas and should normalize internally through calendar-neutral day/instant concepts with versioned authority profiles. The app architecture follows that direction.

## Routes

### Product
- `/` — cinematic public landing
- `/app` — one-click command center
- `/app/patro`
- `/app/panchang`
- `/app/astrology`
- `/app/kundli`
- `/app/muhurat`
- `/app/religions`
- `/app/world`
- `/app/wbe`
- `/app/gates`
- `/app/research`
- `/app/alerts`
- `/app/workflows`
- `/app/sources`
- `/app/consult`
- `/app/learn`
- `/login`

### API
- `GET /api/v1/health`
- `GET /api/v1/patro/today?date=2026-10-08`
- `POST /api/v1/calendar/convert`
- `GET /api/v1/panchang/day?date=2026-10-08&lat=27.7172&lon=85.3240&tz=Asia/Kathmandu`
- `GET /api/v1/world/country?iso3=NPL`
- `GET /api/v1/wbe/gates`
- `POST /api/v1/wbe/assess`
- `GET /api/v1/sources`
- `GET /api/v1/notifications`
- `GET|POST /api/v1/workflows/orders`

## Local run

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

The public app runs without Supabase. Authenticated persistence becomes live when these are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Never expose a Supabase secret/service key in a `NEXT_PUBLIC_` variable.

## Supabase

The migration is in:

`supabase/migrations/20261009000000_world_patro_core.sql`

It creates:

- profiles + birth profiles
- saved calculation reports
- calendar profile registry
- source registry + authority releases
- temporal entities/events
- claim/evidence provenance model
- world religious observances
- research notebooks
- watchlists + realtime notifications
- authorized workflow orders + audit events
- WBE assessments
- astrologers + consultations
- articles

All exposed public tables have RLS enabled and the migration contains explicit Data API grants for current Supabase defaults.

## Deploy

### Vercel
Link this repository to Vercel, set the two public Supabase environment variables for Preview and Production, and deploy the `main` branch.

### Supabase
Create a dedicated **World Patro** project — never reuse an unrelated production database — then apply the migration and run Security/Performance advisors before production.

## Current trust coverage

**Live now in code**
- Gregorian, Islamic Civil, Chinese, Hebrew, Persian and Thai Buddhist Era correspondence via ICU/Intl
- astronomical Vedic Panchang core using Astronomy Engine
- 729 WBE Gates / 9 Anchor Gates
- World Bank country indicator connector
- Supabase auth/persistence adapters and production schema

**Authority connector required before claiming exact official output**
- Nepal Bikram Sambat authority release profile
- Nepal Sambat lunisolar authority/research profile
- observational Hijri declarations
- regional religious calendars and government holiday overlays

That limitation is intentional: unsupported data is marked, never guessed.
