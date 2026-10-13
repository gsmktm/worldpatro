/* Read-only built-server acceptance checks. */
import assert from "node:assert/strict";
const BASE=(process.env.BASE_URL||"http://127.0.0.1:3100").replace(/\/$/,"");
async function get(path,expected=200){
 const res=await fetch(BASE+path);assert.equal(res.status,expected,path+" status");
 return res.headers.get("content-type")?.includes("application/json")?res.json():res.text();
}
async function post(path,body,expected=200){
 const res=await fetch(BASE+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
 assert.equal(res.status,expected,path+" status");return res.json();
}
const sky=await get("/api/v1/jyotish/transits?date=2026-10-14");
assert.equal(sky.date,"2026-10-14");
assert.equal(sky.sampledLocalTime,"12:00");
assert.equal(sky.timezone,"Asia/Kathmandu");
assert.equal(sky.positions.length,9);
assert(sky.positions.every(p=>Number.isFinite(p.degree)&&p.sign&&p.nakshatra));
assert(sky.positions.find(p=>p.key==="rahu")?.isMeanLunarNode);
await get("/api/v1/jyotish/transits?date=2026-02-30",400);
await get("/api/v1/jyotish/transits?date=2026-10-14&date=2026-10-15",400);
const people=await get("/api/v1/jyotish/people");
assert(people.total>=6);
assert(people.records.every(p=>p.birthTime===null||p.timeStatus==="documented"));
assert(people.records.every(p=>!Object.hasOwn(p,"moonSign")&&!Object.hasOwn(p,"ascendant")));
const filtered=await get("/api/v1/jyotish/people?category=Nepal");
assert(filtered.records.length>0&&filtered.records.every(p=>p.category==="Nepal"));
const record=await get("/api/v1/jyotish/people?slug=elizabeth-ii");
assert.equal(record.person.birthTime,"02:40");
assert.equal(record.person.timeStatus,"documented");
await get("/api/v1/jyotish/people?slug=does-not-exist",404);
await get("/api/v1/jyotish/people?category=invalid",400);
const example={calculator:"nakshatra",date:"2000-01-01",time:"12:00",timezone:"Asia/Kathmandu",latitude:27.7172,longitude:85.324};
const quick=await post("/api/v1/jyotish/quick",example);
assert.equal(quick.calculator,"nakshatra");
assert(quick.output.name&&quick.output.pada>=1&&quick.output.pada<=4);
assert.equal(quick.stored,false);
const lagna=await post("/api/v1/jyotish/quick",{...example,calculator:"lagna"});
assert(lagna.output.rashi&&Number.isFinite(lagna.output.degree));
const grahas=await post("/api/v1/jyotish/quick",{...example,calculator:"grahas"});
assert.equal(grahas.output.length,9);
await post("/api/v1/jyotish/quick",{...example,calculator:"not-implemented"},400);
await post("/api/v1/jyotish/quick",{...example,time:"99:99"},422);
for(const path of ["/app/jyotish-explorer","/app/people","/app/people/gyanendra-shah"]){
 const res=await fetch(BASE+path);assert.equal(res.status,200,path+" rendered");
 const html=await res.text();assert(html.includes("World Patro")||html.includes("PUBLIC RECORD"),path+" page content");
}
console.log("Jyotish Observatory: calculator, transit, source, input and page gates passed.");
