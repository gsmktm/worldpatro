# World Patro — 19-module operational audit

This document records exactly what this release does and does NOT do. Tests validate route render, API contracts and unauthenticated security boundaries; they do not authenticate against an unconfigured Firebase instance or verify third-party API uptime.

## TIME (7)
- patro, panchang: unified local-time calendar/Panchang workspace, authority limitations explicit.
- astrology, kundli: astronomy-based approximate sidereal birth charts; no empirical predictive validation.
- muhurat: location-specific traditional candidate-window screening, not an official temple declaration.
- numerology: traditional symbolic calculations.
- religions: published-only editorial calendar; no verified festival records appear until approved in an active database.

## INTELLIGENCE (4)
- world: dedicated country-code input and source-backed World Bank indicator viewer; USGS Nepal-area event viewer, with upstream failure messages.
- research: authenticated notebook list/create plus evidence-note list/create. Firebase now supports researchItems under each user's namespace; notebook ownership is verified before adding notes. Supabase requires correct project/schema.
- sources: public integration providers visible without database; editorial publication shown separately after review.
- alerts: authenticated watchlist create/list, notification list and owner-only acknowledgement. Continuous future monitoring/digest delivery remains separate scheduled infrastructure.

## BALANCE (2)
- wbe and gates remain functioning symbolic analysis and gate explorer; do not assert astronomical causation.

## OPERATIONS (6)
- agents: dedicated AgentConsole connected to /api/v1/agents/status and /api/v1/agents/run, with six specialist profiles. Gateway and account configuration control model execution; no unconfirmed external action is executed.
- workflows: authenticated draft creation/list and authorized state transitions. This is internal workflow state, not a live purchase/booking system.
- admin: server-verified role publishing/editing and source notices, blocked until an administrator has been granted credentials.
- privacy: authenticated account export; bounded snapshot, not provider-level total erasure.
- consult: authenticated consultation request/list with Firebase or Supabase adapter. No expert verification, paid bookings, external appointment inventory or confirmed time is claimed.
- learn: source-reviewed editorial content, empty until database activation and publishing.

## Security & conditional activation
- Firebase server SDK requires a real secret in Vercel and a server-verified Firebase session. The public web Firebase config alone cannot activate the backend.
- Research notes verify notebook ownership under users/{uid}; notifications and consultations are accessed only under a matching uid.
- User-owned writes have strict Zod validation and same-origin rejection in the new endpoints.
- AI Gateway availability, credential backend and role gates are exposed to visitors as nonsecret booleans by /api/v1/platform/modules.
- Third-party sources can fail; the UI reports unavailable instead of inventing information.

## CI gates
- Renders all eight newly added pages.
- Every one of 19 module links is unique and internal.
- Six agent specialist profiles match the API.
- Public source catalogue exists without user authentication.
- Protected private reads never return data to unauthenticated callers.
- Cross-origin POST/PATCH operations are denied.

## Remaining engineering
Independent production browser E2E, full Firebase Admin credential/roles, real database owner-CRUD with pagination/backups, verified astrologer onboarding and availability, recurring alerts, international calendar authority datasets, audit monitoring, organizational admin role separation, and external system integrations are all additional work.