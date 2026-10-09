# Routes, functions and production flows

## Public product routes

| Route | Purpose | Live state |
| --- | --- | --- |
| / | public landing | live |
| /app | one-click command center | live |
| /app/patro | 9-calendar hub | live core |
| /app/panchang | astronomical Panchang | live core API |
| /app/astrology | interpretation workspace | calculation expansion |
| /app/kundli | birth-chart workflow | persistence ready |
| /app/muhurat | timing search | persistence ready |
| /app/religions | world religious calendar | source connector |
| /app/world | public world intelligence | World Bank connector live |
| /app/wbe | WBE-9 | live |
| /app/gates | 729 Gates | live |
| /app/research | research notebooks | API + database ready |
| /app/alerts | watchlists and alerts | API + database ready |
| /app/workflows | authorized workflow orders | API + state machine ready |
| /app/sources | source registry | API + database ready |
| /app/consult | astrologer consultations | API + database ready |
| /app/learn | multilingual learning hub | API + database ready |
| /login | Supabase Auth | live when configured |

## API families

### Time and calendars
- GET /api/v1/patro/today
- POST /api/v1/calendar/convert
- GET /api/v1/panchang/day

### Personal astrology persistence
- GET|POST /api/v1/profiles
- PATCH|DELETE /api/v1/profiles/{id}
- GET|POST /api/v1/reports

### Public world intelligence
- GET /api/v1/world/country
- GET /api/v1/world/events
- GET /api/v1/world/entities
- GET /api/v1/claims
- GET /api/v1/sources

### Sacred-time authority layer
- GET /api/v1/religions/observances

### Research and monitoring
- GET|POST /api/v1/research/notebooks
- GET|POST /api/v1/research/items
- GET|POST /api/v1/watchlists
- GET /api/v1/notifications
- PATCH /api/v1/notifications/{id}

### Authorized operations
- GET|POST /api/v1/workflows/orders
- PATCH /api/v1/workflows/orders/{id}

Workflow transitions are validated inside PostgreSQL:
draft → review → approved → assigned → active → verify → closed → archived.
Cancellation is allowed from active pre-close stages. Every state change creates an audit event and an in-app notification. Consequential external actions remain outside this state machine until a human explicitly confirms them.

### Marketplace and learning
- GET /api/v1/astrologers
- GET|POST /api/v1/consultations
- GET /api/v1/articles

### WBE
- GET /api/v1/wbe/gates
- POST /api/v1/wbe/assess

## Truth-state flow

1. Receive canonical context.
2. Validate calendar/method/jurisdiction.
3. Choose deterministic engine, astronomical engine, official authority release or public data connector.
4. Produce value plus method, version, source and uncertainty.
5. Keep interpretive astrology and WBE symbolism in separately labeled result objects.
6. Persist only after authentication and RLS authorization.
7. Emit audit/notification events for operational changes.

## Database flow

Public reference tables are readable through RLS policies. Personal data is owner-scoped. Source and claim records provide the provenance graph:
entity/event → claim → evidence → source registry.

The workflow engine is database-enforced instead of trusting the browser to decide legal transitions.
