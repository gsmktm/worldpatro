import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const base=process.env.BASE_URL||"http://127.0.0.1:3100";
const params=new URLSearchParams({date:"2026-11-25",lat:"27.7172",lon:"85.3240",tz:"Asia/Kathmandu",locale:"ne"});
const response=await fetch(base+"/api/v1/moon/day?"+params);
assert.equal(response.status,200,"Moon API must return 200 for selected Kathmandu date");
const data=await response.json();
assert.equal(data.reference.date,"2026-11-25");
assert.equal(data.reference.timezone,"Asia/Kathmandu");
assert.ok(data.phase.illuminatedPercent>=0&&data.phase.illuminatedPercent<=100);
assert.ok(data.size.distanceKm>300000&&data.size.distanceKm<500000,"Moon distance should be physically credible");
assert.ok(data.size.angularDiameterArcmin>25&&data.size.angularDiameterArcmin<40,"Moon apparent diameter should be credible");
assert.equal(data.events.length,4,"Four future astronomical quarter milestones must be returned");
assert.deepEqual([...data.events].map(e=>e.instantUTC),data.events.map(e=>e.instantUTC).sort(),"Lunar events must be ordered by UTC instant");
assert.ok(data.events.every(e=>/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(e.date)));
assert.equal(data.days.length,14,"Moon day strip should cover 14 local noon snapshots");
assert.equal(data.days.filter(d=>d.selected).length,1);
assert.ok(data.days.some(d=>d.selected&&d.date===data.reference.date));
assert.ok(data.days.every(d=>d.illuminationPercent>=0&&d.illuminationPercent<=100));
assert.ok(data.rashi.index>=0&&data.rashi.index<12);
assert.match(data.rashi.system,/Lahiri/);
assert.ok(data.method.includes("Astronomy Engine"));
for(const bad of ["date=2026-02-30","date=2026-11-25&tz=Nope%2FInvalid"]){
 const res=await fetch(base+"/api/v1/moon/day?"+bad);
 assert.equal(res.status,400,"Invalid Moon query must return 400: "+bad);
}
const iconSource=readFileSync(new URL("../src/components/moon-vectors.tsx",import.meta.url),"utf8");
const list=iconSource.split("const RASHI_PATHS=[")[1]?.split("] as const;")[0];
assert.ok(list,"Original 12-icon vector registry must exist");
const paths=[...list.matchAll(/"([^"]+)"/g)].map(match=>match[1]);
assert.equal(paths.length,12);
assert.equal(new Set(paths).size,12,"Each zodiac icon must have a distinct SVG path");
assert.match(iconSource,/role="img"/);
const moonSource=readFileSync(new URL("../src/components/moon-studio.tsx",import.meta.url),"utf8");
assert.match(moonSource,/aria-pressed=\{item\.selected\}/);
assert.match(moonSource,/MOON_RASHIS\.map/);
console.log(JSON.stringify({passed:true,events:data.events.length,days:data.days.length,icons:paths.length,
  illumination:data.phase.illuminatedPercent,moonDiameterArcmin:data.size.angularDiameterArcmin},null,2));
