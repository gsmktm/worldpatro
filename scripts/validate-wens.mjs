// Production API regression test for WENS. Runs against the built Next.js server.
import assert from "node:assert/strict";

const origin=process.env.BASE_URL||"http://127.0.0.1:3100";
async function get(path) {
  const response=await fetch(origin+path,{headers:{accept:"application/json"}});
  const body=await response.json();
  return {status:response.status,body};
}

const snapshot=await get("/api/v1/wens/snapshot?date=2026-10-10");
assert.equal(snapshot.status,200,JSON.stringify(snapshot.body).slice(0,250));
assert.equal(snapshot.body.status,"calculated-with-symbolic-overlay");
assert.equal(snapshot.body.calendarProfiles.length,9);
assert.equal(snapshot.body.navagraha.length,9);
assert.equal(snapshot.body.traditions.length,9);
assert.equal(snapshot.body.powers.length,9);
assert.equal(snapshot.body.origin.symbolicAxisDegrees,0);
assert.ok(Math.abs(snapshot.body.origin.latitude-27.703889)<0.000001);
assert.ok(Math.abs(snapshot.body.origin.longitude-85.308333)<0.000001);
assert.equal(snapshot.body.gates.registry,109);
assert.equal(snapshot.body.gates.all,729);
assert.equal(snapshot.body.gates.keynotes,9);
assert.ok(snapshot.body.navagraha.every(g=>Number.isFinite(g.siderealLongitude)&&g.siderealLongitude>=0&&g.siderealLongitude<360));
assert.equal(snapshot.body.navagraha.filter(g=>g.isMeanLunarNode).length,2);
assert.equal(snapshot.body.instant.timezone,"Asia/Kathmandu");
assert.match(snapshot.body.truthBoundary.symbolic,/symbolic/i);
assert.match(snapshot.body.truthBoundary.religious,/not controlled/i);

const registry=await get("/api/v1/wens/gates?limit=109");
assert.equal(registry.status,200);
assert.equal(registry.body.total,109);
assert.equal(new Set(registry.body.gates.map(g=>g.code)).size,109);
assert.equal(registry.body.gates.filter(g=>g.anchor).length,9);

const cube=await get("/api/v1/wens/gates?view=all&limit=1");
assert.equal(cube.status,200);
assert.equal(cube.body.total,729);
assert.equal(cube.body.gates.length,1);

const filtered=await get("/api/v1/wens/gates?view=all&tradition=1&graha=2&power=3");
assert.equal(filtered.status,200);
assert.equal(filtered.body.total,1);
assert.equal(filtered.body.gates[0].code,"WBE-01-02-03");

const badDate=await get("/api/v1/wens/snapshot?date=2026-02-30");
assert.equal(badDate.status,400);
const badFilter=await get("/api/v1/wens/gates?graha=10");
assert.equal(badFilter.status,400);

console.log("WENS acceptance checks: passed — 9 calendars, 9 grahas, 9 traditions, 109 curated, 729 full, UNESCO origin and validation.");
