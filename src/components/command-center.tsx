"use client";

import { useEffect, useState, useTransition } from "react";
import type { CalendarResult } from "@/lib/calendars";

type Snapshot={canonical:{isoDate:string;generatedAt:string};calendars:CalendarResult[]};
type Health={database?:{provider:string;firebaseClientConfigured:boolean;firebaseAdminConfigured:boolean}};

export default function CommandCenter(){
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [country,setCountry]=useState<any>(null);
  const [health,setHealth]=useState<Health|null>(null);
  const [error,setError]=useState("");
  const [pending,startTransition]=useTransition();

  const refresh=(selected=date)=>startTransition(async()=>{
    setError("");
    try{
      const [p,c,h]=await Promise.all([
        fetch(`/api/v1/patro/today?date=${selected}`,{cache:"no-store"}),
        fetch("/api/v1/world/country?iso3=NPL",{cache:"no-store"}),
        fetch("/api/v1/health",{cache:"no-store"})
      ]);
      if(!p.ok)throw new Error("Patro snapshot failed.");
      setSnapshot(await p.json());
      if(c.ok)setCountry(await c.json());
      if(h.ok)setHealth(await h.json());
    }catch(e){setError(e instanceof Error?e.message:"Request failed");}
  });

  useEffect(()=>{refresh(date);},[]);

  const db=health?.database;
  const dbLabel=db?.provider==="firebase"
    ? (db.firebaseAdminConfigured?"Firebase · live":"Firebase · web config only")
    : db?.provider==="supabase"?"Supabase · legacy":"Database · credentials pending";

  return <div>
    <section className="commandHero">
      <div>
        <div className="eyebrow">ONE-CLICK WORLD COMMAND CENTER</div>
        <h1>Time connects the whole system.</h1>
        <p>Choose one canonical day, then move through nine calendars, Panchang, world data, sources, WBE symbolism, research, alerts and authorized workflows.</p>
      </div>
      <div className="commandInput">
        <label>Date</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <button onClick={()=>refresh()} disabled={pending}>{pending?"Synchronizing…":"Synchronize World Patro"}</button>
        {error?<small className="error">{error}</small>:<small>Default location profile: Kathmandu · Asia/Kathmandu</small>}
      </div>
    </section>

    <section className="metricRow">
      <Metric label="Calendar systems" value="9" meta="one canonical context"/>
      <Metric label="WBE gates" value="729" meta="9 anchor gates"/>
      <Metric label="Trust layers" value="4" meta="fact · authority · astronomy · interpretation"/>
      <Metric label="Database" value={dbLabel} meta="Firebase-first · secured rules"/>
    </section>

    <div className="sectionTitle"><div><div className="eyebrow">ONE PATRO</div><h2>9 synchronized calendar profiles</h2></div><span className="muted">{snapshot?.canonical?.isoDate??"loading…"}</span></div>
    <section className="calendarGrid">
      {(snapshot?.calendars??[]).map((c,i)=><article key={c.id} className={`calendarCard ${i===0?"featured":""}`}>
        <div className="cardHeader"><span className="calIcon">{c.icon}</span><span className={`provenance ${c.status==="calculated"?"ok":"warn"}`}>{c.provenance}</span></div>
        <h3>{c.name}</h3><div className="calDate">{c.value}</div>
        <p>{c.note}</p><small>{c.method}</small>
      </article>)}
    </section>

    <div className="sectionTitle"><div><div className="eyebrow">PUBLIC FACTS</div><h2>Nepal live indicator snapshot</h2></div><span className="provenance ok">WORLD BANK</span></div>
    <section className="dataPanel">
      {country?.indicators?.map((x:any)=><div className="indicator" key={x.id}><span>{x.name}</span><strong>{x.value===null?"Unavailable":Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:2}).format(x.value)}</strong><small>{x.year??"—"} · {x.source}</small></div>)}
      {!country&&<div className="muted">Loading public-source indicators…</div>}
    </section>

    <section className="truthBoundary">
      <strong>Truth boundary</strong>
      <p>Factual data must carry a source and retrieval time. Authority releases override algorithmic guesses. Firebase stores user state under owner-scoped rules; trusted server writes use the Admin SDK. WBE-9 and astrology remain explicitly labeled interpretive/symbolic layers.</p>
    </section>
  </div>;
}

function Metric({label,value,meta}:{label:string;value:string;meta:string}){return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>;}
