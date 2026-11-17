import { BS_PUBLISHED_MONTHS, publishedBsFromAD } from "@/lib/nepal-bs-authority";

export const CALENDAR_IDS=[
 "vedic","gregorian","bs","nepal-sambat","hijri","chinese","hebrew","persian","buddhist"
] as const;
export type CalendarId=typeof CALENDAR_IDS[number];
export type MonthCell={
 date:string;day:string;ad:string;inMonth:boolean;
 source:"calculated"|"municipality-published"|"public-open-dataset"|"source-required"|"astronomy-required";
};
export type CalendarMonth={
 id:CalendarId;title:string;status:"calculated"|"authority-sourced"|"public-dataset"|"authority-required"|"astronomy-required";
 mode:"native"|"gregorian-reference";source:string;note:string;
 start:string;end:string;previousDate:string|null;nextDate:string|null;
 days:MonthCell[];
};

const DAY=86400000;
const intlIds:Partial<Record<CalendarId,string>>={
 gregorian:"gregory",hijri:"islamic-civil",chinese:"chinese",
 hebrew:"hebrew",persian:"persian",buddhist:"buddhist"
};
const formatters=new Map<string,Intl.DateTimeFormat>();
function formatter(calendar:string){
 const existing=formatters.get(calendar);
 if(existing)return existing;
 // ICU supplies month names, including Hebrew Adar I/II and Chinese leap months.
 const next=new Intl.DateTimeFormat("en-US-u-nu-latn",{
  calendar,timeZone:"UTC",year:"numeric",month:"long",day:"numeric"
 });
 formatters.set(calendar,next);return next;
}
function iso(ms:number){return new Date(ms).toISOString().slice(0,10);}
function millis(date:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Invalid Gregorian date.");
 const ms=Date.parse(date+"T12:00:00.000Z");
 if(!Number.isFinite(ms)||iso(ms)!==date||Number(date.slice(0,4))<1900||Number(date.slice(0,4))>2100)
  throw new Error("Gregorian date must be real and between 1900 and 2100.");
 return ms;
}
function supported(ms:number){const y=Number(iso(ms).slice(0,4));return y>=1900&&y<=2100;}
function parts(ms:number,calendar:string){
 const p=Object.fromEntries(formatter(calendar).formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
 const day=Number(p.day);
 if(!Number.isInteger(day)||day<1||day>31)throw new Error("Calendar day not supported by this ICU runtime.");
 return {day,month:p.month||"",year:p.year||p.relatedYear||"",era:p.era||"",yearName:p.yearName||""};
}
function gregorianMonth(date:string){
 const [y,m]=date.split("-").map(Number);
 const start=Date.UTC(y,m-1,1,12);
 const next=Date.UTC(y,m,1,12);
 return {start,next,title:new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(start))};
}
function intlMonth(ms:number,calendar:string){
 let start=ms;
 for(let i=0;i<35&&parts(start,calendar).day!==1;i++)start-=DAY;
 if(parts(start,calendar).day!==1)throw new Error("Unable to locate calendar month start.");
 let next=start+DAY;
 for(let i=0;i<35&&parts(next,calendar).day!==1;i++)next+=DAY;
 if(parts(next,calendar).day!==1)throw new Error("Unable to locate calendar month end.");
 const p=parts(start,calendar);
 const title=p.month+" "+p.year+(p.yearName?" ("+p.yearName+")":"")+(p.era?" "+p.era:"");
 return {start,next,title};
}
function coverage(ms:number){
 const d=iso(ms);
 return publishedBsFromAD(d);
}
function cell(ms:number,id:CalendarId,calendar:string|undefined,refOnly:boolean):MonthCell{
 const date=iso(ms);
 const ad=date.slice(5).replace("-","/");
 if(refOnly)return {date,day:date.slice(8),ad,source:id==="vedic"?"astronomy-required":"source-required",inMonth:false};
 if(id==="bs"){
  const b=coverage(ms);
  return {date,day:b?String(b.bsDay):"—",ad,
   source:b?.provenance.verification??"source-required",inMonth:false};
 }
 return {date,day:String(parts(ms,calendar!).day),ad,source:"calculated",inMonth:false};
}

/** All month navigation is anchored to real AD days. Neither Nepali source gaps nor
 * Vedic solar/lunar rules are filled with guessed month boundaries. */
export function buildCalendarMonth(date:string,id:CalendarId,locale:"ne"|"en"="en"):CalendarMonth{
 const anchor=millis(date);
 if(!CALENDAR_IDS.includes(id))throw new Error("Unknown calendar.");
 const b=id==="bs"?coverage(anchor):null;
 const row=b?BS_PUBLISHED_MONTHS.find(r=>r.bsYear===b.bsYear&&r.bsMonth===b.bsMonth):null;
 const intl=intlIds[id];
 const refOnly=id==="vedic"||id==="nepal-sambat"||(id==="bs"&&!row);
 const span=row
  ? {start:Date.parse(row.startsAD+"T12:00:00Z"),next:Date.parse(row.startsAD+"T12:00:00Z")+row.length*DAY,
     title:(locale==="ne"?row.nameNe:row.nameEn)+" "+(locale==="ne"?new Intl.NumberFormat("ne-NP").format(row.bsYear):row.bsYear)}
  : refOnly?gregorianMonth(date):intlMonth(anchor,intl!);
 const monthStatus:CalendarMonth["status"]=id==="vedic"?"astronomy-required":
  id==="nepal-sambat"||id==="bs"&&!row?"authority-required":
  id==="bs"?(row?.verification==="municipality-published"?"authority-sourced":"public-dataset"):"calculated";
 const source=id==="vedic"?"Astronomical Panchang requires selected location, instant and tradition":
  id==="nepal-sambat"?"Nepal Sambat month and date mapping requires reviewed lunisolar sources":
  id==="bs"?(row?row.publisher+" · "+row.verification:"Reviewed BS calendar source missing for this date"):
  "Intl/ICU "+intl+" · civil date calculation";
 const note=refOnly
  ? "Gregorian reference month only. No "+(id==="vedic"?"Vedic lunar month boundaries":"Nepal Sambat or unsupported BS dates")+" are inferred."
  : id==="bs"?"Civil BS/AD correspondence only; not an official festival or Panchang determination."
  : id==="hijri"?"Tabular Islamic civil calendar; observed religious dates may vary by location."
  : id==="chinese"?"Chinese lunar and leap months follow the ICU calendar profile; specialist historical checks may differ."
  : id==="hebrew"?"Hebrew calendar months are ICU-calculated. Religious days begin at sunset."
  : "Calculated civil calendar using Intl/ICU.";
 const previousDate=supported(span.start-DAY)?iso(span.start-DAY):null;
 const nextDate=supported(span.next)?iso(span.next):null;
 const offset=new Date(span.start).getUTCDay();
 const first=span.start-offset*DAY;
 const days=Array.from({length:42},(_,i)=>{
  const ms=first+i*DAY;
  const c=cell(ms,id,intl,refOnly);
  c.inMonth=ms>=span.start&&ms<span.next;
  return c;
 });
 return {id,title:refOnly?"Gregorian reference · "+span.title:span.title,
  status:monthStatus,mode:refOnly?"gregorian-reference":"native",
  source,note,start:iso(span.start),end:iso(span.next-DAY),previousDate,nextDate,days};
}
