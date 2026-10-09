// World Patro · category-based sacred-time screening, archive informed.
// This is a rule-based shortlist, not a religious authority or objective score.
import * as Astro from "astronomy-engine";
import { calculatePanchang } from "@/lib/astro";
import { resolveBirthInstant } from "@/lib/jyotish/birth-chart";

export const MUHURAT_CATEGORIES=[
  "general","education","travel","business_opening","griha_pravesh",
  "engagement","marriage","naming","bhoomi_puja"
] as const;
export type MuhuratCategory=typeof MUHURAT_CATEGORIES[number];
export type MuhuratQuery={
  category:MuhuratCategory;
  from:string;
  to:string;
  timezone:string;
  latitude:number;
  longitude:number;
  elevation:number;
  limit:number;
};

const FAV_WEEKDAYS:Record<MuhuratCategory,readonly number[]>={
  general:[0,1,2,3,4,5,6],
  education:[1,3,4,5],
  travel:[0,1,2,4,5],
  business_opening:[3,4,5],
  griha_pravesh:[1,3,4,5],
  engagement:[1,3,4,5],
  marriage:[1,3,4,5],
  naming:[1,3,4,5],
  bhoomi_puja:[2,3,4,6]
};
const RAHU_SLOT=[8,2,7,5,6,4,3]; // Sun 8, Mon 2, Tue 7, Wed 5, Thu 6, Fri 4, Sat 3 (1-based)
const WEEKDAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_MS=86400000;
const formatDay=(dt:Date)=>dt.toISOString().slice(0,10);
function validDay(raw:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))throw new Error("Use Gregorian YYYY-MM-DD dates.");
  const dt=new Date(raw+"T12:00:00Z");
  if(!Number.isFinite(dt.getTime())||formatDay(dt)!==raw)throw new Error("Invalid Gregorian date.");
  return dt;
}
function localDay(date:Date,timezone:string){
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date);
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return p.year+"-"+p.month+"-"+p.day;
}
function eventFor(date:string,timezone:string,observer:Astro.Observer,direction:1|-1,after:Date) {
  const next=Astro.SearchRiseSet(Astro.Body.Sun,observer,direction,Astro.MakeTime(after),2);
  if(!next)return null;
  return localDay(next.date,timezone)===date?next.date:null;
}
function windowWithoutRahu(sunrise:number,sunset:number,weekday:number){
  const daylight=sunset-sunrise;
  const slot=RAHU_SLOT[weekday]-1;
  const exclusionStart=sunrise+slot*daylight/8;
  const exclusionEnd=exclusionStart+daylight/8;
  const floor=sunrise+60*60000,ceiling=sunset-60*60000;
  if(ceiling-floor<30*60000)return null;
  const spans:[
    {start:number;end:number},
    {start:number;end:number}
  ]=[
    {start:floor,end:Math.min(ceiling,exclusionStart)},
    {start:Math.max(floor,exclusionEnd),end:ceiling}
  ];
  const usable=spans.filter(s=>s.end-s.start>=30*60000).sort((a,b)=>(b.end-b.start)-(a.end-a.start));
  if(!usable[0])return null;
  return {
    startUTC:new Date(usable[0].start).toISOString(),
    endUTC:new Date(usable[0].end).toISOString(),
    rahuKalaUTC:{start:new Date(exclusionStart).toISOString(),end:new Date(exclusionEnd).toISOString()}
  };
}
export function searchMuhurat(query:MuhuratQuery) {
  const first=validDay(query.from),last=validDay(query.to);
  const count=Math.round((last.getTime()-first.getTime())/DAY_MS)+1;
  if(count<1||count>31)throw new Error("Date range must be 1–31 days, in ascending order.");
  if(Math.abs(query.latitude)>66||Math.abs(query.longitude)>180)throw new Error("Unsupported geographic coordinates.");
  const observer=new Astro.Observer(query.latitude,query.longitude,query.elevation);
  const candidates:Array<{
    date:string;startUTC:string;endUTC:string;
    rahuKalaUTC:{start:string;end:string};
    criteriaMatched:number;criteriaTotal:number;status:"screened"|"review";
    panchang:{tithi:string;nakshatra:string;paksha:string;weekday:string};
    reasons:Array<{text:string;met:boolean}>;
  }>=[];
  const skipped:Array<{date:string;reason:string}>=[];
  for(let i=0;i<count;i++){
    const day=new Date(first.getTime()+i*DAY_MS),date=formatDay(day);
    try {
      const midnight=resolveBirthInstant(date,"00:00",query.timezone);
      const sunrise=eventFor(date,query.timezone,observer,1,new Date(midnight.getTime()-3600000));
      if(!sunrise){skipped.push({date,reason:"No verifiable sunrise for the chosen local date."});continue;}
      const sunset=eventFor(date,query.timezone,observer,-1,new Date(sunrise.getTime()+60000));
      if(!sunset || sunset<=sunrise){skipped.push({date,reason:"No verifiable daylight interval."});continue;}
      const weekday=day.getUTCDay();
      const window=windowWithoutRahu(sunrise.getTime(),sunset.getTime(),weekday);
      if(!window){skipped.push({date,reason:"No 30-minute window after buffer and Rahu Kala exclusion."});continue;}
      const p=calculatePanchang({
        date:sunrise,lat:query.latitude,lon:query.longitude,
        elevation:query.elevation,tz:query.timezone
      });
      const tithiNo=p.tithi.number;
      const inFortnight=((tithiNo-1)%15)+1;
      const weekdayOk=FAV_WEEKDAYS[query.category].includes(weekday);
      const tithiOk=![4,9,14,15].includes(inFortnight);
      const reasons=[
        {text:WEEKDAYS[weekday]+(weekdayOk?" is listed in this archive-derived category's weekday set.":" is outside this category's preferred weekday set."),met:weekdayOk},
        {text:p.tithi.paksha+" "+p.tithi.name+(tithiOk?" is not in the screened Rikta/Amavasya-like subset.":" requires special traditional review."),met:tithiOk},
        {text:"Candidate avoids the computed daytime Rahu Kala segment with a one-hour sunrise/sunset buffer.",met:true}
      ];
      const criteriaMatched=Number(weekdayOk)+Number(tithiOk)+1;
      candidates.push({
        date,startUTC:window.startUTC,endUTC:window.endUTC,rahuKalaUTC:window.rahuKalaUTC,
        criteriaMatched,criteriaTotal:3,status:criteriaMatched===3?"screened":"review",
        panchang:{tithi:p.tithi.name,nakshatra:p.nakshatra.name,paksha:p.tithi.paksha,weekday:WEEKDAYS[weekday]},
        reasons
      });
    } catch(e) {
      skipped.push({date,reason:e instanceof Error?e.message:"Astronomical calculation not available."});
    }
  }
  candidates.sort((a,b)=>b.criteriaMatched-a.criteriaMatched||a.date.localeCompare(b.date));
  return {
    category:query.category,range:{from:query.from,to:query.to},location:{
      timezone:query.timezone,latitude:query.latitude,longitude:query.longitude,elevation:query.elevation
    },
    scannedDays:count,candidates:candidates.slice(0,query.limit),skipped,
    method:{
      provenance:"Archive-derived, simplified traditional screening rules + astronomy-engine",
      calculation:"Sunrise/sunset by location; Panchang at sunrise; weekday/tithi screening; daytime Rahu Kala exclusion.",
      status:"TRADITIONAL INTERPRETATION",
      warning:"These are candidates for community/qualified practitioner review, not guaranteed auspicious hours, official festival dates or a verified Muhurat declaration.",
      limitations:"Rule tables vary by tradition, event and regional authority. Natal matching, Lagna, Tara Bala and location-specific festivals are not yet implemented."
    }
  };
}
