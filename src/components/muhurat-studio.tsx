"use client";

import { useState,useTransition,type FormEvent } from "react";
import { MUHURAT_CATEGORIES } from "@/lib/jyotish/muhurat-categories";

type Candidate={
  date:string;startUTC:string;endUTC:string;criteriaMatched:number;criteriaTotal:number;
  status:"screened"|"review";panchang:{tithi:string;nakshatra:string;paksha:string;weekday:string};
  rahuKalaUTC:{start:string;end:string};
  reasons:Array<{text:string;met:boolean}>;
};
type Result={
  category:string;range:{from:string;to:string};
  location:{timezone:string};
  scannedDays:number;candidates:Candidate[];skipped:Array<{date:string;reason:string}>;
  method:{provenance:string;status:string;warning:string;limitations:string};
};
const nepParts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
const np=Object.fromEntries(nepParts.map(p=>[p.type,p.value]));
const dayInNepal=np.year+"-"+np.month+"-"+np.day;

export default function MuhuratStudio() {
  const [inputs,setInputs]=useState({
    category:"general",from:dayInNepal,to:dayInNepal,
    timezone:"Asia/Kathmandu",latitude:"27.7172",longitude:"85.3240",elevation:"1300",limit:"15"
  });
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState("");
  const [busy,startTransition]=useTransition();
  const [expanded,setExpanded]=useState<string|null>(null);
  function change(key:keyof typeof inputs,value:string) {
    setInputs(p=>({...p,[key]:value}));setError("");
  }
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async()=>{
      setResult(null);setError("");
      try {
        const response=await fetch("/api/v1/muhurat/search",{
          method:"POST",headers:{"content-type":"application/json"},
          body:JSON.stringify({
            category:inputs.category,from:inputs.from,to:inputs.to,
            timezone:inputs.timezone,latitude:Number(inputs.latitude),longitude:Number(inputs.longitude),
            elevation:Number(inputs.elevation),limit:Number(inputs.limit)
          })
        });
        const json=await response.json();
        if(!response.ok)throw new Error(json.error||"Muhurat search unavailable.");
        setResult(json);
      }catch(e){setError(e instanceof Error?e.message:"Request unavailable.");}
    });
  }
  function local(instant:string) {
    return new Intl.DateTimeFormat("en-NP",{
      timeZone:inputs.timezone,hour:"2-digit",minute:"2-digit",hour12:true
    }).format(new Date(instant));
  }
  return <section className="muhuratStudio">
    <div className="muhuratIntro"><div className="eyebrow">MUHURAT · VERIFIED DATE & PLACE</div><h2>Traditional time-window explorer</h2><p>Scan up to 31 days using sunrise-based Panchang and a transparent shortlist of customary weekday and tithi rules. This is a screening aid, not a final priest/community determination.</p></div>
    <form className="muhuratForm" onSubmit={submit}>
      <label>Purpose<select value={inputs.category} onChange={e=>change("category",e.target.value)}>
        {MUHURAT_CATEGORIES.map(id=><option value={id} key={id}>{id.replaceAll("_"," ")}</option>)}
      </select></label>
      <label>From<input required type="date" value={inputs.from} onChange={e=>change("from",e.target.value)}/></label>
      <label>To (≤31 days)<input required type="date" value={inputs.to} onChange={e=>change("to",e.target.value)}/></label>
      <label>IANA timezone<input required value={inputs.timezone} onChange={e=>change("timezone",e.target.value)}/></label>
      <label>Latitude<input required type="number" min="-66" max="66" step=".0001" value={inputs.latitude} onChange={e=>change("latitude",e.target.value)}/></label>
      <label>Longitude<input required type="number" min="-180" max="180" step=".0001" value={inputs.longitude} onChange={e=>change("longitude",e.target.value)}/></label>
      <label>Elevation (m)<input required type="number" min="-500" max="9000" value={inputs.elevation} onChange={e=>change("elevation",e.target.value)}/></label>
      <button className="primaryBtn" disabled={busy}>{busy?"Searching…":"Find candidate windows"}</button>
    </form>
    {error&&<p role="alert" className="muhuratError">{error}</p>}
    {result&&<div className="muhuratResults">
      <div className="muhuratSummary"><div><div className="eyebrow">TRADITIONAL SHORTLIST</div><h3>{result.candidates.length} candidate windows</h3><small>{result.scannedDays} Gregorian days scanned · {result.location.timezone}</small></div><span>Rule-based, not a scientific rating</span></div>
      <div className="muhuratCards">{result.candidates.map(c=><article key={c.date} className="muhuratCandidate">
        <div className="muhuratCandidateHead"><h4>{c.date} · {c.panchang.weekday}</h4><span>{c.status==="screened"?"No screened condition flagged":"Additional review"}</span></div>
        <strong>{local(c.startUTC)} — {local(c.endUTC)}</strong>
        <p>{c.panchang.paksha} {c.panchang.tithi} · {c.panchang.nakshatra}</p>
        <small>{c.criteriaMatched}/{c.criteriaTotal} simple screening checks met; this is not an auspiciousness percentage.</small>
        <button type="button" aria-expanded={expanded===c.date} onClick={()=>setExpanded(expanded===c.date?null:c.date)}>{expanded===c.date?"Hide reasoning":"View reasons + Rahu Kala"}</button>
        {expanded===c.date&&<div className="muhuratReasons">
          {c.reasons.map((r,i)=><p key={i}><b>{r.met?"✓":"!"}</b> {r.text}</p>)}
          <p>Computed Rahu Kala exclusion: {local(c.rahuKalaUTC.start)} – {local(c.rahuKalaUTC.end)}</p>
        </div>}
      </article>)}</div>
      {result.candidates.length===0&&<p role="status">No verifiable candidate windows for these inputs. Check the coordinates/date and the skipped-day reasons.</p>}
      {result.skipped.length>0&&<details className="muhuratSkipped"><summary>{result.skipped.length} skipped days · show calculation limits</summary>{result.skipped.map(x=><p key={x.date}>{x.date}: {x.reason}</p>)}</details>}
      <div className="muhuratLimits"><b>Methods and limits</b><p>{result.method.provenance}. {result.method.warning}</p><p>{result.method.limitations}</p></div>
    </div>}
  </section>;
}
