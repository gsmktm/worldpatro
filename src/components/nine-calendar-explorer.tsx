"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CalendarResult } from "@/lib/calendars";
import { buildCalendarMonth, CALENDAR_IDS, type CalendarId } from "@/lib/calendar-month";
import styles from "./nine-calendar-explorer.module.css";

type Props={
 date:string;locale:"ne"|"en";calendars:CalendarResult[];
 active:CalendarId;onActiveChange:(id:CalendarId)=>void;
 onSelect:(date:string,calendar:CalendarId)=>void;panchangUrl:string;
};
const statusWords:Record<string,string>={
 calculated:"Calculated", "authority-sourced":"Municipal source",
 "public-dataset":"CC0 open reference", "authority-required":"Source needed",
 "astronomy-required":"Astronomy"
};
function csvQuote(raw:string){return '"'+raw.replace(/"/g,'""')+'"';}

export default function NineCalendarExplorer({date,locale,calendars,active,onActiveChange,onSelect,panchangUrl}:Props){
 const [cursor,setCursor]=useState(date);
 const [notice,setNotice]=useState("");
 useEffect(()=>{setCursor(date);},[date]);
 const view=useMemo(()=>buildCalendarMonth(cursor,active,locale),[cursor,active,locale]);
 const selected=calendars.find(c=>c.id===active);
 const num=new Intl.NumberFormat(locale==="ne"?"ne-NP":"en-US");
 const isReference=view.mode==="gregorian-reference";

 function choose(id:CalendarId){onActiveChange(id);setCursor(date);setNotice("");}
 function navigate(next:string|null){if(next){setCursor(next);setNotice("");}}
 function exportCsv(){
  if(isReference)return;
  const rows=[
   ["AD date","Calendar","Calendar day","Source classification"],
   ...view.days.filter(d=>d.inMonth).map(d=>[d.date,selected?.name??active,d.day,d.source])
  ];
  const value="\uFEFF"+rows.map(row=>row.map(csvQuote).join(",")).join("\r\n")+"\r\n";
  const url=URL.createObjectURL(new Blob([value],{type:"text/csv;charset=utf-8"}));
  const anchor=document.createElement("a");anchor.href=url;
  anchor.download="worldpatro-"+active+"-"+view.start+".csv";
  anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  setNotice("Month date mapping exported. Religious observance approval is not implied.");
 }
 async function copyDate(){
  try{await navigator.clipboard.writeText(date+" AD · "+(selected?.value??""));
   setNotice("Selected date and calendar label copied.");}
  catch{setNotice("Clipboard permission unavailable. Use the calendar date buttons instead.");}
 }
 return <section id="patro-nine-months" className={styles.explorer} aria-labelledby="nine-month-title">
  <div className={styles.header}>
   <div>
    <span className={styles.eyebrow}>9 CALENDARS · 1 TIMELINE · WORLD PATRO</span>
    <h2 id="nine-month-title">{locale==="ne"?"नौ पात्रो, एउटै दिन":"Explore every calendar"}</h2>
    <p>{locale==="ne"?"एउटा पात्रो रोज्नुहोस्। वास्तविक महिनामा दिन छानेपछि नौवटै पात्रो र पञ्चाङ्ग अद्यावधिक हुन्छन्।":"Choose a calendar, browse its actual months and select any civil day to refresh all nine calendar readings."}</p>
   </div>
   <span className={styles.seal} aria-hidden="true">ॐ</span>
  </div>

  <div className={styles.choices} role="group" aria-label="Choose one of nine calendar profiles">
   {CALENDAR_IDS.map(id=>{
    const item=calendars.find(c=>c.id===id);
    return <button type="button" key={id} className={styles.choice+(active===id?" "+styles.chosen:"")}
     aria-pressed={active===id} onClick={()=>choose(id)}>
     <span aria-hidden="true" className={styles.symbol}>{item?.icon??"◷"}</span>
     <span className={styles.choiceLabel}><strong>{item?.name??id}</strong>
      <small>{statusWords[item?.status??"authority-required"]}</small></span>
    </button>;
   })}
  </div>

  <div className={styles.workspace}>
   <div className={styles.monthHeader}>
    <div>
     <span className={styles.eyebrow}>{isReference?"REFERENCE NAVIGATION":"CALENDAR-SPECIFIC MONTH"}</span>
     <h3>{view.title}</h3>
     <p>{view.start} – {view.end} AD</p>
    </div>
    <div className={styles.controls}>
     <button type="button" onClick={()=>navigate(view.previousDate)} disabled={!view.previousDate}
      aria-label={locale==="ne"?"अघिल्लो महिना":"Previous month"}>‹</button>
     <button type="button" className={styles.reset} onClick={()=>navigate(date)}>
      {locale==="ne"?"छानिएको दिन":"Selected day"}</button>
     <button type="button" onClick={()=>navigate(view.nextDate)} disabled={!view.nextDate}
      aria-label={locale==="ne"?"अर्को महिना":"Next month"}>›</button>
    </div>
   </div>
   <div className={styles.week} aria-hidden="true">
    {(locale==="ne"?["आइत","सोम","मङ्गल","बुध","बिही","शुक्र","शनि"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]).map(x=><span key={x}>{x}</span>)}
   </div>
   <div className={styles.grid}>
    {view.days.map((cell,i)=>{
     const current=cell.date===date,available=cell.day!=="—";
     return <button type="button" key={cell.date} disabled={!available} onClick={()=>onSelect(cell.date,active)}
      aria-pressed={current} title={cell.date+" AD · "+(isReference?"Gregorian reference":cell.day+" "+active)+" · "+statusWords[view.status]}
      aria-label={cell.date+" AD, "+(isReference?"Gregorian reference date":cell.day+" in "+(selected?.name??active))+(current?", selected":"")}
      className={styles.cell+(cell.inMonth?"":" "+styles.outside)+(current?" "+styles.selected:"")+(i%7===6?" "+styles.saturday:"")}>
      <strong>{Number.isFinite(Number(cell.day))?num.format(Number(cell.day)):cell.day}</strong>
      <small>{isReference?"AD":active==="gregorian"?"":cell.ad+" AD"}</small>
      {cell.source==="public-open-dataset"&&<i aria-label="Open data" className={styles.dot}/>}
     </button>;
    })}
   </div>
   <div className={styles.explanation}>
    <div className={styles.sourceHead}><span className={styles.sourceTag}>{statusWords[view.status]}</span><strong>{view.source}</strong></div>
    <p>{view.note}</p>
    {active==="vedic"&&<Link href={panchangUrl}>Open location-aware Panchang →</Link>}
    {active==="nepal-sambat"&&<Link href="/app/authorities">Review Nepal Sambat source requirements →</Link>}
    {active==="bs"&&<Link href="#bs-converter">Open BS ↔ AD converter →</Link>}
    {!isReference&&<small>Small secondary date is Gregorian (AD). Gold dot marks an explicitly attributed open BS dataset.</small>}
   </div>
   <div className={styles.actions}>
    <button type="button" onClick={copyDate} disabled={!calendars.length}>Copy selected reading</button>
    <button type="button" onClick={exportCsv} disabled={isReference}>Export month CSV</button>
    <span>{isReference?"Only Gregorian reference dates are navigable; no unsupported calendar mapping is invented.":"Select any date to synchronize nine calendar cards."}</span>
   </div>
   {notice&&<p className={styles.notice} role="status">{notice}</p>}
  </div>
 </section>;
}
