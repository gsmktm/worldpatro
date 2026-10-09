const base = process.env.BASE_URL || "http://127.0.0.1:3100";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function hit(path, options, expectedStatus) {
  const response = await fetch(new URL(path, base), options);
  const text = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`${path}: expected ${expectedStatus}, got ${response.status}\n${text.slice(0, 800)}`);
  }
  return { response, text };
}

async function json(path, options, expectedStatus) {
  const result = await hit(path, options, expectedStatus);
  return { ...result, body: JSON.parse(result.text) };
}

const home = await hit("/", undefined, 200);
invariant(home.text.includes("World Patro"), "Landing page does not identify World Patro.");

const app = await hit("/app", undefined, 200);
invariant(app.text.includes("World Patro"), "Command Center did not render.");

const health = await json("/api/v1/health", undefined, 200);
invariant(health.body.ok === true, "Health endpoint is not OK.");
invariant(health.body.version === "2.0.1", "Unexpected World Patro version.");
invariant(health.body.aiGateway?.accessMode === "authenticated", "Production agent access must default to authenticated.");

const patro = await json("/api/v1/patro/today?date=2026-10-09", undefined, 200);
invariant(Array.isArray(patro.body.calendars), "Patro response has no calendars array.");
invariant(patro.body.calendars.length === 9, `Expected 9 calendar profiles, got ${patro.body.calendars.length}.`);

const integrations = await json("/api/v1/integrations", undefined, 200);
invariant(integrations.body.summary?.total >= 9, "Integration catalog is unexpectedly incomplete.");
invariant(integrations.body.integrations?.some(item => item.id === "usgs-earthquake" && item.runtimeEnabled), "USGS integration is not enabled.");
invariant(integrations.body.integrations?.some(item => item.id === "frankfurter" && item.runtimeEnabled), "Frankfurter integration is not enabled.");
invariant(integrations.body.integrations?.some(item => item.id === "open-meteo" && !item.runtimeEnabled), "Restricted Open-Meteo integration should default to disabled.");

const nepalHolidays = await json("/api/v1/calendar/public-holidays?country=NP&year=2026", undefined, 200);
invariant(nepalHolidays.body.status === "authority_required", "Nepal holidays must preserve authority-required state.");

const status = await json("/api/v1/agents/status", undefined, 200);
invariant(status.body.access?.mode === "authenticated", "Agent status did not report authenticated mode.");
invariant(status.body.executionPolicy?.maxSupervisorSteps === 7, "Supervisor step limit changed unexpectedly.");
invariant(status.body.executionPolicy?.maxSpecialistSteps === 4, "Specialist step limit changed unexpectedly.");

const unauthorized = await json("/api/v1/agents/run", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message: "smoke test only" })
}, 401);
invariant(unauthorized.body.accessMode === "authenticated", "Unauthenticated request did not preserve access mode.");

await json("/api/v1/agents/run", {
  method: "POST",
  headers: { "content-type": "text/plain" },
  body: JSON.stringify({ message: "smoke test only" })
}, 415);

await json("/api/v1/agents/run", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "origin": "https://cross-origin.invalid",
    "sec-fetch-site": "cross-site"
  },
  body: JSON.stringify({ message: "smoke test only" })
}, 403);

console.log(JSON.stringify({
  ok: true,
  checks: [
    "landing",
    "command-center",
    "health",
    "nine-calendars",
    "integration-catalog",
    "nepal-holiday-authority-boundary",
    "agent-status",
    "agent-auth-401",
    "agent-content-type-415",
    "agent-cross-origin-403"
  ]
}));
