"use client";
import { FormEvent, useState, useTransition } from "react";

type Task="profile"|"comparison"|"business";
const BUTTONS:[Task,string][]= [["profile","Personal numbers"],["comparison","Two people"],["business","Business name"]];

export default function NumerologyStudio(){
  const [task,setTask]=useState<Task>("profile");
  const [name,setName]=useState("");
  const [birthDate,setBirthDate]=useState("");
  const [partnerName,setPartnerName]=useState("");
  const [partnerBirthDate,setPartnerBirthDate]=useState("");
  const [businessName,setBusinessName]=useState("");
  const [mode,setMode]=useState<"pythagorean"|"chaldean">("pythagorean");
  const [referenceDate,setReferenceDate]=useState("2026-10-09");
  const [result,setResult]=useState<Record<string,unknown>|null>(null);
  const [error,setError]=useState("");
  const [pending,startTransition]=useTransition();

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    startTransition(async()=>{
      setResult(null);setError("");
      const body={task,name,birthDate,referenceDate,mode,partnerName,partnerBirthDate,businessName};
      try {
        const response=await fetch("/api/v1/numerology/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Calculation failed.");
        setResult(data.result);
      }catch(err){setError(err instanceof Error?err.message:"Calculation unavailable.");}
    });
  }

  function exportJson(){
    if(!result)return;
    const object={task,mode,result,classification:"TRADITIONAL INTERPRETATION"};
    const href=URL.createObjectURL(new Blob([JSON.stringify(object,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=href;a.download="worldpatro-numerology.json";a.click();URL.revokeObjectURL(href);
  }

  function renderEntry(key:string,value:unknown){
    if(typeof value==="string"||typeof value==="number")return <div className="numerologyEntry" key={key}><span>{key.replace(/([A-Z])/g," $1")}</span><strong>{String(value)}</strong></div>;
    if(value&&typeof value==="object")return <div className="numerologyNested" key={key}><h4>{key.replace(/([A-Z])/g," $1")}</h4><pre>{JSON.stringify(value,null,2)}</pre></div>;
    return null;
  }

  return <section className="numerologyStudio">
    <div className="numerologyTitle">
      <div className="eyebrow">AR KO JYOTISH ENGINE · ARCHIVE MIGRATION</div>
      <h2>Numerology laboratory</h2>
      <p>Pythagorean and Chaldean letter-value calculations, Lo Shu, life-cycle, personal-number and symbolic compatibility tools. Computations are deterministic; meanings are interpretive.</p>
    </div>
    <div className="numerologyTabs">{BUTTONS.map(([id,label])=><button type="button" key={id} aria-pressed={task===id} onClick={()=>{setTask(id);setResult(null);setError("");}}>{label}</button>)}</div>
    <form onSubmit={submit} className="numerologyForm">
      <label>Full name (Latin letters)<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Enter a name"/></label>
      <label>Birth date (Gregorian)<input type="date" required value={birthDate} onChange={e=>setBirthDate(e.target.value)}/></label>
      {task==="comparison"&&<>
        <label>Other person's name<input required value={partnerName} maxLength={120} onChange={e=>setPartnerName(e.target.value)}/></label>
        <label>Other person's birth date<input required type="date" value={partnerBirthDate} onChange={e=>setPartnerBirthDate(e.target.value)}/></label>
      </>}
      {task==="business"&&<label>Business name<input required maxLength={120} value={businessName} onChange={e=>setBusinessName(e.target.value)}/></label>}
      <label>Calculation system<select value={mode} onChange={e=>setMode(e.target.value as "pythagorean"|"chaldean")}><option value="pythagorean">Pythagorean</option><option value="chaldean">Chaldean</option></select></label>
      <label>Reference day<input required type="date" value={referenceDate} onChange={e=>setReferenceDate(e.target.value)}/></label>
      <button className="primaryBtn" disabled={pending}>{pending?"Calculating…":"Calculate numbers"}</button>
    </form>
    {error&&<p className="error" role="status">{error}</p>}
    {result&&<section className="numerologyResults">
      <div className="numerologyResultsHead"><div><div className="eyebrow">CALCULATED · INTERPRETIVE PROFILE</div><h3>Calculation result</h3></div><button type="button" className="ghost" onClick={exportJson}>Export JSON</button></div>
      <div className="numerologyResultGrid">{Object.entries(result).map(([key,val])=>key==="provenance"?null:renderEntry(key,val))}</div>
    </section>}
    <div className="numerologyDisclaimer">Traditional numerology is not scientific forecasting. These mathematical outputs should not determine health, finance, legal matters, relationships, or consequential decisions. No personal name or birth date is saved by this calculator.</div>
  </section>;
}
