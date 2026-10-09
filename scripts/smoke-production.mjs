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


const visualPages = [
  ["/app/wbe", "Nine spokes"],
  ["/app/gates", "729 comparative gates"],
  ["/app/patro", "9 Calendars"],
  ["/app/panchang", "Vedic Panchang"],
  ["/app/numerology", "Numerology laboratory"],
  ["/app/kundli", "Birth chart"],
  ["/app/astrology", "Birth chart"]
];
for (const [path, marker] of visualPages) {
  const page = await hit(path, undefined, 200);
  invariant(page.text.includes(marker), path+" did not render its real studio.");
}

const gateSet = await json("/api/v1/wbe/gates?limit=9", undefined, 200);
invariant(gateSet.body.total === 729, "WBE 9×9×9 must generate exactly 729 gates.");
const anchors = await json("/api/v1/wbe/gates?anchors=true&limit=20", undefined, 200);
invariant(anchors.body.total === 9, "Exactly 9 keynote gates must exist.");

const invalidSnapshot = await json("/api/v1/wbe/snapshots", {
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({title:"invalid",scores:[5,5]})
},400);
invariant(Boolean(invalidSnapshot.body.error),"Invalid WBE scores must return 400.");

await json("/api/v1/wbe/snapshots", {
  method:"POST",
  headers:{"content-type":"text/plain"},
  body:"not a JSON payload"
},415);

await json("/api/v1/wbe/snapshots", {
  method:"POST",
  headers:{"content-type":"application/json","origin":"https://cross-origin.invalid","sec-fetch-site":"cross-site"},
  body:JSON.stringify({title:"cross site",scores:[5,5,5,5,5,5,5,5,5]})
},403);


const numbers = await json("/api/v1/numerology/calculate", {
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({
    task:"profile",name:"World Patro",birthDate:"2000-01-01",
    referenceDate:"2026-10-09",mode:"pythagorean"
  })
},200);
invariant(typeof numbers.body.result?.lifePath === "number","Numerology calculation must return a Life Path number.");
invariant(numbers.body.truthLayer === "TRADITIONAL INTERPRETATION","Numerology must retain its interpretation boundary.");

const badDate = await json("/api/v1/numerology/calculate", {
  method:"POST",
  headers:{"content-type":"application/json"},
  body:JSON.stringify({
    task:"profile",name:"World Patro",birthDate:"2026-02-30",
    referenceDate:"2026-10-09",mode:"chaldean"
  })
},400);
invariant(Boolean(badDate.body.error),"Impossible calendar dates must fail validation.");


const chartFixture={date:"2000-01-01",time:"12:00",timezone:"Asia/Kathmandu",
latitude:27.7172,longitude:85.3240,elevation:1300,houseSystem:"whole_sign"};
const kundli=await json("/api/v1/jyotish/kundli",{
  method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(chartFixture)
},200);
invariant(kundli.body.chart?.canonical?.utc==="2000-01-01T06:15:00.000Z","Kathmandu birth time must resolve to 06:15Z");
invariant(kundli.body.chart?.planets?.length===9,"Kundli requires nine grahas");
invariant(kundli.body.chart?.divisional?.length===7,"Kundli requires seven documented Vargas");
invariant(kundli.body.chart?.dasha?.periods?.length>=9,"Vimshottari chronology incomplete");
invariant(kundli.body.chart.planets.every(p=>p.siderealLongitude>=0&&p.siderealLongitude<360),"Sidereal longitude out of range");
invariant(kundli.body.saved===false,"Birth details must not save implicitly");
invariant(kundli.body.chart.calculation.interpretationBoundary.includes("not proof"),"Truth boundary missing");
const badBirth=await json("/api/v1/jyotish/kundli",{
  method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({...chartFixture,date:"2000-02-30"})
},422);
invariant(Boolean(badBirth.body.error),"Invalid Gregorian birth date accepted");
for(const [date,time] of [["2026-03-08","02:30"],["2026-11-01","01:30"]]){
  const dst=await json("/api/v1/jyotish/kundli",{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({...chartFixture,date,time,timezone:"America/New_York"})
  },422);
  invariant(Boolean(dst.body.error),"DST gap or fold not rejected");
}
await json("/api/v1/jyotish/kundli",{
  method:"POST",headers:{"content-type":"text/plain"},body:"{}"
},415);

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
    "agent-cross-origin-403",
    "wbe-visual-studio",
    "729-gates-studio",
    "patro-date-studio",
    "panchang-date-studio",
    "729-and-9-keynote-gates",
    "wbe-invalid-score-400",
    "wbe-content-type-415",
    "wbe-cross-origin-403",
    "archive-numerology-ui",
    "numerology-calculation",
    "numerology-invalid-date-400",
    "kundli-kathmandu-timezone",
    "kundli-nine-grahas-seven-vargas",
    "kundli-vimshottari-chronology",
    "kundli-nonpersistence-and-truth-boundary",
    "kundli-date-validation",
    "kundli-dst-validation",
    "kundli-json-content-type"
  ]
}));
