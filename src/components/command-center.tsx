"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {useMoment} from "@/components/app-shell";
import {Icon} from "@/components/ui/icon";
import {MonthCalendar} from "@/components/month-calendar";
import {TruthChip} from "@/components/ui/truth-chip";
import {calendarTruth} from "@/lib/ui/truth";
import {FESTIVALS,FESTIVAL_SOURCE} from "@/lib/festivals";
import {momentQuery} from "@/lib/ui/moment";
import type {DaySnapshot} from "@/lib/ui/day-types";
const quick=[{slug:"patro#bs-converter",icon:"swap",title:"Date converter",ne:"मिति परिवर्तन",detail:"AD ↔ BS"},
{slug:"kundli",icon:"chart",title:"Birth chart",ne:"जन्मकुण्डली",detail:"Your celestial map"},
{slug:"muhurat",icon:"sun",title:"Find a muhurat",ne:"मुहूर्त खोज्नुहोस्",detail:"A time to begin"},
{slug:"numerology",icon:"grid",title:"Numerology",ne:"अङ्कशास्त्र",detail:"Numbers & patterns"},
{slug:"planner",icon:"bell",title:"My planner",ne:"मेरो योजना",detail:"Make room for what matters"},
{slug:"tools",icon:"tools",title:"Everyday tools",ne:"उपयोगी साधन",detail:"Small tools, useful answers"}];
export default function CommandCenter(){
 const {moment,href}=useMoment(),router=useRouter(),ne=moment.locale==="ne";
 const [day,setDay]=useState<DaySnapshot|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(true),[reload,setReload]=useState(0);
 const [clock,setClock]=useState<Date|null>(null);
 const query=momentQuery(moment);
 useEffect(()=>{const tick=()=>setClock(new Date());tick();const t=setInterval(tick,1000);return()=>clearInterval(t);},[]);
 useEffect(()=>{const ctrl=new AbortController();setBusy(true);setError("");setDay(null);
  fetch("/api/v1/patro/day?"+query,{signal:ctrl.signal,cache:"no-store"}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||"Your day could not be loaded.");if(!ctrl.signal.aborted)setDay(data);}).catch(e=>{if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:"Connection unavailable.");}).finally(()=>{if(!ctrl.signal.aborted)setBusy(false);});
  return()=>ctrl.abort();
 },[query,reload]);
 const selected=new Date(moment.date+"T12:00:00Z"),bs=day?.calendars.find(c=>c.id==="bs"),p=day?.panchang;
 const upcoming=FESTIVALS.filter(f=>f.date>=moment.date).slice(0,4),todayFestival=FESTIVALS.find(f=>f.date===moment.date);
 const weekday=new Intl.DateTimeFormat(ne?"ne-NP":"en-US",{weekday:"long",timeZone:"UTC"}).format(selected);
 return <div className="wp-dashboard">
  <div className="wp-page-intro"><div><div className="wp-overline"><span/> {ne?"समयसँग जोडिनुहोस्":"YOUR DAILY CONNECTION"}</div><h1>{ne?"तपाईंको समय। तपाईंको संसार।":"Your time. Your world."}</h1><p>{ne?"संस्कृति, समय र सम्भावना—एकै ठाउँमा।":"A thoughtful space for your day, your traditions, and everything beyond."}</p></div><Link href={href("/app/planner")} className="wp-button wp-button-soft"><Icon name="plus" size={16}/>{ne?"योजना थप्नुहोस्":"Plan something"}</Link></div>
  <div className="wp-overview-grid">
   <section className="wp-day-hero">
    <div className="wp-day-top"><span className="wp-overline">ॐ &nbsp; {ne?"आजको क्षण":"THE MOMENT YOU ARE IN"}</span><span className="wp-live-label"><i/>{weekday}</span></div>
    <div className="wp-day-main"><div className="wp-day-copy"><div className="wp-big-date">{new Intl.DateTimeFormat(ne?"ne-NP":"en-US",{day:"numeric",timeZone:"UTC"}).format(selected)}<span>{new Intl.DateTimeFormat(ne?"ne-NP":"en-US",{month:"long",year:"numeric",timeZone:"UTC"}).format(selected)}</span></div>
      <p className="wp-bs-line">{busy?(ne?"पात्रो गणना हुँदैछ…":"Bringing the calendars together…"):bs?.status==="authority-sourced"?bs.value:(ne?"यस मितिको वि.सं. स्रोत आवश्यक":"BS date · reviewed source needed")}</p>
      <div className="wp-day-clock"><Icon name="pin" size={14}/>{moment.tz.split("/").pop()?.replaceAll("_"," ")}<span>·</span><time>{clock?new Intl.DateTimeFormat("en-GB",{timeZone:moment.tz,hour:"2-digit",minute:"2-digit"}).format(clock):"—"}</time><small>LOCAL NOW</small></div>
      <Link className="wp-text-link" href={href("/app/patro")}>{ne?"पूर्ण पात्रो हेर्नुहोस्":"Open your calendar"} <Icon name="arrow" size={17}/></Link>
     </div><div className="wp-orbital-art" aria-hidden="true"><div className="wp-orbit o1"/><div className="wp-orbit o2"/><div className="wp-orbit o3"/><span className="wp-orbit-om">ॐ</span><span className="wp-orbit-sun"/><span className="wp-orbit-moon"/><small>सूर्य · चन्द्र · समय</small></div></div>
    <div className="wp-day-bottom"><span><Icon name="sun" size={16}/> {p?.sunTimes.sunrise||"—"}<small>{ne?"सूर्योदय":"SUNRISE"}</small></span><span><Icon name="moon" size={16}/> {p?.sunTimes.sunset||"—"}<small>{ne?"सूर्यास्त":"SUNSET"}</small></span><Link href={href("/app/panchang")}>{ne?"पञ्चाङ्ग":"Panchang"}<Icon name="arrow" size={15}/></Link></div>
   </section>
   <section className="wp-panel wp-today-panel"><div className="wp-section-head"><div><span className="wp-overline">{ne?"आकाशको लय":"THE RHYTHM OF THE SKY"}</span><h2>{ne?"आजको पञ्चाङ्ग":"Today's Panchang"}</h2></div><span className="wp-icon-tile gold"><Icon name="sun" size={22}/></span></div>
    <div className="wp-panchang-list">{[[ne?"तिथि":"Tithi",p?.tithi.name,p?.tithi.paksha],[ne?"नक्षत्र":"Nakshatra",p?.nakshatra.name,"Lunar mansion"],[ne?"योग":"Yoga",p?.yoga.name,"Sun & Moon"]].map(([label,value,note])=><div key={label}><span>{label}</span><strong>{busy?<span className="wp-skeleton"/>:value||"Unavailable"}</strong><small>{note}</small></div>)}</div>
    <div className="wp-panel-note"><TruthChip state="astronomy"/><span>{ne?"स्थानीय मध्यान्हको गणना":"Calculated at local noon"}</span></div>
    {error&&<div className="wp-inline-error" role="alert">{error}<button onClick={()=>setReload(v=>v+1)}>Retry</button></div>}
   </section>
  </div>
  {todayFestival&&<Link href={href("/app/festivals")} className="wp-today-festival"><span className="wp-flower" aria-hidden="true">✺</span><span><small>{ne?"आजको चाडपर्व":"A DAY TO CELEBRATE"}</small><strong>{ne?todayFestival.ne:todayFestival.title}</strong></span><span className="wp-festival-source">KMC calendar · {ne?"स्रोतसहित":"source included"}</span><Icon name="arrow"/></Link>}
  <section><div className="wp-section-head"><div><span className="wp-overline">{ne?"तपाईंका लागि तयार":"A LITTLE HELP, EVERY DAY"}</span><h2>{ne?"सही साधन, एकै ठाउँमा":"The right tools, close at hand"}</h2></div><Link href={href("/app/ecosystem")} className="wp-text-link">{ne?"सबै हेर्नुहोस्":"Explore all"}<Icon name="arrow" size={16}/></Link></div><div className="wp-quick-grid">{quick.map((q,i)=><Link href={href("/app/"+q.slug)} className="wp-tool-card" key={q.slug}><span className={"wp-icon-tile tone-"+i}><Icon name={q.icon} size={25}/></span><strong>{ne?q.ne:q.title}</strong><small>{q.detail}</small><Icon name="external" size={14} className="wp-tool-arrow"/></Link>)}</div></section>
  <div className="wp-middle-grid">
   <section className="wp-panel"><div className="wp-section-head"><div><span className="wp-overline">{ne?"एक नजरमा महिना":"MAKE SPACE FOR YOUR DAYS"}</span><h2>{ne?"तपाईंको पात्रो":"Your calendar"}</h2></div><Link href={href("/app/patro")} className="wp-icon-button" aria-label="Open full calendar"><Icon name="external" size={17}/></Link></div><MonthCalendar value={moment.date} locale={moment.locale} onSelect={date=>router.replace("/app?"+momentQuery({...moment,date}),{scroll:false})}/></section>
   <section className="wp-panel wp-upcoming"><div className="wp-section-head"><div><span className="wp-overline">{ne?"संस्कृतिसँग नजिक":"ROOTED IN OUR TRADITIONS"}</span><h2>{ne?"आउँदै गरेका चाडपर्व":"Moments to look forward to"}</h2></div><Icon name="leaf" size={22}/></div>
    {upcoming.length?upcoming.map(f=>{const d=new Date(f.date+"T12:00:00Z");return <Link key={f.id} className="wp-festival-row" href={href("/app/festivals")}><span className="wp-festival-date"><strong>{d.getUTCDate()}</strong><small>{new Intl.DateTimeFormat("en-US",{month:"short",timeZone:"UTC"}).format(d)}</small></span><span><strong>{ne?f.ne:f.title}</strong><small>{Math.round((d.valueOf()-selected.valueOf())/86400000)===0?"Today":Math.round((d.valueOf()-selected.valueOf())/86400000)+" days away"} · Published date</small></span><Icon name="chevron" size={16}/></Link>;}):<div className="wp-empty">No reviewed upcoming dates in this release.</div>}
    <p className="wp-source-caption">Municipal calendar · reviewed {FESTIVAL_SOURCE.checkedOn}. <a href={FESTIVAL_SOURCE.url} target="_blank" rel="noreferrer">View source ↗</a></p><Link href={href("/app/festivals")} className="wp-text-link">Explore the festival calendar <Icon name="arrow" size={17}/></Link>
   </section>
  </div>
  <section className="wp-calendar-lenses"><div className="wp-section-head"><div><span className="wp-overline">ONE MOMENT, MANY PERSPECTIVES</span><h2>{ne?"विश्वका पात्रोहरू":"Time, around the world"}</h2></div><Link href={href("/app/patro")} className="wp-text-link">All nine calendars <Icon name="arrow" size={16}/></Link></div><div className="wp-lens-grid">{day?.calendars.filter(c=>["bs","gregorian","hijri","buddhist"].includes(c.id)).map(c=><article className="wp-lens-card" key={c.id}><div><span>{c.icon}</span><TruthChip state={calendarTruth(c)}/></div><h3>{c.name}</h3><strong>{c.value}</strong><small>{c.method}</small></article>)}{busy&&[0,1,2,3].map(i=><div className="wp-lens-card wp-loading-card" key={i}><span className="wp-skeleton"/><span className="wp-skeleton"/></div>)}</div></section>
  <section className="wp-explore-banner"><div className="wp-banner-symbol">ॐ</div><div><span className="wp-overline">WBGR-109 · WENS · 1799 BS</span><h2>{ne?"नौ परम्परा। नौ ग्रह। नयाँ दृष्टिकोण।":"Nine traditions. Nine grahas. A wider perspective."}</h2><p>Explore 729 symbolic gates, with calculated astronomy and clear boundaries.</p></div><Link href={href("/app/wens")} className="wp-button wp-button-gold">Explore WENS<Icon name="arrow" size={17}/></Link></section>
 </div>;
}
