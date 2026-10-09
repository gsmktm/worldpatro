# World Patro · Global Calendar, Astrology & World Intelligence OS

World Patro is a Nepal-origin, globally neutral full-stack platform connecting **time, nine calendar profiles, astronomical sacred time, public-source world intelligence, research, alerts, authorized workflows and WBE-9**.

Production: **https://worldpatro.vercel.app**

## Backend

**Firebase is now the primary backend path.**

The repository includes Firebase Authentication, Cloud Firestore integration, Firestore Security Rules, indexes, Firebase Admin support and Firebase-first user persistence.

See `docs/FIREBASE_SETUP.md` for the one-time console setup.

Supabase code/migrations are retained as an optional PostgreSQL/reference backend, but the application no longer requires a new Supabase project when Firebase is configured.

## Production principles

1. **No fabricated dates or sources.**
2. **Authority beats algorithmic guesswork** for official/observational calendars.
3. **Facts, reported claims, interpretation, forecasts and WBE symbolism are separate types.**
4. **Every factual record can carry provenance, retrieval time and verification state.**
5. **User data is protected by Firebase Auth + Firestore Security Rules.**
6. **Trusted server operations verify Firebase ID tokens and use Admin SDK credentials only server-side.**
7. **Consequential workflow actions require human confirmation.**

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
- `GET /api/v1/firebase/status`
- `GET /api/v1/patro/today?date=2026-10-08`
- `POST /api/v1/calendar/convert`
- `GET /api/v1/panchang/day`
- `GET /api/v1/world/country?iso3=NPL`
- `GET /api/v1/wbe/gates`
- `POST /api/v1/wbe/assess`
- authenticated profile/report/research/watchlist/workflow APIs

## Local run

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

The public app still runs when the database is unconfigured. Firebase-backed authenticated persistence becomes live once the Firebase Web config and server Admin credentials are added.

## Firebase environment

```env
NEXT_PUBLIC_DATABASE_PROVIDER=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

Never expose `FIREBASE_SERVICE_ACCOUNT_JSON` through a public environment variable.

## Trust coverage

**Live calculation/data**
- Gregorian, Islamic Civil, Chinese, Hebrew, Persian and Thai Buddhist Era correspondence via ICU/Intl
- astronomical Vedic Panchang core using Astronomy Engine
- 729 WBE Gates / 9 Anchor Gates
- World Bank country indicator connector

**Authority connector required before claiming exact official output**
- Nepal Bikram Sambat authority release profile
- Nepal Sambat lunisolar authority/research profile
- observational Hijri declarations
- regional religious calendars and government holiday overlays

Unsupported data is marked, never guessed.
