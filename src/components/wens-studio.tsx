"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GATES, GRAHAS, POWERS, TRADITIONS } from "@/lib/wbe";
import { WBGR109, WENS_DISCLOSURE, WENS_LAYERS, WENS_ORIGIN } from "@/lib/wens";

type Calendar = {id:string;name:string;value:string;status:string;provenance:string};
type Graha = {key:string;name:string;siderealLongitude:number;sign:string;degreesInSign:number;nakshatra:string;retrograde:boolean;isMeanLunarNode:boolean;domain:string};
type Snapshot = {
  instant:{date:string;instantUsed:string;timezone:string};
  origin:typeof WENS_ORIGIN;
  calendarProfiles:Calendar[];
  panchang:{tithi:{name:string;paksha:string};nakshatra:{name:string};yoga:{name:string};sunTimes:{sunrise:string|null;sunset:string|null}};
  navagraha:Graha[];
  gates:{all:number;registry:number;keynotes:number;gateOfDate:{code:string;power:string}};
  updatedAt:string;
};

const SIGNS = ["☉","☽","♂","☿","♃","♀","♄","☊","☋"];
const formatDeg=(n:number)=>n.toFixed(2)+"°";
const registryCodes=new Set(WBGR109.map(item=>item.code));

function nepalDate(){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const byType=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return byType.year+"-"+byType.month+"-"+byType.day;
}
function revealJson(value:unknown){
  const blob=new Blob([JSON.stringify(value,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download="worldpatro-wens-snapshot.json";
  link.click();
  URL.revokeObjectURL(url);
}

export default function WensStudio(){
  const [date,setDate]=useState("");
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [selectedTradition,setSelectedTradition]=useState(0);
  const [selectedGraha,setSelectedGraha]=useState(0);
  const [selectedPower,setSelectedPower]=useState(0);
  const [registryView,setRegistryView]=useState<"curated"|"all">("curated");
  const [registryQuery,setRegistryQuery]=useState("");
  const [registryPage,setRegistryPage]=useState(1);
  const [expandedTruth,setExpandedTruth]=useState(false);

  const load=useCallback(async(selected:string)=>{
    if(!selected)return;
    setLoading(true);
    setError("");
    try{
      const response=await fetch("/api/v1/wens/snapshot?date="+encodeURIComponent(selected),{cache:"no-store"});
      const body=await response.json();
      if(!response.ok)throw new Error(body.error||"Cannot calculate this date.");
      setSnapshot(body as Snapshot);
    }catch(e){setError(e instanceof Error?e.message:"WENS is unavailable.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    const today=nepalDate();
    setDate(today);
    void load(today);
  },[load]);

  const gate=GATES[selectedTradition*81+selectedGraha*9+selectedPower];
  const position=snapshot?.navagraha[selectedGraha];
  const registry=useMemo(()=>{
    const base=registryView==="curated"?WBGR109:GATES;
    const search=registryQuery.trim().toLowerCase();
    return search?base.filter(g=>[g.code,g.tradition,g.graha,g.power,g.domain].some(s=>s.toLowerCase().includes(search))):base;
  },[registryView,registryQuery]);
  const totalPages=Math.max(1,Math.ceil(registry.length/9));
  const page=Math.min(registryPage,totalPages);
  const registryItems=registry.slice((page-1)*9,page*9);

  return <div className="wens">
    <section className="wensHero">
      <div className="wensStars" aria-hidden="true"/>
      <div className="wensHeroText">
        <div className="eyebrow">WORLD PATRO · WENS / WBGR-109 · NEPAL → WORLD</div>
        <h1>One world. <em>Many ways of knowing.</em></h1>
        <p>World Equilibrium & Navagraha System — a Nepal-origin interface uniting real calendar time, computed graha positions, nine distinct traditions and a deliberately symbolic balance registry.</p>
        <div className="wensHeroActions">
          <a className="primary" href="#wens-cockpit">Explore the living system ↓</a>
          <Link className="ghost" href="/app/patro">Open 9 calendars ↗</Link>
        </div>
        <div className="wensHeroChips"><span>9 faith traditions</span><span>9 Navagraha</span><span>9 themes</span><span>729 gates</span><span>109 registry paths</span></div>
      </div>
      <div className="wensMandala" aria-label="A ninefold symbolic circle with G at its center">
        <div className="wensMandalaRing"><span>ॐ</span><span>☉</span><span>☽</span><span>✦</span><span>☿</span><span>♃</span><span>♄</span><span>☊</span><span>☋</span></div>
        <div className="wensMandalaCore"><small>HERITAGE AXIS</small><strong>G</strong><span>WENS 0°</span></div>
      </div>
    </section>

    <div className="wensFactBar">
      <div><span>REFERENCE ORIGIN</span><strong>हनुमानढोका दरबार</strong><small>Kathmandu · UNESCO heritage coordinates</small></div>
      <div><span>SYMBOLIC AXIS</span><strong>0°</strong><small>Not geographic zero longitude</small></div>
      <div><span>ACTUAL LOCATION</span><strong>27.703889° N</strong><small>85.308333° E · Asia/Kathmandu</small></div>
      <div><span>DATA BOUNDARY</span><strong>FACT ≠ SYMBOL</strong><small>Independent traditions, explicit methods</small></div>
    </div>

    <section className="wensWorkspace" id="wens-cockpit">
      <div className="wensHeaderRow"><div><div className="eyebrow">01 · TIME & NAVAGRAHA</div><h2>Live calculation desk</h2><p>Choose a Gregorian date. Graha positions and the nine calendar profiles are calculated for 12:00 civil time at the Hanuman Dhoka reference.</p></div>
        <div className="wensDateControl">
          <label htmlFor="wens-date">Canonical date · Kathmandu</label>
          <input id="wens-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>setDate(e.target.value)}/>
          <button type="button" disabled={loading||!date} onClick={()=>void load(date)}>{loading?"Calculating…":"Synchronize ↗"}</button>
        </div>
      </div>
      {error&&<p role="alert" className="wensError">{error}</p>}
      {!snapshot&&loading&&<p className="wensLoading" role="status">Resolving nine calendars and sidereal grahas…</p>}
      <div className="wensPanels">
        <article className="wensPanel wensSky">
          <div className="wensPanelTop"><span>SIDEREAL POSITIONS</span><small>{snapshot?.instant.date??"Select a date"} · LAHIRI APPROX.</small></div>
          <div className="wensGrahaGrid">{GRAHAS.map(([name],i)=>{
            const p=snapshot?.navagraha[i];
            return <button type="button" aria-pressed={selectedGraha===i} className={"wensGrahaTile"+(selectedGraha===i?" active":"")} key={name} onClick={()=>setSelectedGraha(i)}>
              <span>{SIGNS[i]}</span><strong>{name.split(" · ")[0]}</strong><small>{p?formatDeg(p.siderealLongitude):"—"}</small>
            </button>;
          })}</div>
          <div className="wensSelectedPosition">
            <div className="wensSelectedSign">{SIGNS[selectedGraha]}</div>
            <div><span>SELECTED GRAHA</span><strong>{GRAHAS[selectedGraha][0]}</strong><p>{position?position.sign+" · "+formatDeg(position.degreesInSign)+" in sign · "+position.nakshatra:"Awaiting astronomical calculation"}</p>
              <small>{position?.isMeanLunarNode?"Mean lunar node · not a physical planet":position?.retrograde?"Apparent retrograde at sampled instant":"Approximate sidereal ecliptic longitude"}</small>
            </div>
          </div>
          <p className="wensFine">Astronomical calculation, not causal evidence about a person, country or belief system. Positions are sampled at local noon, not at sunrise.</p>
        </article>

        <article className="wensPanel wensCalendars">
          <div className="wensPanelTop"><span>NINE CALENDAR LENSES</span><Link href="/app/patro">Full Patro ↗</Link></div>
          <div className="wensCalendarList">{(snapshot?.calendarProfiles??[]).map((entry,i)=><div key={entry.id}>
            <span>{String(i+1).padStart(2,"0")}</span><div><strong>{entry.name}</strong><small>{entry.value}</small></div><i title={entry.provenance}>{entry.status==="calculated"?"CALCULATED":"REVIEW"}</i>
          </div>)}</div>
          {!snapshot&&<p className="wensFine">Calendars will appear after the first synchronization.</p>}
          {snapshot&&<div className="wensPanchang"><div><small>TITHI</small><strong>{snapshot.panchang.tithi.paksha} · {snapshot.panchang.tithi.name}</strong></div><div><small>NAKSHATRA</small><strong>{snapshot.panchang.nakshatra.name}</strong></div><div><small>SUNRISE</small><strong>{snapshot.panchang.sunTimes.sunrise??"Unavailable"}</strong></div></div>}
        </article>
      </div>
    </section>

    <section className="wensWorkspace">
      <div className="wensHeaderRow"><div><div className="eyebrow">02 · COMPARATIVE BALANCE ENGINE</div><h2>9 × 9 × 9 · one selected gate</h2><p>Choose each dimension independently. These are editorial reflection lenses; no planet owns a religion, and no tradition is ranked.</p></div><span className="wensCount">729 <small>combinations</small></span></div>
      <div className="wensDimensions">
        <div className="wensDimension"><h3><span>01</span> Traditions</h3><div role="group" aria-label="Choose a religious tradition">{TRADITIONS.map((value,i)=><button type="button" aria-pressed={selectedTradition===i} key={value} onClick={()=>setSelectedTradition(i)}><b>{String(i+1).padStart(2,"0")}</b>{value}</button>)}</div></div>
        <div className="wensDimension"><h3><span>02</span> Navagraha</h3><div role="group" aria-label="Choose a graha">{GRAHAS.map(([value],i)=><button type="button" aria-pressed={selectedGraha===i} key={value} onClick={()=>setSelectedGraha(i)}><b>{SIGNS[i]}</b>{value}</button>)}</div></div>
        <div className="wensDimension"><h3><span>03</span> Power themes</h3><div role="group" aria-label="Choose a human-value theme">{POWERS.map((value,i)=><button type="button" aria-pressed={selectedPower===i} key={value} onClick={()=>setSelectedPower(i)}><b>{String(i+1).padStart(2,"0")}</b>{value}</button>)}</div></div>
      </div>
      <div className="wensGateReveal">
        <div><span>COMPARATIVE GATE · {registryCodes.has(gate.code)?"WBGR-109 CURATED":"FULL CUBE"}</span><h3>{gate.code}</h3><p>{gate.tradition} <span>×</span> {gate.graha} <span>×</span> {gate.power}</p><small>Domain: {gate.domain}. This pairing is a symbolic question, not a religious ruling or causal astronomical result.</small></div>
        <button type="button" className="ghost" onClick={()=>void navigator.clipboard?.writeText(JSON.stringify({...gate,origin:WENS_ORIGIN.id,boundary:WENS_DISCLOSURE.symbolic},null,2))}>Copy gate JSON</button>
      </div>
    </section>

    <section className="wensWorkspace">
      <div className="wensHeaderRow"><div><div className="eyebrow">03 · WBGR-109 GATE REGISTRY</div><h2>109 curated paths. 729 possible combinations.</h2><p>The registry starts with nine keynote gates and 100 deterministic cross-cube gates. The full searchable cube remains accessible.</p></div><Link className="ghost" href="/app/gates">Open full explorer ↗</Link></div>
      <div className="wensRegistryToolbar">
        <label>Registry <select value={registryView} onChange={e=>{setRegistryView(e.target.value as "curated"|"all");setRegistryPage(1)}}><option value="curated">WBGR-109 · curated</option><option value="all">729 · all gates</option></select></label>
        <label>Search <input type="search" placeholder="Code, planet, tradition, theme…" value={registryQuery} onChange={e=>{setRegistryQuery(e.target.value);setRegistryPage(1)}}/></label>
        <span>{registry.length} matches</span>
      </div>
      <div className="wensRegistryGrid">{registryItems.map(item=><button type="button" key={item.code} onClick={()=>{
        const parts=item.code.split("-").slice(1).map(Number);
        setSelectedTradition(parts[0]-1);setSelectedGraha(parts[1]-1);setSelectedPower(parts[2]-1);
        document.getElementById("wens-cockpit")?.scrollIntoView({behavior:"smooth"});
      }}><strong>{item.code}</strong><span>{item.power}</span><small>{item.tradition} · {item.graha}</small></button>)}</div>
      {registry.length===0&&<p className="wensFine">No matching gates. Edit the search above.</p>}
      <div className="wensRegistryPages"><button disabled={page===1} onClick={()=>setRegistryPage(page-1)}>← Previous</button><span>{page} / {totalPages}</span><button disabled={page>=totalPages} onClick={()=>setRegistryPage(page+1)}>Next →</button></div>
    </section>

    <section className="wensWorkspace wensMethod">
      <div><div className="eyebrow">04 · METHOD, TRANSPARENCY & CONTROL</div><h2>Powerful design. Strict boundaries.</h2><p>The human G center expresses the project's identity. It does not imply control over global governance, other faiths or physical forces.</p>
        <button type="button" className="ghost" aria-expanded={expandedTruth} onClick={()=>setExpandedTruth(v=>!v)}>{expandedTruth?"Hide methodology ↑":"Read full methodology ↓"}</button></div>
      <div className="wensLayerGrid">{WENS_LAYERS.map(l=><article key={l.id}><span>{l.category}</span><h3>{l.title}</h3><p>{l.summary}</p></article>)}</div>
      {expandedTruth&&<div className="wensTruthList">{Object.entries(WENS_DISCLOSURE).map(([name,description])=><p key={name}><strong>{name.toUpperCase()}</strong> {description}</p>)}<p><a href={WENS_ORIGIN.geographicReference} target="_blank" rel="noopener noreferrer">UNESCO geographic source ↗</a></p></div>}
      <div className="wensFooterActions"><button type="button" className="primaryBtn" disabled={!snapshot} onClick={()=>snapshot&&revealJson({...snapshot,selectedGate:gate})}>Export calculated snapshot JSON ↓</button><Link className="ghost" href="/app/religions">Verified religious observances ↗</Link><Link className="ghost" href="/app/wbe">WBE-9 reflection ↗</Link><Link className="ghost" href="/app/sources">Source registry ↗</Link></div>
      {snapshot&&<p className="wensFine">Data resolved for {snapshot.instant.date} at {snapshot.instant.timezone}. WBGR daily editorial gate: {snapshot.gates.gateOfDate.code}. Last calculated: {new Date(snapshot.updatedAt).toLocaleString()}.</p>}
    </section>
  </div>;
}
