"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { publishedBsFromAD } from "@/lib/nepal-bs-authority";
import { FESTIVALS } from "@/lib/festivals";

type Props = {
 value:string; onSelect:(date:string)=>void; compact?:boolean;
 locale?:"ne"|"en"; timezone?:string;
};

export function MonthCalendar({value,onSelect,compact=false,locale="en",timezone="Asia/Kathmandu"}:Props){
 const [month,setMonth]=useState(()=>value.slice(0,7)),[today,setToday]=useState("");
 useEffect(()=>{setMonth(value.slice(0,7));},[value]);
 useEffect(()=>{
  const p=new Intl.DateTimeFormat("en-US",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const part=(type:string)=>p.find(x=>x.type===type)?.value??"";
  setToday(part("year")+"-"+part("month")+"-"+part("day"));
 },[timezone]);

 const [year,m]=month.split("-").map(Number);
 const first=new Date(Date.UTC(year,m-1,1,12)),offset=first.getUTCDay();
 const days=Array.from({length:42},(_,i)=>{
  const d=new Date(Date.UTC(year,m-1,1-offset+i,12));
  const date=d.toISOString().slice(0,10);
  return {date,day:d.getUTCDate(),current:d.getUTCMonth()===m-1,
   bs:publishedBsFromAD(date),event:FESTIVALS.find(f=>f.date===date)};
 });
 const hasOpenData=days.some(d=>d.bs?.provenance.verification==="public-open-dataset");
 function move(n:number){
  const next=new Date(Date.UTC(year,m-1+n,1,12));
  if(next.getUTCFullYear()<1900||next.getUTCFullYear()>2100)return;
  setMonth(next.toISOString().slice(0,7));
 }
 const number=new Intl.NumberFormat(locale==="ne"?"ne-NP":"en");
 return <div className={"wp-calendar"+(compact?" compact":"")}>
  <div className="wp-calendar-head">
   <h3>{new Intl.DateTimeFormat(locale==="ne"?"ne-NP":"en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(first)}</h3>
   <div>
    <button type="button" className="wp-calendar-today" disabled={!today} onClick={()=>{setMonth(today.slice(0,7));onSelect(today);}}
     aria-label={locale==="ne"?"आजको मितिमा जानुहोस्":"Jump to today"}>{locale==="ne"?"आज":"Today"}</button>
    <button type="button" onClick={()=>move(-1)} aria-label={locale==="ne"?"अघिल्लो महिना":"Previous month"}><Icon name="chevron" size={15} className="wp-flip"/></button>
    <button type="button" onClick={()=>move(1)} aria-label={locale==="ne"?"अर्को महिना":"Next month"}><Icon name="chevron" size={15}/></button>
   </div>
  </div>
  <div className="wp-calendar-days">
   {(locale==="ne"?["आइत","सोम","मङ्गल","बुध","बिही","शुक्र","शनि"]:["Su","Mo","Tu","We","Th","Fr","Sa"]).map((d,i)=><span key={i} className={i===6?"saturday":""}>{d}</span>)}
   {days.map((d,i)=><button type="button" key={d.date} onClick={()=>onSelect(d.date)}
    aria-pressed={d.date===value} aria-current={d.date===today?"date":undefined}
    aria-label={d.date+(d.date===today?", today":"")+(d.bs?", BS "+d.bs.bsYear+"-"+d.bs.bsMonth+"-"+d.bs.bsDay:"")+(d.event?", "+d.event.title:"")}
    title={d.date+(d.bs?" · BS "+d.bs.bsYear+"-"+d.bs.bsMonth+"-"+d.bs.bsDay+" · "+(d.bs.provenance.verification==="municipality-published"?"municipal source":"CC0 open reference"):" · BS source pending")}
    className={[!d.current?"outside":"",d.date===value?"selected":"",d.date===today?"today":"",i%7===6?"saturday":"",d.event?"has-event":""].filter(Boolean).join(" ")}>
    <strong>{number.format(d.day)}</strong>
    {!compact&&<small className={d.bs?.provenance.verification==="public-open-dataset"?"open-source":""}>{d.bs?number.format(d.bs.bsDay):"—"}</small>}
    {d.event&&<i/>}
   </button>)}
  </div>
  <div className="wp-calendar-legend">
   <span><i/>{locale==="ne"?"प्रमाणसहित प्रकाशित चाडपर्व":"Reviewed observance"}</span>
   {!compact&&<span>{hasOpenData?(locale==="ne"?"सानो अङ्क: वि.सं. (नगरपालिका / CC0 खुला स्रोत)":"Small number: BS (municipal / CC0 open reference)"):(locale==="ne"?"सानो अङ्क: वि.सं. · — स्रोत आवश्यक":"Small number: BS · — source pending")}</span>}
  </div>
 </div>;
}
