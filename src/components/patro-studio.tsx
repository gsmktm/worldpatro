"use client";

import Link from "next/link";
import {useEffect,useMemo,useRef,useState,type FormEvent} from "react";
import type {CalendarResult} from "@/lib/calendars";

type Inputs={date:string;locale:"en"|"ne";lat:string;lon:string;elevation:string;tz:string};
type Panchang={
  method:string;interpretationBoundary:string;ayanamsa:number;
  tithi:{name:string;number:number;paksha:string};
  nakshatra:{name:string;number:number};
  yoga:{name:string;number:number};
  sunTimes:{sunrise:string|null;sunset:string|null};
  moonTimes:{moonrise:string|null;moonset:string|null};
  sun:{siderealLongitude:number;tropicalLongitude:number};
  moon:{siderealLongitude:number;tropicalLongitude:number;phaseAngle:number};
  provenance:{library:string;type:string;ayanamsa:string};
};
type Day={
  canonical:{date:string;instantUsed:string;precision:string;timezone:string;latitude:number;longitude:number;elevationMeters:number;locale:string};
  calendars:CalendarResult[];panchang:Panchang;
  links:Record<string,string>;warning:string;generatedAt:string;
};
type Saved={id:string;title:string;createdAt?:string;created_at?:string};
const quickModules=[
  {name:"Panchang",caption:"Tithi, Nakshatra & Sun/Moon",path:"/app/panchang",icon:"☀"},
  {name:"BS Conversion",caption:"Verified AD ↔ BS dates",path:"#bs-converter",icon:"🇳🇵"},
  {name:"Muhurat Finder",caption:"Candidate windows & rules",path:"/app/muhurat",icon:"✺"},
  {name:"Kundli",caption:"Birth chart & Dasha",path:"/app/kundli",icon:"♃"},
  {name:"Festivals",caption:"Reviewed observances",path:"/app/religions",icon:"☸"},
  {name:"Source Registry",caption:"Publishers and evidence",path:"/app/sources",icon:"⌕"},
  {name:"Authorities",caption:"Reviewed calendar releases",path:"/app/authorities",icon:"§"},
  {name:"Research",caption:"Evidence workspace",path:"/app/research",icon:"▤"},
  {name:"World",caption:"Global data and country indicators",path:"/app/world",icon:"◎"},
  {name:"Learning",caption:"Reviewed articles",path:"/app/learn",icon:"◇"},
  {name:"Account",caption:"Private storage and export",path:"/app/privacy",icon:"♙"},
  {name:"Administration",caption:"Protected publishing",path:"/app/admin",icon:"⚙"}
];
const presets=[
  {name:"Kathmandu · Nepal",lat:"27.7172",lon:"85.3240",elevation:"1400",tz:"Asia/Kathmandu"},
  {name:"New Delhi · India",lat:"28.6139",lon:"77.2090",elevation:"216",tz:"Asia/Kolkata"},
  {name:"London · UK",lat:"51.5072",lon:"-0.1276",elevation:"11",tz:"Europe/London"},
  {name:"New York · USA",lat:"40.7128",lon:"-74.0060",elevation:"10",tz:"America/New_York"}
];
const isoNepal=()=>{
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(new Date());
  const vals=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return vals.year+"-"+vals.month+"-"+vals.day;
};
const todayDefaults=():Inputs=>({
  date:isoNepal(),locale:"en",lat:"27.7172",lon:"85.3240",elevation:"1400",tz:"Asia/Kathmandu"
});
function validISO(s:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const d=new Date(s+"T12:00:00Z");
  return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s
    &&Number(s.slice(0,4))>=1900&&Number(s.slice(0,4))<=2100;
}
function shifted(date:string,days:number){
  if(!validISO(date))return date;
  const d=new Date(date+"T12:00:00Z");
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}
function labelDay(date:string,locale:"en"|"ne"){
  try{
    return new Intl.DateTimeFormat(locale==="ne"?"ne-NP-u-ca-gregory":"en-US",{
      timeZone:"UTC",weekday:"long",month:"long",day:"numeric",year:"numeric"
    }).format(new Date(date+"T12:00:00Z"));
  }catch{return date;}
}
function getMonth(date:string){
  const d=new Date(date+"T12:00:00Z");
  return [d.getUTCFullYear(),d.getUTCMonth()] as const;
}
function monthDays(year:number,month:number){
  const first=new Date(Date.UTC(year,month,1,12));
  const start=-first.getUTCDay();
  return Array.from({length:42},(_,index)=>{
    const d=new Date(Date.UTC(year,month,1+start+index,12));
    return {date:d.toISOString().slice(0,10),day:d.getUTCDate(),inMonth:d.getUTCMonth()===month};
  });
}
function download(file:string,mime:string,data:string){
  const link=document.createElement("a"),url=URL.createObjectURL(new Blob([data],{type:mime}));
  link.href=url;link.download=file;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function icsEsc(s:string){return s.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");}

export default function PatroStudio({focus="calendars"}:{focus?:"calendars"|"panchang"}){
  const [form,setForm]=useState<Inputs>(todayDefaults);
  const [day,setDay]=useState<Day|null>(null);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [month,setMonth]=useState<[number,number]>(()=>getMonth(isoNepal()));
  const [bsRaw,setBsRaw]=useState("2083-06-23");
  const [bsMessage,setBsMessage]=useState("");
  const [bsBusy,setBsBusy]=useState(false);
  const [saved,setSaved]=useState<Saved[]>([]);
  const [saving,setSaving]=useState(false);
  const [historyBusy,setHistoryBusy]=useState(false);
  const request=useRef<AbortController|null>(null);

  function update(key:keyof Inputs,value:string){
    setForm(prev=>({...prev,[key]:value}));setNotice("");
    if(key==="date"&&validISO(value))setMonth(getMonth(value));
  }
  async function synchronize(next:Inputs){
    if(!validISO(next.date)){setError("Choose a real Gregorian date in years 1900–2100.");return;}
    const lat=Number(next.lat),lon=Number(next.lon),elevation=Number(next.elevation);
    if(!Number.isFinite(lat)||Math.abs(lat)>66||!Number.isFinite(lon)||Math.abs(lon)>180||
       !Number.isFinite(elevation)||elevation< -500||elevation>9000){
      setError("Use latitude −66…66, longitude −180…180 and elevation −500…9000 metres.");return;
    }
    try{new Intl.DateTimeFormat("en",{timeZone:next.tz}).format(new Date());}
    catch{setError("Enter a valid IANA timezone, such as Asia/Kathmandu.");return;}
    request.current?.abort();
    const ctrl=new AbortController();request.current=ctrl;
    setBusy(true);setError("");setNotice("");setDay(null);
    const params=new URLSearchParams({
      date:next.date,locale:next.locale,lat:String(lat),lon:String(lon),
      elevation:String(elevation),tz:next.tz
    });
    try{
      const response=await fetch("/api/v1/patro/day?"+params,{signal:ctrl.signal,cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Patro calculation is currently unavailable.");
      if(ctrl.signal.aborted)return;
      setDay(data as Day);
      setMonth(getMonth(next.date));
      window.history.replaceState(null,"",window.location.pathname+"?"+params.toString()+window.location.hash);
    }catch(e){
      if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:"Unable to calculate.");
    }finally{if(!ctrl.signal.aborted)setBusy(false);}
  }
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const def=todayDefaults();
    const initial:Inputs={
      date:params.get("date")||def.date,
      locale:params.get("locale")==="ne"?"ne":"en",
      lat:params.get("lat")||def.lat,
      lon:params.get("lon")||def.lon,
      elevation:params.get("elevation")||def.elevation,
      tz:params.get("tz")||def.tz
    };
    setForm(initial);
    void synchronize(initial);
    return ()=>{request.current?.abort();};
  },[]);

  function go(date:string){
    if(!validISO(date))return;
    const next={...form,date};setForm(next);
    void synchronize(next);
  }
  function preset(i:number){
    const chosen=presets[i],next={...form,...chosen};
    setForm(next);void synchronize(next);
  }
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();void synchronize(form);}
  const [year,monthIndex]=month;
  const days=useMemo(()=>monthDays(year,monthIndex),[year,monthIndex]);
  const params=day?new URLSearchParams({
    date:day.canonical.date,locale:day.canonical.locale,lat:String(day.canonical.latitude),
    lon:String(day.canonical.longitude),elevation:String(day.canonical.elevationMeters),tz:day.canonical.timezone
  }):null;
  const bs=day?.calendars.find(c=>c.id==="bs");
  const computed=day?.calendars.filter(c=>c.status==="calculated"||c.status==="authority-sourced").length||0;

  async function copyLink(){
    if(!day)return;
    try{await navigator.clipboard.writeText(window.location.href);setNotice("Link copied. It includes the selected coordinates and date.");}
    catch{setError("Clipboard access was denied.");}
  }
  async function copyData(){
    if(!day)return;
    try{await navigator.clipboard.writeText(JSON.stringify(day,null,2));setNotice("Complete Patro snapshot copied as JSON.");}
    catch{setError("Clipboard access was denied.");}
  }
  function jsonExport(){
    if(!day)return;
    download("worldpatro-"+day.canonical.date+".json","application/json",JSON.stringify(day,null,2));
    setNotice("JSON saved locally. No database write was performed.");
  }
  function icsExport(){
    if(!day)return;
    const date=day.canonical.date.replaceAll("-","");
    const next=shifted(day.canonical.date,1).replaceAll("-","");
    const description=icsEsc("Gregorian civil-day reference from World Patro. Astronomical Panchang values depend on location and time; no festival/holiday authority is asserted. "+day.canonical.timezone);
    const ics=[
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//World Patro//Civil Date Reference//EN","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT","UID:worldpatro-"+date+"@worldpatro.vercel.app",
      "DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z"),
      "DTSTART;VALUE=DATE:"+date,"DTEND;VALUE=DATE:"+next,
      "SUMMARY:"+icsEsc("World Patro · "+day.canonical.date),
      "DESCRIPTION:"+description,"END:VEVENT","END:VCALENDAR",""
    ].join("\r\n");
    download("worldpatro-"+day.canonical.date+".ics","text/calendar",ics);
    setNotice("Civil-day calendar file exported. This is not an official festival declaration.");
  }
  async function reverseBS(){
    setBsBusy(true);setBsMessage("");
    try{
      const res=await fetch("/api/v1/calendar/bs/convert?bs="+encodeURIComponent(bsRaw),{cache:"no-store"});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Verified conversion unavailable.");
      setBsMessage(bsRaw+" BS → "+data.result.date+" AD · municipal calendar source");
      if(validISO(data.result.date))go(data.result.date);
    }catch(e){setBsMessage(e instanceof Error?e.message:"Conversion unavailable.");}
    finally{setBsBusy(false);}
  }
  async function saveReport(){
    if(!day)return;
    setSaving(true);setError("");setNotice("");
    try{
      const res=await fetch("/api/v1/reports",{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({
          kind:"panchang",title:"World Patro · "+day.canonical.date,
          requestContext:day.canonical,
          result:{calendars:day.calendars,panchang:day.panchang,warnings:day.warning},
          calculationVersion:{engine:"patro-day-v1",astronomy:"astronomy-engine@2.1.19"}
        })
      });
      const data=await res.json().catch(()=>({}));
      if(res.status===401)throw new Error("Sign in before saving an account report.");
      if(!res.ok)throw new Error(data.error||"Account storage is not yet activated. Use Export JSON for a local copy.");
      setNotice("Private Patro report saved to your account.");
      void showReports(true);
    }catch(e){setError(e instanceof Error?e.message:"Could not save.");}
    finally{setSaving(false);}
  }
  async function showReports(silent=false){
    setHistoryBusy(true);
    try{
      const res=await fetch("/api/v1/reports?kind=panchang&view=summary",{cache:"no-store"});
      const data=await res.json().catch(()=>({}));
      if(res.status===401)throw new Error("Sign in to view saved reports.");
      if(!res.ok)throw new Error(data.error||"Account storage is unavailable.");
      setSaved(Array.isArray(data.reports)?data.reports:[]);
      if(!silent)setNotice("Loaded your private Patro report index.");
    }catch(e){if(!silent)setError(e instanceof Error?e.message:"Unable to load reports.");}
    finally{setHistoryBusy(false);}
  }

  return <section className="patroStudio" aria-label="World Patro calendar workspace">
    <header className="patroHero">
      <div><div className="eyebrow">WORLD PATRO · CANONICAL TIME ENGINE</div>
      <h1>{focus==="panchang"?"Vedic Panchang":"Nine Calendars. One Patro."}</h1>
      <p>A Nepal-origin time workspace. Select a civil date and location to resolve nine calendar profiles and one astronomical Panchang. Every result carries its method and authority boundary.</p>
      <div className="patroHeroMeta"><span>9 calendar lenses</span><span>Location-aware astronomy</span><span>Explicit source limits</span></div>
      </div>
      <div className="patroHeroSeal" aria-hidden="true"><b>ॐ</b><span>सूर्य • चन्द्र</span><small>NEPAL → WORLD</small></div>
    </header>

    <div className="patroSectionNav" aria-label="Patro page sections">
      <a href="#patro-calendars">Calendars</a>
      <a href="#patro-panchang">Panchang</a>
      <a href="#patro-month">Month</a>
      <a href="#bs-converter">BS converter</a>
      <a href="#patro-modules">All modules</a>
    </div>

    <form className="patroControl" onSubmit={submit}>
      <div className="patroControlHead"><div><span className="eyebrow">SELECTED DATE & LOCATION</span>
        <h2>{validISO(form.date)?labelDay(form.date,form.locale):"Choose a date"}</h2></div>
        <button className="patroTextButton" type="button" onClick={()=>go(isoNepal())}>Today in Nepal ↗</button></div>
      <div className="patroControlGrid">
        <label>Gregorian date<div className="patroDateInput">
          <button type="button" title="Previous day" aria-label="Previous day" onClick={()=>go(shifted(form.date,-1))}>←</button>
          <input type="date" min="1900-01-01" max="2100-12-31" required value={form.date} onChange={e=>update("date",e.target.value)}/>
          <button type="button" title="Next day" aria-label="Next day" onClick={()=>go(shifted(form.date,1))}>→</button>
        </div></label>
        <label>Location preset<select value="" onChange={e=>{if(e.target.value!=="")preset(Number(e.target.value));}}>
          <option value="">Custom / choose city</option>{presets.map((x,i)=><option key={x.name} value={i}>{x.name}</option>)}
        </select></label>
        <label>Timezone (IANA)<input required value={form.tz} onChange={e=>update("tz",e.target.value)} list="patro-timezones" placeholder="Asia/Kathmandu"/>
          <datalist id="patro-timezones"><option value="Asia/Kathmandu"/><option value="Asia/Kolkata"/><option value="Asia/Shanghai"/><option value="Europe/London"/><option value="America/New_York"/><option value="UTC"/></datalist>
        </label>
        <label>Latitude<input type="number" required min="-66" max="66" step=".0001" value={form.lat} onChange={e=>update("lat",e.target.value)}/></label>
        <label>Longitude<input type="number" required min="-180" max="180" step=".0001" value={form.lon} onChange={e=>update("lon",e.target.value)}/></label>
        <label>Elevation (m)<input type="number" required min="-500" max="9000" step="1" value={form.elevation} onChange={e=>update("elevation",e.target.value)}/></label>
        <label>Display language<select value={form.locale} onChange={e=>update("locale",e.target.value)}><option value="en">English</option><option value="ne">नेपाली</option></select></label>
        <button type="submit" className="primaryBtn patroCalculate" disabled={busy}>{busy?"Calculating…":"Calculate Patro →"}</button>
      </div>
      <div className="patroCommandStrip">
        <div>{busy?<span role="status">Calculating local civil date…</span>:day?<span><b>{computed}/9</b> calendars with computed or municipality-sourced dates · {day.canonical.timezone}</span>:<span>Select inputs to calculate.</span>}</div>
        <div className="patroCommandButtons">
          <button type="button" disabled={!day} onClick={copyLink}>Copy link</button>
          <button type="button" disabled={!day} onClick={copyData}>Copy JSON</button>
          <button type="button" disabled={!day} onClick={jsonExport}>Export JSON</button>
          <button type="button" disabled={!day} onClick={icsExport}>Export .ics</button>
          <button type="button" disabled={!day} onClick={()=>window.print()}>Print</button>
        </div>
      </div>
      {error&&<p className="patroError" role="alert">{error}</p>}
      {notice&&<p className="patroNoticeInline" role="status">{notice}</p>}
    </form>

    <section id="patro-calendars" className="patroResultsSection">
      <div className="patroSectionTitle"><div><div className="eyebrow">THE NINE TIME LENSES</div><h2>Civil & cultural calendars</h2></div>
        <span>{day?.canonical.date||"—"} · six Intl-calculated / limited authority coverage</span></div>
      {busy&&<p role="status" className="patroLoading">Synchronizing the nine calendar profiles and astronomical context…</p>}
      <div className="patroStudioGrid">
        {(day?.calendars||[]).map((cal,i)=><article key={cal.id} className={"patroStudioCard"+(i===0?" primary":"")}>
          <div className="patroCardTop"><span className="patroCalendarIcon">{cal.icon}</span>
            <span className={"patroStatus "+((cal.status==="calculated"||cal.status==="authority-sourced")?"ok":"pending")}>{cal.status.replaceAll("-"," ")}</span>
          </div>
          <h3>{cal.name}</h3><div className="patroCardValue">{cal.value}</div>
          <p>{cal.method}</p>
          {cal.sourceUrl&&<a className="patroAuthorityLink" href={cal.sourceUrl} target="_blank" rel="noopener noreferrer">Municipal source ↗</a>}
          {cal.coverage&&<small className="patroCoverage">{cal.coverage} · checked {cal.checkedOn}</small>}
          <div className="patroCardBottom">
            {cal.id==="vedic"?<Link href={"/app/panchang"+(params?"?"+params:"")}>Open Panchang →</Link>
             :cal.id==="bs"?<a href="#bs-converter">Convert AD / BS →</a>
             :<Link href={cal.id==="nepal-sambat"?"/app/authorities":"/app/religions"}>Explore sources →</Link>}
            <details><summary>Method / limits</summary><p>{cal.note}</p><small>{cal.provenance}</small></details>
          </div>
        </article>)}
      </div>
      {!day&&!busy&&!error&&<div className="patroEmpty">Your nine-calendar snapshot will appear here.</div>}
    </section>

    <section id="patro-panchang" className="patroPanchang">
      <div className="patroSectionTitle"><div><div className="eyebrow">ASTRONOMICAL PANCHANG</div><h2>Sun · Moon · Sacred Time</h2></div>
        <Link href={"/app/panchang"+(params?"?"+params:"")}>Panchang studio →</Link></div>
      {day?<div className="patroPanchangGrid">
        <div><span>Tithi / Paksha</span><strong>{day.panchang.tithi.name}</strong><small>{day.panchang.tithi.paksha} · #{day.panchang.tithi.number}</small></div>
        <div><span>Nakshatra</span><strong>{day.panchang.nakshatra.name}</strong><small>#{day.panchang.nakshatra.number}</small></div>
        <div><span>Yoga</span><strong>{day.panchang.yoga.name}</strong><small>#{day.panchang.yoga.number}</small></div>
        <div><span>Sunrise / sunset</span><strong>{day.panchang.sunTimes.sunrise||"—"} / {day.panchang.sunTimes.sunset||"—"}</strong><small>{day.canonical.timezone} · local date</small></div>
        <div><span>Moonrise / moonset</span><strong>{day.panchang.moonTimes.moonrise||"—"} / {day.panchang.moonTimes.moonset||"—"}</strong><small>May have no event on some days</small></div>
        <div><span>Lahiri approximation</span><strong>{day.panchang.ayanamsa.toFixed(4)}°</strong><small>Sidereal reference offset</small></div>
      </div>:<p className="patroEmpty">Calculate a date and location for the astronomical values.</p>}
      {day&&<details className="patroTechnical"><summary>Degrees, reference instant and calculation details</summary>
        <p>Local noon reference: {day.canonical.instantUsed}. Tithi, Nakshatra and Yoga are instantaneous values; their transitions may occur during the day.</p>
        <p>Sun longitude: {day.panchang.sun.siderealLongitude.toFixed(4)}° sidereal · {day.panchang.sun.tropicalLongitude.toFixed(4)}° tropical. Moon longitude: {day.panchang.moon.siderealLongitude.toFixed(4)}° sidereal · phase angle {day.panchang.moon.phaseAngle.toFixed(2)}°.</p>
        <p>{day.panchang.method}. {day.panchang.interpretationBoundary}</p>
        <a href={"/api/v1/patro/day?"+params} target="_blank" rel="noopener noreferrer">Open full verified JSON response ↗</a>
      </details>}
    </section>

    <div className="patroSecondaryGrid">
      <section id="patro-month" className="patroMonth">
        <div className="patroSectionTitle"><div><div className="eyebrow">GREGORIAN MONTH</div><h2>Date navigator</h2></div>
          <div className="patroMonthArrows"><button type="button" onClick={()=>setMonth(([y,m])=>{const d=new Date(Date.UTC(y,m-1,1));return [d.getUTCFullYear(),d.getUTCMonth()]})} aria-label="Previous month">←</button>
            <button type="button" onClick={()=>setMonth(([y,m])=>{const d=new Date(Date.UTC(y,m+1,1));return [d.getUTCFullYear(),d.getUTCMonth()]})} aria-label="Next month">→</button></div>
        </div>
        <h3>{new Intl.DateTimeFormat(form.locale==="ne"?"ne-NP-u-ca-gregory":"en-US",{timeZone:"UTC",year:"numeric",month:"long"}).format(new Date(Date.UTC(year,monthIndex,1)))}</h3>
        <div className="patroMonthGrid">{["S","M","T","W","T","F","S"].map((d,i)=><span key={i} className="patroMonthDow">{d}</span>)}
          {days.map(d=><button type="button" key={d.date} className={(d.date===form.date?"chosen ":"")+(d.inMonth?"":"dim")} aria-pressed={d.date===form.date} title={d.date} onClick={()=>go(d.date)}>{d.day}</button>)}
        </div>
        <p className="patroCaption">Choose any day to recalculate the same location-aware time snapshot.</p>
      </section>
      <section id="bs-converter" className="patroConverter">
        <div className="eyebrow">NEPAL · BIKRAM SAMBAT</div><h2>Verified AD ↔ BS</h2>
        <p>Conversion is available only for municipality-reviewed Bhadra and Asoj 2083. Other dates are deliberately not inferred.</p>
        <div className="patroBsCurrent"><span>Selected AD date</span><strong>{day?.canonical.date||"—"}</strong>
          <span>Published BS result</span><strong>{bs?.status==="authority-sourced"?bs.value:"Official source required"}</strong></div>
        <form onSubmit={e=>{e.preventDefault();void reverseBS();}}>
          <label htmlFor="patro-bs-date">BS date (YYYY-MM-DD)</label>
          <div><input id="patro-bs-date" pattern="\d{4}-\d{2}-\d{2}" value={bsRaw} onChange={e=>setBsRaw(e.target.value)} placeholder="2083-06-23" required/>
          <button type="submit" className="primaryBtn" disabled={bsBusy}>{bsBusy?"Checking…":"Convert →"}</button></div>
        </form>
        {bsMessage&&<p role="status" className="patroBsMessage">{bsMessage}</p>}
        <Link href="/app/authorities">Source & authority notices →</Link>
      </section>
    </div>

    <section id="patro-modules" className="patroModules">
      <div className="patroSectionTitle"><div><div className="eyebrow">ONE PATRO → COMPLETE PLATFORM</div><h2>Connected functions & modules</h2></div>
        <Link href="/app">Command Center ↗</Link></div>
      <div className="patroModuleGrid">{quickModules.map(item=><Link href={item.path} key={item.name}>
        <span className="patroModuleIcon">{item.icon}</span><span><strong>{item.name}</strong><small>{item.caption}</small></span><b aria-hidden="true">↗</b>
      </Link>)}</div>
    </section>

    <section className="patroAccount">
      <div><div className="eyebrow">PRIVATE ACCOUNT REPORTS</div><h2>Save or access your Panchang</h2>
        <p>Local calculations require no login. Saving to your account requires authenticated Firebase or Supabase storage, which may still need activation.</p>
        <div className="patroAccountButtons">
          <button type="button" className="primaryBtn" onClick={saveReport} disabled={!day||saving}>{saving?"Saving…":"Save private report"}</button>
          <button type="button" className="ghost" onClick={()=>showReports()} disabled={historyBusy}>{historyBusy?"Loading…":"My saved reports"}</button>
          <Link href="/login" className="ghost">Sign in</Link>
          <Link href="/app/privacy" className="ghost">Privacy & export</Link>
        </div>
        {saved.length>0&&<div className="patroSaved">{saved.map(x=><div key={x.id}><strong>{x.title}</strong><small>{x.createdAt||x.created_at||"Saved"}</small></div>)}</div>}
      </div>
      <div className="patroAccountEmblem" aria-hidden="true">ॐ</div>
    </section>
    <footer className="patroFooter">
      <p>{day?.warning||"Astronomical and civil calendars use different validation and authority sources."} Nepal Sambat and unverified BS dates remain source-required. This service does not issue legal, religious or national holiday declarations.</p>
      <div>{day&&<a href={"/api/v1/panchang/day?"+params} target="_blank" rel="noopener noreferrer">Panchang API ↗</a>}
        <a href={"/api/v1/calendar/public-holidays?country=NP&year="+(validISO(form.date)?form.date.slice(0,4):"2026")} target="_blank" rel="noopener noreferrer">Nepal holiday authority status ↗</a></div>
    </footer>
  </section>;
}
