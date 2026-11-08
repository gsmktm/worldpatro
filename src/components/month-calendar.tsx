"use client";
import {useEffect,useState} from "react";
import { Icon } from "@/components/ui/icon";
import { publishedBsFromAD } from "@/lib/nepal-bs-authority";
import { FESTIVALS } from "@/lib/festivals";
export function MonthCalendar({value,onSelect,compact=false,locale="en"}:{value:string;onSelect:(date:string)=>void;compact?:boolean;locale?:"ne"|"en"}){
 const [month,setMonth]=useState(()=>value.slice(0,7));
 useEffect(()=>{setMonth(value.slice(0,7));},[value]);
 const [year,m]=month.split("-").map(Number),first=new Date(Date.UTC(year,m-1,1,12)),offset=first.getUTCDay();
 const days=Array.from({length:42},(_,i)=>{const d=new Date(Date.UTC(year,m-1,1-offset+i,12));const date=d.toISOString().slice(0,10);return {date,day:d.getUTCDate(),current:d.getUTCMonth()===m-1,bs:publishedBsFromAD(date),event:FESTIVALS.find(f=>f.date===date)};});
 function move(n:number){const next=new Date(Date.UTC(year,m-1+n,1,12));if(next.getUTCFullYear()<1900||next.getUTCFullYear()>2100)return;setMonth(next.toISOString().slice(0,7));}
 return <div className={"wp-calendar"+(compact?" compact":"")}>
  <div className="wp-calendar-head"><h3>{new Intl.DateTimeFormat(locale==="ne"?"ne-NP":"en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(first)}</h3><div><button onClick={()=>move(-1)} aria-label="Previous month"><Icon name="chevron" size={15} className="wp-flip"/></button><button onClick={()=>move(1)} aria-label="Next month"><Icon name="chevron" size={15}/></button></div></div>
  <div className="wp-calendar-days">{(locale==="ne"?["आइत","सोम","मङ्गल","बुध","बिही","शुक्र","शनि"]:["Su","Mo","Tu","We","Th","Fr","Sa"]).map((d,i)=><span key={i} className={i===6?"saturday":""}>{d}</span>)}
  {days.map((d,i)=><button key={d.date} onClick={()=>onSelect(d.date)} aria-pressed={d.date===value} aria-label={d.date+(d.event?", "+d.event.title:"")} className={[!d.current?"outside":"",d.date===value?"selected":"",i%7===6?"saturday":"",d.event?"has-event":""].join(" ")}><strong>{locale==="ne"?new Intl.NumberFormat("ne-NP").format(d.day):d.day}</strong>{!compact&&<small>{d.bs?new Intl.NumberFormat(locale==="ne"?"ne-NP":"en").format(d.bs.bsDay):"—"}</small>}{d.event&&<i/>}</button>)}</div>
  <div className="wp-calendar-legend"><span><i/> {locale==="ne"?"प्रकाशित चाडपर्व":"Reviewed observance"}</span>{!compact&&<span>{locale==="ne"?"सानो अङ्क: वि.सं.":"Small number: BS · — source pending"}</span>}</div>
 </div>;
}
