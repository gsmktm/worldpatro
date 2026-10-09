# World Patro Production Architecture

## 1. Layers

### Calendar-neutral core
Public calls can use familiar Gregorian dates, but internal production work should preserve:
- civil day
- civil timestamp + IANA timezone release
- astronomical instant
- Earth-rotation context when high precision requires it

### Trust layers
1. deterministic civil calendar core
2. astronomical calendar core
3. authority / observation releases
4. interpretive astrology and WBE symbolism

Never collapse these into one confidence score.

## 2. Request flow

`UI → Route Handler → validation → canonical context → calculation/source adapter → provenance → response → optional persistence`

Authenticated writes add:

`getClaims() → RLS → database transaction → audit/realtime event`

## 3. Domain flow

### 9 Calendars
Input date/place/method → canonical context → calendar adapters → result cards → provenance drawer → save/share.

### Panchang
Date + timezone + coordinates → UTC instant → ephemeris → Sun/Moon → Lahiri sidereal positions → tithi/nakshatra/yoga → rise/set → traditional interpretation layer.

### World intelligence
Entity → public source adapters → normalized events/indicators → claims → evidence → confidence/verification → country/leader/diplomatic brief.

### Workflow
Draft → Review → Approved → Assigned → Active → Verify → Closed → Archived.
External/consequential actions require explicit human confirmation.

## 4. Database boundaries

Reference data is public-readable under RLS.
Personal profiles, reports, research, watchlists, notifications and workflows are owner-scoped.
Admin authorization must use trusted app metadata / server-side roles, never user-editable metadata.

## 5. Realtime

Supabase Realtime is enabled only for user-scoped notifications and workflow orders in the core migration. High-volume global events should use server-side ingestion/queues rather than broadcasting raw feeds to every client.

## 6. Production source registry

Every connector records:
- owner/publisher
- source tier
- license
- jurisdiction
- update cadence
- retrieval time
- status
- version/hash where possible

Claims then link to evidence records rather than embedding untraceable prose.

## 7. Routes

The product is organized by stable domain routes under `/app/*`, with versioned APIs under `/api/v1/*`. New intelligence domains should add adapters and APIs without changing canonical time/calendar contracts.

## 8. Deployment

Vercel hosts the Next.js application.
Supabase provides Postgres, Auth, Realtime and optional Storage.
Node.js 22+ is required because current Supabase JS has dropped Node 20 support.

## 9. Release gates

Before production:
- typecheck/build green
- migration applied to dedicated World Patro project
- RLS tests
- Supabase Security + Performance advisors clean or reviewed
- auth confirmation URLs set
- Preview and Production env vars scoped correctly
- API health check passes
- live country source checked
- Panchang golden dates checked
- no secret keys committed
