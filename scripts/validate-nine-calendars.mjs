import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const BASE=process.env.BASE_URL||"http://127.0.0.1:3100";
async function call(query,status=200){
 const r=await fetch(BASE+"/api/v1/calendar/month?"+query);
 assert.equal(r.status,status,query+" -> "+r.status+" "+(await r.clone().text()).slice(0,160));
 return r.json();
}
const shell=readFileSync(new URL("../src/components/app-shell.tsx",import.meta.url),"utf8");
const studio=readFileSync(new URL("../src/components/patro-studio.tsx",import.meta.url),"utf8");
assert.ok(shell.includes("key={query}"),"Workspace keys remain unchanged from existing behavior");
assert.ok(!studio.includes("window.history.replaceState("),"Patro must not rewrite the URL during date calculation");
assert.ok(studio.includes("await navigator.clipboard.writeText(url.toString())"),"Patro must generate a shareable selected-date link");
assert.ok(!studio.includes("setDay(null)"),"Calendar explorer should remain mounted during date fetch");
assert.ok(studio.includes('aria-busy={busy}'),"Recalculation must be announced as busy");

const errorBoundary=readFileSync(new URL("../src/app/app/error.tsx",import.meta.url),"utf8");
assert.ok(!errorBoundary.includes("debugCalendar"),"Temporary client error diagnostics must be removed");
assert.ok(!errorBoundary.includes("error.message"),"Generic public error state must not leak raw error messages");
assert.ok(studio.includes("window.location.assign(url.toString())"),"Calendar dates must use native deep-link navigation");
assert.ok(studio.includes('url.search=new URLSearchParams({...next,calendar}).toString()'),"Date link must retain location and calendar profile");
assert.ok(studio.includes('setCalendarFocus(requestedCalendar as CalendarId)'),"Deep links must restore the active calendar profile");
const explorer=readFileSync(new URL("../src/components/nine-calendar-explorer.tsx",import.meta.url),"utf8");
assert.ok(explorer.includes("onSelect(cell.date,active)"),"Month-day selection must preserve active profile");
const ids=["vedic","gregorian","bs","nepal-sambat","hijri","chinese","hebrew","persian","buddhist"];
for(const id of ids){
 const {calendar:m}=await call("date=2026-11-17&calendar="+id);
 assert.equal(m.id,id);
 assert.equal(m.days.length,42,id+" must show six calendar weeks");
 assert.ok(m.start<=m.end,id+" month bounds");
 assert.ok(m.previousDate&&m.nextDate,id+" must navigate neighboring months");
 assert.ok(m.days.some(d=>d.date==="2026-11-17"&&d.inMonth),id+" selected date absent");
 const within=m.days.filter(d=>d.inMonth);
 assert.ok(within.length>=28&&within.length<=32,id+" month length");
 assert.equal(within[0].date,m.start,id+" month should begin at start");
 assert.equal(within.at(-1).date,m.end,id+" month should end at end");
 assert.equal(new Set(m.days.map(d=>d.date)).size,42,id+" dates must not repeat");
 if(id==="vedic"||id==="nepal-sambat"){
  assert.equal(m.mode,"gregorian-reference",id+" should not fabricate its native month");
  assert.ok(["astronomy-required","authority-required"].includes(m.status));
 }else{
  assert.equal(m.mode,"native",id+" must use a real calendar month");
  assert.ok(within.every(d=>Number(d.day)>=1&&Number(d.day)<=32),id+" day numbering");
  const next=(await call("calendar="+id+"&date="+m.nextDate)).calendar;
  assert.equal(next.previousDate,m.end,id+" month forward/backward navigation");
  const prev=(await call("calendar="+id+"&date="+m.previousDate)).calendar;
  assert.equal(prev.nextDate,m.start,id+" month backward/forward navigation");
 }
}
const bs=(await call("calendar=bs&date=2026-11-17")).calendar;
assert.equal(bs.start,"2026-11-17");
assert.equal(bs.end,"2026-12-15");
assert.equal(bs.days.filter(d=>d.inMonth).length,29);
assert.equal(bs.days.find(d=>d.date==="2026-11-17").day,"1");
assert.equal(bs.status,"public-dataset");
assert.ok(bs.source.includes("nMiti"));
const bhadra=(await call("calendar=bs&date=2026-08-17")).calendar;
assert.equal(bhadra.status,"authority-sourced");
const unsupported=(await call("calendar=bs&date=2027-04-14")).calendar;
assert.equal(unsupported.status,"authority-required");
assert.equal(unsupported.mode,"gregorian-reference");
assert.ok(unsupported.days.filter(d=>d.inMonth).every(d=>d.source==="source-required"));
const ne=(await call("calendar=bs&date=2026-11-17&locale=ne")).calendar;
assert.ok(ne.title.includes("मङ्सिर"));
await call("calendar=invalid&date=2026-11-17",400);
await call("calendar=chinese&date=2026-02-30",400);
await call("calendar=gregorian&date=2101-01-01",400);
const snapshot=await fetch(BASE+"/api/v1/patro/today?date=2026-11-17").then(r=>r.json());
assert.equal(snapshot.calendars.length,9);
console.log(JSON.stringify({passed:true,profiles:ids.length,native:7,referenceOnly:2,bsMangsirDays:29,validation:"400 for invalid calendar/date"},null,2));
