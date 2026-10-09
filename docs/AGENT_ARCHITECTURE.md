# World Patro Agent Architecture

Agents are an orchestration layer over explicit calculation, source and workflow tools — not a second truth system.

## Conductor and specialists

- **World Patro Conductor** — supervisor.
- **Kala** — calendars and chronology.
- **Jyoti** — astronomy and Panchang.
- **Prithvi** — public-source world facts.
- **Sutra** — evidence framing and research decomposition.
- **Mandala** — WBE-9 symbolism.
- **Karma** — workflow planning; no consequential execution.

Defaults:
- Supervisor: `openai/gpt-5.6-sol`
- Specialists: `openai/gpt-5.6-luna`

Models route through Vercel AI Gateway. Production can use Vercel OIDC; local/external runtimes may set `AI_GATEWAY_API_KEY`.

## Runtime controls

- Supervisor: maximum 7 steps.
- Specialist: maximum 4 steps.
- Tools use Zod input schemas.
- Operations specialist has no external execution tool.
- Consequential actions require explicit human confirmation.
- Signed-in Firebase users may persist agent run history.

## Truth boundary

Every answer preserves the distinction between FACT, AUTHORITY, ASTRONOMY, INTERPRETATION, WBE SYMBOLISM, SCENARIO and UNKNOWN.

## API

- `GET /api/v1/agents/status` — models, specialists, runtime limits; no AI request.
- `POST /api/v1/agents/run` — bounded supervisor invocation.

World Patro does not run background model loops on page load. AI cost occurs only after an explicit user request.


## Production access and abuse controls

World Patro v2.0.1 defaults the agent endpoint to **authenticated** access in production. This keeps public calendar and world-data APIs open while protecting AI Gateway spend.

`WORLD_PATRO_AGENT_ACCESS_MODE` supports:
- `authenticated` — default in production; requires a valid Firebase or Supabase user session.
- `public` — explicit opt-in for anonymous AI access.
- `api-key` — server-to-server access using `WORLD_PATRO_AGENT_API_KEY`.

The agent endpoint rejects request bodies above 16 KiB before model execution. The response includes an `X-Request-Id` and `Server-Timing` value.

## Observability

Agent invocations emit low-cardinality Vercel Custom Metrics:
- `worldpatro.agent.requests`
- `worldpatro.agent.duration_ms`
- `worldpatro.agent.delegations`

Structured logs record request IDs, outcome, access mode, delegated agent roles and duration. User prompts, email addresses, user IDs, secrets and raw model output are deliberately excluded from logs and metric tags.


## Browser request integrity

For authenticated cookie-based agent access, World Patro rejects browser requests when `Sec-Fetch-Site` is `cross-site` or when an explicit `Origin` does not match the request/canonical site origin. This is a CSRF and AI-spend protection layer.

`POST /api/v1/agents/run` also requires `Content-Type: application/json`; unsupported media types return HTTP 415 before authentication or model execution. Server-to-server API-key mode remains independent of browser-origin checks.
