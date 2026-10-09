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
