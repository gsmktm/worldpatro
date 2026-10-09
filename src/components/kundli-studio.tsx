"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { BirthChart } from "@/lib/jyotish/birth-chart";

const RASHI=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const OPTIONS=[
  ["Asia/Kathmandu","Nepal · Kathmandu"],
  ["Asia/Kolkata","India · Kolkata"],
  ["Asia/Shanghai","China · Shanghai"],
  ["Europe/London","UK · London"],
  ["America/New_York","USA · New York"],
  ["UTC","UTC"]
];
const LOCAL_DATE=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export default function KundliStudio() {
  const [birth,setBirth]=useState({
    name:"",date:"2000-01-01",time:"12:00",timezone:"Asia/Kathmandu",latitude:"27.7172",longitude:"85.3240",
    elevation:"1300",houseSystem:"whole_sign"
  });
  const [chart,setChart]=useState<BirthChart|null>(null);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,startTransition]=useTransition();
  const [activeDasha,setActiveDasha]=useState<"mahadasha"|"antardasha">("mahadasha");
  const [selectedVarga,setSelectedVarga]=useState("D1");
  const [history,setHistory]=useState<Array<{id:string;title:string;createdAt:string|null}>>([]);
  const [historyBusy,setHistoryBusy]=useState(false);
  const [deletingId,setDeletingId]=useState<string|null>(null);

  function change(key:keyof typeof birth,value:string) {
    setBirth(prev=>({...prev,[key]:value}));
    setNotice("");
  }
  function calculate(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async()=>{
      setError("");setNotice("");setChart(null);
      try {
        const request = {
          name:birth.name||undefined,
          date:birth.date,time:birth.time,timezone:birth.timezone,
          latitude:Number(birth.latitude),longitude:Number(birth.longitude),
          elevation:Number(birth.elevation),houseSystem:birth.houseSystem
        };
        const response=await fetch("/api/v1/jyotish/kundli",{
          method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request)
        });
        const payload=await response.json();
        if(!response.ok)throw new Error(payload.error||"Calculation failed.");
        setChart(payload.chart as BirthChart);
        setSelectedVarga("D1");
      } catch(e) {
        setError(e instanceof Error?e.message:"Chart calculation unavailable.");
      }
    });
  }
  async function save() {
    if(!chart)return;
    setNotice("");setError("");
    try {
      const response=await fetch("/api/v1/reports",{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({
          kind:"kundli",title:chart.input.name?chart.input.name+" · Kundli":"Kundli "+chart.input.date,
          requestContext:chart.input,result:chart,
          calculationVersion:chart.calculation
        })
      });
      if(response.status===401)throw new Error("Sign in to save a private birth chart.");
      if(!response.ok)throw new Error("Authenticated report storage is unavailable.");
      setNotice("Saved privately to your account.");
      await loadHistory(true);
    } catch(e) {
      setError(e instanceof Error?e.message:"Unable to save.");
    }
  }

  async function loadHistory(silent=false) {
    setHistoryBusy(true);
    try {
      const response=await fetch("/api/v1/reports?kind=kundli&view=summary",{cache:"no-store"});
      if(response.status===401)throw new Error("Sign in to see saved charts.");
      if(!response.ok)throw new Error("Report storage is not configured or temporarily unavailable.");
      const data=await response.json();
      const rows=Array.isArray(data.reports)?data.reports:[];
      setHistory(rows.map((r:{id:string;title:string;createdAt?:string;created_at?:string})=>({
        id:r.id,title:r.title,createdAt:r.createdAt??r.created_at??null
      })));
      if(!silent)setNotice(rows.length+" private charts loaded.");
    }catch(err){
      if(!silent)setError(err instanceof Error?err.message:"Saved charts could not be loaded.");
    }finally{setHistoryBusy(false);}
  }
  async function deleteReport(id:string) {
    if(!window.confirm("Permanently delete this saved birth chart from your account?"))return;
    setDeletingId(id);setError("");setNotice("");
    try {
      const response=await fetch("/api/v1/reports/"+encodeURIComponent(id),{
        method:"DELETE",headers:{"accept":"application/json"}
      });
      const body=await response.json();
      if(!response.ok||!body.deleted)throw new Error(body.error||"Deletion failed.");
      setHistory(prev=>prev.filter(r=>r.id!==id));
      setNotice("Saved report deleted from your account.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to delete report.");}
    finally{setDeletingId(null);}
  }

  function exportJson() {
    if(!chart)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(chart,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="worldpatro-kundli-"+chart.input.date+".json";a.click();
    URL.revokeObjectURL(url);setNotice("Chart downloaded locally; no server storage performed.");
  }
  const selected=chart?.divisional.find(v=>v.id===selectedVarga);
  const dashas=chart?.dasha.periods||[];
  const dashaRows=activeDasha==="mahadasha"?dashas:dashas.flatMap(p=>p.children||[]);
  const ascSign=chart?.ascendant.sign||1;
  const houseRows=RASHI.map((_,index)=>{
    const house=index+1;
    const sign=RASHI[(ascSign-1+index)%12];
    const grahas=chart?.planets.filter(p=>p.house===house).map(p=>p.name)||[];
    return {house,sign,grahas};
  });

  return <section className="kundliStudio">
    <div className="kundliHero">
      <div className="eyebrow">ज्योतिष · SIDEREAL CHART ENGINE</div>
      <h2>Birth chart &amp; dasha laboratory</h2>
      <p>From the uploaded Arko Jyotish calculations: canonical birth instant, nine grahas, Lagna, houses, selected Vargas and Vimshottari Dasha. Mathematical output is separated from traditional interpretation.</p>
    </div>

    <form className="kundliForm" onSubmit={calculate}>
      <label>Chart name (optional)<input maxLength={120} value={birth.name} onChange={e=>change("name",e.target.value)} placeholder="Name for your chart"/></label>
      <label>Gregorian birth date<input required type="date" min="1900-01-01" max="2100-12-31" value={birth.date} onChange={e=>change("date",e.target.value)}/></label>
      <label>Local birth time (24h)<input required type="time" step="60" value={birth.time} onChange={e=>change("time",e.target.value)}/></label>
      <label>Timezone (IANA)
        <input value={birth.timezone} list="kundli-timezones" required onChange={e=>change("timezone",e.target.value)}/>
        <datalist id="kundli-timezones">{OPTIONS.map(([value,label])=><option key={value} value={value} label={label}/>)}</datalist>
      </label>
      <label>Latitude<input required min="-66" max="66" step=".0001" type="number" value={birth.latitude} onChange={e=>change("latitude",e.target.value)}/></label>
      <label>Longitude<input required min="-180" max="180" step=".0001" type="number" value={birth.longitude} onChange={e=>change("longitude",e.target.value)}/></label>
      <label>Elevation (metres)<input min="-500" max="9000" required type="number" value={birth.elevation} onChange={e=>change("elevation",e.target.value)}/></label>
      <label>House system<select value={birth.houseSystem} onChange={e=>change("houseSystem",e.target.value)}>
        <option value="whole_sign">Whole sign · Rashi</option><option value="equal">Equal · 30° from Lagna</option>
      </select></label>
      <button className="primaryBtn" disabled={busy}>{busy?"Calculating…":"Calculate Kundli"}</button>
    </form>
    <p className="kundliPrivacy">Private by default: calculations do not save birth data. Only the explicit Save action stores a report in your authenticated Firebase/Supabase account.</p>
    {error&&<p role="alert" className="kundliError">{error}</p>}
    {notice&&<p role="status" className="kundliNotice">{notice}</p>}

    {chart&&<div className="kundliResult">
      <div className="kundliSummary">
        <div><span>Ascendant · Lagna</span><strong>{chart.ascendant.signName}</strong><small>{chart.ascendant.degreesInSign.toFixed(3)}° · {chart.ascendant.nakshatra.name}</small></div>
        <div><span>UTC birth instant</span><strong>{new Date(chart.canonical.utc).toLocaleDateString("en-GB",{timeZone:"UTC"})}</strong><small>{new Date(chart.canonical.utc).toLocaleTimeString("en-GB",{timeZone:"UTC"})} UTC</small></div>
        <div><span>Janma Nakshatra</span><strong>{chart.planets.find(p=>p.key==="moon")?.nakshatra.name}</strong><small>Pada {chart.planets.find(p=>p.key==="moon")?.nakshatra.pada}</small></div>
        <div><span>Birth Dasha balance</span><strong>{chart.dasha.birthBalance.lord}</strong><small>{chart.dasha.birthBalance.years} years remaining</small></div>
      </div>

      <div className="kundliActions">
        <button type="button" className="primaryBtn" onClick={save}>Save privately</button>
        <button type="button" className="ghost" onClick={exportJson}>Export complete JSON</button>
        <button type="button" className="ghost" disabled={historyBusy} onClick={()=>loadHistory()}>{historyBusy?"Loading…":"My saved charts"}</button>
        <a href="/login" className="ghost">Account</a>
      </div>
      {history.length>0&&<div className="kundliHistory">
        <div className="eyebrow">PRIVATE · MY SAVED KUNDLI REPORTS</div>
        {history.map(item=><div key={item.id} className="kundliHistoryRow">
          <div><strong>{item.title}</strong><small>{item.createdAt?new Date(item.createdAt).toLocaleString():"Saved report"}</small></div>
          <button type="button" onClick={()=>deleteReport(item.id)} disabled={Boolean(deletingId)}>{deletingId===item.id?"Deleting…":"Delete permanently"}</button>
        </div>)}
      </div>}

      <div className="kundliColumns">
        <section className="kundliPanel"><div className="eyebrow">GRAHA TABLE</div><h3>Nine grahas · sidereal longitude</h3>
          <div className="kundliTableWrap"><table>
            <thead><tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>House</th><th>Motion</th></tr></thead>
            <tbody>{chart.planets.map(p=><tr key={p.key}>
              <td>{p.name}</td><td>{p.signName}</td><td>{p.degreesInSign.toFixed(3)}°</td><td>{p.house}</td>
              <td>{p.retrograde?"Retrograde":"Direct"}</td>
            </tr>)}</tbody>
          </table></div>
        </section>
        <section className="kundliPanel"><div className="eyebrow">12 HOUSE DISTRIBUTION</div><h3>Rashi placement</h3>
          <div className="kundliHouses">{houseRows.map(row=><div key={row.house}>
            <small>H{row.house} · {row.sign}</small><strong>{row.grahas.length?row.grahas.join(", "):"—"}</strong>
          </div>)}</div>
        </section>
      </div>

      <section className="kundliPanel"><div className="eyebrow">DIVISIONAL CHARTS · VARGA</div><h3>Selected divisional positions</h3>
        <div className="kundliVargaTabs">{chart.divisional.map(v=><button key={v.id} aria-pressed={v.id===selectedVarga} onClick={()=>setSelectedVarga(v.id)}>{v.id}</button>)}</div>
        {selected&&<><p>{selected.label} · ascendant {selected.ascendantSign}</p>
          <div className="kundliVargaGrid">{selected.planets.map(p=><div key={p.key}><span>{p.key}</span><strong>{p.sign}</strong></div>)}</div></>}
      </section>
      <section className="kundliPanel"><div className="eyebrow">VIMSHOTTARI DASHA · CHRONOLOGY</div><h3>Major and subperiods</h3>
        <div className="kundliVargaTabs">
          <button aria-pressed={activeDasha==="mahadasha"} onClick={()=>setActiveDasha("mahadasha")}>Mahadasha</button>
          <button aria-pressed={activeDasha==="antardasha"} onClick={()=>setActiveDasha("antardasha")}>Antardasha</button>
        </div>
        <div className="kundliDashaList">{dashaRows.map((p,i)=><div key={p.lord+p.startUTC+i}>
          <strong>{p.lord}</strong><span>{p.startUTC.slice(0,10)} → {p.endUTC.slice(0,10)}</span>
        </div>)}</div>
        <p>Each first-birth partial Mahadasha is clipped from the actual full period before calculating Antardasha positions.</p>
      </section>
      <section className="kundliProvenance">
        <h3>Calculation and accuracy</h3>
        <p>{chart.calculation.library} · {chart.calculation.ayanamsa}. Mean lunar nodes, whole-sign/equal houses, selected traditional Vargas; 365.25-day Dasha year.</p>
        <p>{chart.calculation.precision}. Times near changes of sign, nakshatra, or DST require manual cross-checking.</p>
        <p><strong>Truth boundary:</strong> Astronomical computation does not establish that astrological predictions are scientifically validated.</p>
        <small>Calculated using local date/time/timezone/coordinates; no birth details retained unless you explicitly Save.</small>
      </section>
    </div>}
    {!chart && <div className="kundliEmpty"><strong>Birth chart ready for calculation</strong><p>Enter the recorded birth date, time, timezone and coordinates. The chart will show planetary degrees, house placement, selected Vargas and Dasha after calculation.</p></div>}
  </section>;
}
