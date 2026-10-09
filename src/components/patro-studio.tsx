"use client";

import { useEffect, useState, useTransition } from "react";
import type { CalendarResult } from "@/lib/calendars";

type Panchang = {
  method:string;
  interpretationBoundary:string;
  ayanamsa:number;
  tithi:{name:string;number:number;paksha:string};
  nakshatra:{name:string;number:number};
  yoga:{name:string;number:number};
  sunTimes:{sunrise:string|null;sunset:string|null};
  moonTimes:{moonrise:string|null;moonset:string|null};
  provenance:{type:string;library:string;ayanamsa:string};
};

type Snapshot = {
  canonical:{isoDate:string;precision:string};
  calendars:CalendarResult[];
  separationNotice:string;
};

function todayNepal() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"
  }).format(new Date());
}

function addDay(raw:string,n:number) {
  const date=new Date(raw+"T12:00:00Z");
  date.setUTCDate(date.getUTCDate()+n);
  return date.toISOString().slice(0,10);
}

export default function PatroStudio({ focus="calendars" }: { focus?:"calendars"|"panchang" }) {
  const [date,setDate]=useState(todayNepal);
  const [locale,setLocale]=useState<"en"|"ne">("en");
  const [lat,setLat]=useState("27.7172");
  const [lon,setLon]=useState("85.3240");
  const [tz,setTz]=useState("Asia/Kathmandu");
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [panchang,setPanchang]=useState<Panchang|null>(null);
  const [err,setErr]=useState("");
  const [panchangErr,setPanchangErr]=useState("");
  const [pending,transition]=useTransition();
  const [updated,setUpdated]=useState("");

  function sync(selectedDate=date, selectedLocale=locale) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      setErr("Choose a valid Gregorian date.");return;
    }
    const y=Number(lat),x=Number(lon);
    if(!Number.isFinite(y)||y < -90||y>90||!Number.isFinite(x)||x < -180||x>180) {
      setErr("Latitude must be −90…90 and longitude −180…180.");return;
    }
    try {
      new Intl.DateTimeFormat("en",{timeZone:tz});
    } catch {
      setErr("Choose a valid IANA timezone, such as Asia/Kathmandu.");return;
    }
    transition(async()=>{
      setErr("");setPanchangErr("");setUpdated("");
      const q=new URLSearchParams({date:selectedDate,locale:selectedLocale});
      const p=new URLSearchParams({date:selectedDate,lat:String(y),lon:String(x),tz});
      const [calendarRes,panchangRes]=await Promise.allSettled([
        fetch("/api/v1/patro/today?"+q,{cache:"no-store"}),
        fetch("/api/v1/panchang/day?"+p,{cache:"no-store"})
      ]);
      if(calendarRes.status==="fulfilled"&&calendarRes.value.ok) {
        setSnapshot(await calendarRes.value.json());
      } else {
        setErr("Calendar source is unavailable. Existing results, if any, are not current.");
      }
      if(panchangRes.status==="fulfilled"&&panchangRes.value.ok) {
        setPanchang(await panchangRes.value.json());
      } else {
        setPanchang(null);
        setPanchangErr("Astronomical calculation could not complete for this date/location.");
      }
      setUpdated(new Date().toISOString());
    });
  }

  useEffect(()=>{sync(todayNepal(),"en");},[]);

  async function copyResult() {
    if(!snapshot) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify({date,snapshot,panchang},null,2));
      setErr("Copied this calculation snapshot as JSON.");
    } catch {setErr("Clipboard permission unavailable.");}
  }

  return <section className="patroStudio">
    <div className="patroToolbar">
      <div className="patroToolbarTop"><div><div className="eyebrow">ONE MOMENT · NINE LENSES</div><h2>{focus==="panchang"?"Vedic Panchang":"9 Calendars · One Patro"}</h2></div><span>Asia/Kathmandu · editable</span></div>
      <div className="patroForm">
        <label>Date (Gregorian)
          <div className="patroDateNav"><button type="button" onClick={()=>{const next=addDay(date,-1);setDate(next);sync(next);}} aria-label="Previous date">←</button><input type="date" value={date} onChange={e=>setDate(e.target.value)}/><button type="button" onClick={()=>{const next=addDay(date,1);setDate(next);sync(next);}} aria-label="Next date">→</button></div>
        </label>
        <label>Latitude<input type="number" min="-90" max="90" step=".0001" value={lat} onChange={e=>setLat(e.target.value)}/></label>
        <label>Longitude<input type="number" min="-180" max="180" step=".0001" value={lon} onChange={e=>setLon(e.target.value)}/></label>
        <label>Timezone<input type="text" value={tz} onChange={e=>setTz(e.target.value)} placeholder="Asia/Kathmandu"/></label>
        <label>Language<select value={locale} onChange={e=>setLocale(e.target.value as "en"|"ne")}><option value="en">English</option><option value="ne">नेपाली</option></select></label>
        <button type="button" className="primaryBtn" disabled={pending} onClick={()=>sync()}>{pending?"Calculating…":"Calculate"}</button>
      </div>
      <div className="patroProvenanceBar">
        <span>Source context: {date} · {tz} · {lat}, {lon}</span>
        {updated && <span>Refreshed {new Date(updated).toLocaleString()}</span>}
        <button type="button" onClick={copyResult} disabled={!snapshot}>Copy data</button>
      </div>
      {err && <div className="patroError" role="status">{err}</div>}
    </div>
    {focus==="panchang" && <PanchangPanel panchang={panchang} error={panchangErr}/>}
    <div className="patroStudioGrid">
      {(snapshot?.calendars||[]).map((calendar,i)=><article className={"patroStudioCard"+(i===0?" primary":"")} key={calendar.id}>
        <div className="patroCardTop"><span>{calendar.icon}</span><small className={calendar.status==="calculated"?"calculated":"requires"}>{calendar.provenance}</small></div>
        <h3>{calendar.name}</h3>
        <div className="patroCardValue">{calendar.value}</div>
        <p>{calendar.method}</p>
        <details><summary>Method & limits</summary><p>{calendar.note}</p><span>Classification: {calendar.status}</span></details>
      </article>)}
    </div>
    {focus!=="panchang"&&<PanchangPanel panchang={panchang} error={panchangErr}/>}
    <div className="patroNotice">Calculation is not an official festival or government holiday declaration. BS, Nepal Sambat and religious observation require published, versioned authority profiles where marked. Panchang is astronomical computation using the date/coordinates shown; astrological meaning is separate interpretation.</div>
  </section>;
}

