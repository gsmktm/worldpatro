"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMoment } from "@/components/app-shell";
import { Icon } from "@/components/ui/icon";
import { MoonDisk } from "@/components/moon-vectors";
import { civilDate, momentQuery } from "@/lib/ui/moment";
import type { DaySnapshot } from "@/lib/ui/day-types";
import type { VedicDaylightResult, TimeWindow } from "@/lib/vedic-windows";

type VedicSnapshot=DaySnapshot & {
  panchang:DaySnapshot["panchang"] & {
    karana:{name:string;number:number};
    nakshatra:{name:string;number:number};
    yoga:{name:string;number:number};
    ayanamsa:number;
    interpretationBoundary:string;
  };
  daylight:VedicDaylightResult;
  boundaries:{astronomy:string;tradition:string;publisher:string};
};
type Tab="choghadiya"|"hora";
const LINKS=[
  {path:"/app/patro",icon:"calendar",en:"9 calendars",ne:"नौ पात्रो",detail:"Nepal BS, Nepal Sambat & world traditions"},
  {path:"/app/panchang",icon:"sunrise",en:"Panchang studio",ne:"पञ्चाङ्ग",detail:"Sun, Moon & five limbs"},
  {path:"/app/moon",icon:"moon",en:"Moon Observatory",ne:"चन्द्र दर्शन",detail:"Phases, Moon size, dates & 12 original rāśi vectors"},
  {path:"/app/muhurat",icon:"hourglass",en:"Muhurat finder",ne:"मुहूर्त खोज",detail:"Screen candidate dates and windows"},
  {path:"/app/kundli",icon:"chart",en:"Birth chart",ne:"जन्मकुण्डली",detail:"Graha, Lagna, Varga & Dasha"},
  {path:"/app/astrology",icon:"orbit",en:"Planetary observatory",ne:"ग्रह वेधशाला",detail:"Astronomy and traditional interpretation"},
  {path:"/app/festivals",icon:"leaf",en:"Festivals",ne:"चाडपर्व",detail:"Only reviewed observances"},
  {path:"/app/learn",icon:"book",en:"Learn Vedic time",ne:"वैदिक ज्ञान",detail:"Published educational articles"},
  {path:"/app/sources",icon:"fileCheck",en:"Sources and methods",ne:"स्रोत र विधि",detail:"Traceable authority and provenance"}
];
const TITHI_NE:Record<string,string>={
 Pratipada:"प्रतिपदा",Dwitiya:"द्वितीया",Tritiya:"तृतीया",Chaturthi:"चतुर्थी",
 Panchami:"पञ्चमी",Shashthi:"षष्ठी",Saptami:"सप्तमी",Ashtami:"अष्टमी",
 Navami:"नवमी",Dashami:"दशमी",Ekadashi:"एकादशी",Dwadashi:"द्वादशी",
 Trayodashi:"त्रयोदशी",Chaturdashi:"चतुर्दशी",Purnima:"पूर्णिमा",Amavasya:"औँसी"
};
const PAKSHA_NE:Record<string,string>={Shukla:"शुक्ल",Krishna:"कृष्ण"};
const WEEK_NE:Record<string,string>={Sunday:"आइतबार",Monday:"सोमबार",Tuesday:"मङ्गलबार",Wednesday:"बुधबार",Thursday:"बिहीबार",Friday:"शुक्रबार",Saturday:"शनिबार"};
function timeNow(date:Date,timezone:string){
 return new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:timezone}).format(date);
}
function displayDate(day:string,ne:boolean){
 return new Intl.DateTimeFormat(ne?"ne-NP-u-ca-gregory":"en-US",{day:"numeric",month:"long",year:"numeric",weekday:"long",timeZone:"UTC"}).format(new Date(day+"T12:00:00Z"));
}
export default function VedicHub(){
 const {moment,href}=useMoment(),router=useRouter(),ne=moment.locale==="ne";
 const query=momentQuery(moment);
 const [data,setData]=useState<VedicSnapshot|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [retry,setRetry]=useState(0);
 const [tab,setTab]=useState<Tab>("choghadiya");
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{const tick=()=>setNow(new Date());tick();const interval=setInterval(tick,30000);return()=>clearInterval(interval);},[]);
 useEffect(()=>{
   const controller=new AbortController();
   setLoading(true);setError("");setData(null);
   fetch("/api/v1/vedic/day?"+query,{signal:controller.signal,cache:"no-store"})
     .then(async res=>{const payload=await res.json();if(!res.ok)throw new Error(payload.error||"Daily data is unavailable.");return payload as VedicSnapshot;})
     .then(payload=>{if(!controller.signal.aborted)setData(payload);})
     .catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:"Unable to load this date.");})
     .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
   return()=>controller.abort();
 },[query,retry]);
 function setDay(date:string){router.replace("/app/vedic?"+momentQuery({...moment,date}),{scroll:false});}
 const clock=now?timeNow(now,moment.tz):null;
 const isToday=now!==null&&civilDate(now,moment.tz)===moment.date;
 const p=data?.panchang;
 const moonAngle=p?.moon.phaseAngle??0;
 const moonLit=Math.max(0,Math.min(100,50*(1-Math.cos(moonAngle*Math.PI/180))));
 const daylight=data?.daylight;
 const windows=daylight?.status==="calculated"?(tab==="choghadiya"?daylight.choghadiya:daylight.hora):[];
 const bs=data?.calendars.find(item=>item.id==="bs");
 const truthLabel=bs&&(bs.status==="authority-sourced"||bs.status==="public-dataset")?bs.value:null;
 function current(w:TimeWindow){return Boolean(isToday&&clock&&w.start<=clock&&clock<w.end);}
 return <div className="vedic" aria-busy={loading}>
   <header className="vedic-hero">
     <div className="vedic-hero-text">
       <span className="wp-overline">ॐ · WORLD PATRO / VEDIC OBSERVATORY</span>
       <h1>{ne?"वैदिक समय, विश्व पात्रो":"Vedic time. One world."}</h1>
       <p>{ne?"नेपालबाट विश्वसम्म—प्रमाणित मिति, खगोलीय गणना र परम्परागत व्याख्या छुट्टाछुट्टै।":"From Nepal to the world. Civil dates, measured astronomy and traditional guidance, clearly distinguished."}</p>
       <div className="vedic-pills"><span>☼ {ne?"सूर्य–चन्द्र":"Sun & Moon"}</span><span>९ {ne?"पात्रो":"Calendars"}</span><span>ॐ {ne?"पञ्चाङ्ग":"Panchang"}</span><span>{ne?"स्रोतसहित":"Source-aware"}</span></div>
     </div>
     <div className="vedic-sky" aria-hidden="true"><div className="vedic-orbit one"/><div className="vedic-orbit two"/><div className="vedic-orbit three"/><span>ॐ</span><small>सूर्य · चन्द्र · काल</small></div>
   </header>

   <section className="vedic-controls" aria-label={ne?"मिति र स्थान":"Date and place"}>
     <div><label htmlFor="vedic-date">{ne?"मिति छान्नुहोस्":"Choose a civil date"}</label>
       <input id="vedic-date" type="date" min="1900-01-01" max="2100-12-31" value={moment.date} onChange={e=>{if(e.target.value)setDay(e.target.value);}}/></div>
     <button type="button" className="vedic-today" onClick={()=>setDay(civilDate(new Date(),moment.tz))}>{ne?"आज":"Today"}</button>
     <div className="vedic-location"><Icon name="pin" size={16}/><span>{moment.tz.replaceAll("_"," ")}<small>{moment.lat.toFixed(3)}°, {moment.lon.toFixed(3)}° · {ne?"स्थान मुख्य मेनुबाट बदल्नुहोस्":"Change city in top navigation"}</small></span></div>
     <button type="button" className="vedic-reload" aria-label="Recalculate selected Vedic day" onClick={()=>setRetry(r=>r+1)}><Icon name="refresh" size={17}/></button>
   </section>
   <div className="vedic-datebar"><div><span className="wp-overline">{ne?"छानिएको दिन":"SELECTED CIVIL DAY"}</span><h2>{displayDate(moment.date,ne)}</h2><small>{truthLabel|| (ne?"यो मितिको आधिकारिक वि.सं. सन्दर्भ उपलब्ध छैन":"Source-backed BS date not available for this day")}</small></div><div className="vedic-clock"><span>{isToday?(ne?"अहिले":"LOCAL NOW"):(ne?"छानिएको दिन":"SELECTED DATE")}</span><strong>{isToday?clock:"—:—"}</strong><small>{moment.tz}</small></div></div>
   {error&&<div className="vedic-error" role="alert">{error} <button type="button" onClick={()=>setRetry(r=>r+1)}>{ne?"पुनः प्रयास":"Try again"}</button></div>}
   {loading&&<p role="status" className="vedic-loading">{ne?"स्थानीय सूर्योदय र पञ्चाङ्ग गणना हुँदैछ…":"Calculating location-based astronomy and traditional day segments…"}</p>}
   <section className="vedic-panel">
     <div className="vedic-section-head"><div><span className="wp-overline">०१ / PANCHANGA</span><h2>{ne?"पञ्चाङ्गका पाँच अङ्ग":"Five limbs of the Panchang"}</h2></div><Link href={href("/app/panchang")}>{ne?"पूरा पञ्चाङ्ग":"Full Panchang"} <Icon name="arrow" size={15}/></Link></div>
     <div className="vedic-limbs">
       {[
         {en:"Vara · Weekday",ne:"वार",value:daylight?.weekday,detail:daylight?.weekday?WEEK_NE[daylight.weekday]:""},
         {en:"Tithi",ne:"तिथि",value:p?.tithi.name,detail:(p?.tithi.paksha||"")+" · "+(p?.tithi.number||"")},
         {en:"Nakshatra",ne:"नक्षत्र",value:p?.nakshatra.name,detail:p?.nakshatra.number?"#"+p.nakshatra.number:""},
         {en:"Yoga",ne:"योग",value:p?.yoga.name,detail:p?.yoga.number?"#"+p.yoga.number:""},
         {en:"Karana",ne:"करण",value:p?.karana.name,detail:p?.karana.number?"#"+p.karana.number:""}
       ].map((c,i)=><article key={c.en} className="vedic-limb"><span className="vedic-limb-number">0{i+1}</span><small>{ne?c.ne:c.en}</small><strong>{c.value?(ne&&c.en==="Tithi"?TITHI_NE[c.value]||c.value:c.value):"—"}</strong><span>{ne&&c.en==="Vara"?c.detail:ne&&c.en==="Tithi"?(PAKSHA_NE[p?.tithi.paksha||""]||p?.tithi.paksha)+" पक्ष":c.detail}</span></article>)}
     </div>
     <div className="vedic-sun-strip">
       {[
         {label:ne?"सूर्योदय":"Sunrise",value:p?.sunTimes.sunrise,icon:"sunrise"},
         {label:ne?"सूर्यास्त":"Sunset",value:p?.sunTimes.sunset,icon:"sun"},
         {label:ne?"चन्द्रोदय":"Moonrise",value:p?.moonTimes.moonrise,icon:"moon"},
         {label:ne?"चन्द्रास्त":"Moonset",value:p?.moonTimes.moonset,icon:"moon"}
       ].map(item=><div key={item.label}><Icon name={item.icon} size={19}/><span>{item.label}</span><strong>{item.value||"—"}</strong></div>)}
     </div>
     <p className="vedic-method"><Icon name="fileCheck" size={15}/>{ne?"तिथि, नक्षत्र, योग र करण छानिएको दिनको स्थानीय मध्यान्हमा गणना गरिएका हुन्। समयसँगै बदलिन सक्छन्।":"Tithi, Nakshatra, Yoga and Karana are sampled at local civil noon, not throughout the whole day."} {p?.method||""}</p>
   </section>

   <section className="vedic-panel vedic-moon-preview" aria-label={ne?"चन्द्र दर्शन":"Moon Observatory"}>
     <div className="vedic-moon-illustration"><MoonDisk phaseDegrees={moonAngle} illuminationPercent={moonLit} size={210}/></div>
     <div><span className="wp-overline">☾ / MOON PHASE · CALENDAR DATES · 12 RĀŚI</span>
       <h2>{ne?"चन्द्र दर्शन र बाह्र राशि":"The Moon, bigger and clearer."}</h2>
       <p>{ne?"वास्तविक खगोलीय दूरी र कोणीय आकार, आउँदा पूर्णिमा–औँसीका मिति, चौध दिनका चन्द्रकला र बाह्र राशिका अद्वितीय SVG चिह्नहरू।":"Explore its calculated angular size, upcoming New and Full Moon dates, a 14-day lunar strip and twelve unique SVG zodiac signs."}</p>
       <Link className="wp-button wp-button-gold" href={href("/app/moon")}>{ne?"चन्द्र वेधशाला खोल्नुहोस्":"Explore Moon Observatory"} <Icon name="arrow" size={16}/></Link>
       <small>{ne?"यस सानो चित्रको प्रकाश प्रतिशत दीर्घांशबाट अनुमान गरिएको हो। विस्तृत मान वेधशालामा छन्।":"Preview illumination is an elongation-based illustration; the Moon Studio uses Astronomy Engine's illuminated fraction."}</small>
     </div>
   </section>

   <section className="vedic-panel" id="vedic-daily-windows">
     <div className="vedic-section-head"><div><span className="wp-overline">०२ / DAYLIGHT WINDOWS</span><h2>{ne?"दैनिक परम्परागत समयचक्र":"Traditional daytime cycles"}</h2></div><Link href={href("/app/muhurat")}>{ne?"मुहूर्त खोज":"Muhurat finder"} <Icon name="arrow" size={15}/></Link></div>
     <div className="vedic-tabs" role="group" aria-label="Select daytime window type">
       <button type="button" aria-pressed={tab==="choghadiya"} onClick={()=>setTab("choghadiya")}>{ne?"चौघडिया":"Choghadiya"} · 8</button>
       <button type="button" aria-pressed={tab==="hora"} onClick={()=>setTab("hora")}>{ne?"होरा":"Planetary Hora"} · 12</button>
     </div>
     {daylight?.status==="unavailable"&&<p className="vedic-unavailable" role="status">{ne?"यो स्थान वा मितिमा विश्वसनीय सूर्योदय–सूर्यास्तबाट समयचक्र निकाल्न सकिएन।":"Daytime intervals unavailable: sunrise/sunset could not be established safely for this location and date."}</p>}
     <div className="vedic-windows">{windows.map((window,i)=><article key={tab+"-"+i} className={"vedic-window "+window.kind+(current(window)?" current":"")}>
       <div><small>{String(i+1).padStart(2,"0")}</small>{current(window)&&<span className="vedic-now">{ne?"अहिले":"NOW"}</span>}</div>
       <strong>{ne?window.ne:window.name}</strong><time>{window.start} – {window.end}</time>
     </article>)}</div>
     <div className="vedic-intervals">
       <article><span>{ne?"राहुकाल · परम्परागत":"Rahu Kala · traditional"}</span><strong>{daylight?.rahuKala?daylight.rahuKala.start+" – "+daylight.rahuKala.end:"—"}</strong><small>{ne?"दिनको आठ भागमा आधारित":"One of eight daylight segments"}</small></article>
       <article><span>{ne?"अभिजित् · परम्परागत":"Abhijit · traditional"}</span><strong>{daylight?.abhijit?daylight.abhijit.start+" – "+daylight.abhijit.end:"—"}</strong><small>{ne?"सबै परम्परा वा बुधबारका लागि समान हुँदैन":"Not universally recommended, especially Wednesday"}</small></article>
     </div>
     <p className="vedic-method">{daylight?.warning||"Traditional rule-based windows will appear after the solar calculation. No definitive event suitability is asserted."}</p>
   </section>

   <section className="vedic-panel">
     <div className="vedic-section-head"><div><span className="wp-overline">०३ / THE COMPLETE WORLD PATRO</span><h2>{ne?"वैदिक ज्ञानदेखि विश्व समयसम्म":"From Vedic knowledge to world time"}</h2></div><Link href={href("/app/ecosystem")}>{ne?"सबै साधन":"All modules"} <Icon name="arrow" size={15}/></Link></div>
     <div className="vedic-link-grid">{LINKS.map(link=><Link key={link.path} href={href(link.path)} className="vedic-link"><span className="vedic-link-icon"><Icon name={link.icon} size={21}/></span><strong>{ne?link.ne:link.en}</strong><small>{link.detail}</small><Icon name="arrow" size={14}/></Link>)}</div>
   </section>
   <footer className="vedic-footnote"><strong>WORLD PATRO · TRUST LAYERS</strong><span>{ne?"खगोल ≠ धार्मिक अधिकार ≠ ज्योतिषीय व्याख्या":"Astronomy ≠ religious authority ≠ astrological interpretation"}</span><span>{data?.generatedAt? (ne?"गणना समय: ":"Generated: ")+new Intl.DateTimeFormat(ne?"ne-NP":"en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:moment.tz}).format(new Date(data.generatedAt)):""} · {moment.tz}</span><Link href={href("/app/sources")}>{ne?"स्रोत र सीमा":"Methods & limitations"}</Link></footer>
 </div>;
}
