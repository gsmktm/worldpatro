import assert from "node:assert/strict";
const root=process.env.BASE_URL||"http://127.0.0.1:3100";
const query=new URLSearchParams({date:"2026-11-25",lat:"27.7172",lon:"85.324",tz:"Asia/Kathmandu",locale:"ne"});
const response=await fetch(root+"/api/v1/vedic/day?"+query);
assert.equal(response.status,200,"Vedic daily API must respond successfully");
const day=await response.json();
assert.equal(day.canonical.date,"2026-11-25");
assert.equal(day.canonical.timezone,"Asia/Kathmandu");
assert.equal(day.calendars.length,9);
assert.ok(day.panchang.tithi.name);
assert.ok(day.panchang.karana.name);
assert.ok(day.panchang.karana.number>=1&&day.panchang.karana.number<=60);
assert.ok(day.boundaries.tradition.includes("not")||day.boundaries.tradition.includes("Neither"));
assert.equal(day.daylight.status,"calculated","Kathmandu must have a usable local-day sunrise/sunset");
assert.equal(day.daylight.choghadiya.length,8);
assert.equal(day.daylight.hora.length,12);
// When date is omitted, the selected timezone must supply the civil date.
function localDate(zone) {
 const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{
  timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"
 }).formatToParts(new Date()).map(p=>[p.type,p.value]));
 return parts.year+"-"+parts.month+"-"+parts.day;
}
for(const tz of ["Pacific/Kiritimati","Pacific/Honolulu"]){
 const before=localDate(tz);
 const reply=await fetch(root+"/api/v1/vedic/day?"+new URLSearchParams({tz}));
 assert.equal(reply.status,200,"Omitted date must work for "+tz);
 const day=await reply.json();
 assert.ok([before,localDate(tz)].includes(day.canonical.date),
  "Default date must use requested timezone "+tz+" (not server/Kathmandu)");
 assert.equal(day.canonical.timezone,tz);
}
const badDate=await fetch(root+"/api/v1/vedic/day?date=2026-02-30");
assert.equal(badDate.status,400);
const badZone=await fetch(root+"/api/v1/vedic/day?date=2026-11-25&tz=Unknown%2FTimezone");
assert.equal(badZone.status,400);
console.log("Vedic API smoke checks passed, with source boundary and invalid-input guards.");
