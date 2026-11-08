import assert from "node:assert/strict";
const base=process.env.BASE_URL||"http://127.0.0.1:3100";
async function hit(path,init){const r=await fetch(new URL(path,base),{redirect:"manual",...init});const text=await r.text();return {status:r.status,headers:r.headers,text};}
async function json(path,status=200,init){const r=await hit(path,init);assert.equal(r.status,status,path+": "+r.status+" "+r.text.slice(0,150));return JSON.parse(r.text);}
for(const page of ["/","/app","/app/planner","/app/tools","/app/festivals","/app/ecosystem"]){const r=await hit(page);assert.equal(r.status,200,page);assert.match(r.text,/World Patro/);}
const festival=await json("/api/v1/festivals");assert.equal(festival.completeYear,false);assert.equal(festival.source.checkedOn,"2026-11-08");assert.equal(festival.festivals.find(f=>f.id==="kukur-laxmi-2083")?.date,"2026-11-08");assert.equal(festival.festivals.find(f=>f.id==="bhai-tika-2083")?.date,"2026-11-11");
assert.equal((await json("/api/v1/festivals?from=2027-01-01&to=2027-12-31")).festivals.length,0);
await json("/api/v1/festivals?from=2026-02-30",400);await json("/api/v1/festivals?from=2026-11-10&to=2026-11-01",400);
const ics=await hit("/api/v1/festivals?format=ics");assert.equal(ics.status,200);assert.match(ics.headers.get("content-type"),/text\/calendar/);assert.ok(ics.text.startsWith("BEGIN:VCALENDAR\r\n"));assert.match(ics.text,/DTSTART;VALUE=DATE:20261108/);assert.match(ics.text,/DTEND;VALUE=DATE:20261109/);assert.match(ics.text,/https:\/\/kathmandu.gov.np/);for(const line of ics.text.split("\r\n"))assert.ok(Buffer.byteLength(line,"utf8")<=75,"RFC 5545 physical line too long");
const forward=await json("/api/v1/calendar/bs/convert?ad=2026-11-08");assert.equal(forward.result.bsMonth,7);assert.equal(forward.result.bsDay,22);
const reverse=await json("/api/v1/calendar/bs/convert?bs=2083-07-22");assert.equal(reverse.result.date,"2026-11-08");
await json("/api/v1/calendar/bs/convert?ad=2026-11-17",404);
const body={title:"Validation only",date:"2026-11-08",category:"personal",notes:"",completed:false};
const blocked=await hit("/api/v1/planner",{method:"POST",headers:{"content-type":"application/json",origin:"https://foreign.invalid","sec-fetch-site":"cross-site"},body:JSON.stringify(body)});assert.equal(blocked.status,403);
assert.equal((await hit("/api/v1/planner",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,date:"2026-02-30"})})).status,400);
assert.equal((await hit("/api/v1/planner",{method:"POST",headers:{"content-type":"text/plain"},body:"invalid"})).status,415);
assert.equal((await hit("/api/v1/planner",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,notes:"x".repeat(9000)})})).status,413);
assert.ok([401,503].includes((await hit("/api/v1/planner")).status),"Anonymous planner access must not return account data");
assert.ok([401,503].includes((await hit("/api/v1/planner",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})).status),"Anonymous event creation must require auth");
assert.equal((await hit("/api/v1/planner/validid123",{method:"DELETE",headers:{origin:"https://foreign.invalid"}})).status,403);
for(const [old,target] of [["/app/calendar","/app/patro"],["/app/converter","/app/tools"],["/app/my-calendar","/app/planner"],["/app/festival","/app/festivals"]]){const r=await hit(old);assert.equal(r.status,308,old);assert.ok(r.headers.get("location")?.includes(target));}
const manifest=await json("/manifest.webmanifest");assert.equal(manifest.start_url,"/app");assert.equal((await hit("/icon.svg")).status,200);
console.log("Ecosystem acceptance passed: pages, source-bounded dates, UTF-8 ICS, Kartik roundtrip, private API guards, menu aliases and install metadata. Authenticated database writes are not exercised.");