function PanchangPanel({panchang,error}:{panchang:Panchang|null;error:string}) {
  return <section className="panchangPanel">
    <div className="eyebrow">ASTRONOMICAL SACRED TIME</div><h3>Location-aware Panchang</h3>
    {error&&<p role="status" className="error">{error}</p>}
    {panchang?<><div className="panchangTiles">
      <div><span>Tithi</span><strong>{panchang.tithi?.name}</strong><small>{panchang.tithi?.paksha} · #{panchang.tithi?.number}</small></div>
      <div><span>Nakshatra</span><strong>{panchang.nakshatra?.name}</strong><small>#{panchang.nakshatra?.number}</small></div>
      <div><span>Yoga</span><strong>{panchang.yoga?.name}</strong><small>#{panchang.yoga?.number}</small></div>
      <div><span>Sunrise / sunset</span><strong>{panchang.sunTimes?.sunrise||"—"} / {panchang.sunTimes?.sunset||"—"}</strong><small>Local timezone</small></div>
      <div><span>Moonrise / moonset</span><strong>{panchang.moonTimes?.moonrise||"—"} / {panchang.moonTimes?.moonset||"—"}</strong><small>Local timezone</small></div>
      <div><span>Ayanamsa</span><strong>{panchang.ayanamsa?.toFixed(4)}°</strong><small>Lahiri approximation</small></div>
    </div><p>{panchang.method}</p><small>{panchang.interpretationBoundary}</small></>:<p className="muted">Enter a date and valid location to calculate local Panchang values.</p>}
  </section>;
}
