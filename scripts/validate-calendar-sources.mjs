import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const load=path=>readFileSync(new URL(path,import.meta.url),"utf8");
const src=load("../src/lib/nepal-bs-authority.ts");
const reg=/bsYear:2083,bsMonth:(\d+),nameEn:"[^"]+",nameNe:"[^"]+",\s*startsAD:"(\d{4}-\d{2}-\d{2})",length:(\d+),/g;
const rows=[...src.matchAll(reg)].map(m=>({month:+m[1],date:m[2],days:+m[3]}));
assert.equal(rows.length,12,"BS 2083 must contain exactly twelve mapped months");
let dayCount=0;
for(let i=0;i<rows.length;i++){
  const row=rows[i];
  assert.equal(row.month,i+1,"BS months must be in calendar order");
  assert.ok(row.days>=29&&row.days<=32,"Nepali month has invalid day count");
  if(i){
    const prior=rows[i-1];
    const expected=new Date(Date.parse(prior.date+"T00:00:00Z")+prior.days*86400000).toISOString().slice(0,10);
    assert.equal(row.date,expected,"Gap or overlap at month "+row.month);
  }
  dayCount+=row.days;
}
assert.equal(rows[0].date,"2026-04-14");
assert.equal(rows[7].date,"2026-11-17");
assert.equal(rows[7].days,29);
assert.equal(rows[8].date,"2026-12-16");
assert.equal(dayCount,365,"BS 2083 expected year length");
assert.match(src,/verification:"municipality-published"/);
assert.match(src,/verification:"public-open-dataset"/);
assert.match(src,/namunaone\.github\.io\/nMiti\/data\.html/);
const panel=load("../src/components/calendar-reference-panel.tsx");
assert.match(panel,/hamropatro\.com\/widgets\/calender-responsive\.php/);
assert.match(panel,/ashesh\.com\.np\/calendar-widget\/calendar\.php/);
assert.match(panel,/©/,"Provider credit must remain visible");
assert.match(panel,/setSelected/,"Third-party content must load only after user selection");
const studio=load("../src/components/patro-studio.tsx");
assert.match(studio,/Sourced AD ↔ BS/,"Converter must disclose supported reference data");
assert.match(studio,/bs\.status==="public-dataset"/,"Open dataset must appear in converter UI");
assert.match(studio,/data\.status==="municipal_source"/,"Reverse converter must classify provenance");
assert.match(studio,/publishedBsFromAD\(next\.date\)/,"BS converter input must follow the selected Gregorian date");
assert.match(studio,/setBsRaw\(matchedBs\?/,"BS converter field must update on selection");
assert.doesNotMatch(studio,/Conversion is available for municipality-reviewed Bhadra, Asoj and Kartik 2083/,"Old three-month limitation must not remain");
const calendar=load("../src/lib/calendars.ts");
assert.match(calendar,/public-dataset/);
assert.match(calendar,/REVIEWED OPEN DATASET \(CC0\)/);
const route=load("../src/app/api/v1/calendar/bs/convert/route.ts");
assert.match(route,/public_dataset/,"BS converter must disclose non-municipal data");
console.log(JSON.stringify({passed:true,year:2083,months:rows.length,days:dayCount,mangsir:rows[7],providers:["Ashesh","Hamro Patro"],license:"CC0 open reference; widgets externally hosted"},null,2));
