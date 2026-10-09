"use client";

import {useEffect,useMemo,useState,useTransition,type FormEvent} from "react";
import Link from "next/link";
import type {AdminKind,AdminRecord,AdminState} from "@/lib/admin/contracts";
const KINDS:[AdminKind,string][]=[
  ["source","Source Registry"],["authority","Calendar Authority"],["observance","Religious Observances"],["article","Learning Articles"]
];
type AdminOverview={
  backend:string;role:string;
  metrics:{total:number;draft:number;inReview:number;published:number;archived:number;byKind:Record<string,number>};
  recentAudit:Array<Record<string,unknown>>;
  limits:{records:string;audit:string};
};
type ContentForm={
  title:string;slug:string;summary:string;body:string;sourceUrl:string;country:string;tradition:string;eventDate:string;
};
const blank:ContentForm={title:"",slug:"",summary:"",body:"",sourceUrl:"",country:"",tradition:"",eventDate:""};
const STATES:AdminState[]=["draft","in_review","published","archived"];

export default function AdminConsole(){
  const [kind,setKind]=useState<AdminKind>("article");
  const [records,setRecords]=useState<AdminRecord[]>([]);
  const [overview,setOverview]=useState<AdminOverview|null>(null);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [gate,setGate]=useState<"loading"|"admin"|"readonly"|"blocked">("loading");
  const [selected,setSelected]=useState<AdminRecord|null>(null);
  const [form,setForm]=useState<ContentForm>(blank);
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("all");
  const [working,startTransition]=useTransition();
  const [saving,setSaving]=useState(false);

  async function readJSON(response:Response){
    const json=await response.json().catch(()=>({error:"Unexpected server response."}));
    if(!response.ok)throw new Error(json.error||"Request failed.");
    return json;
  }
  async function refresh(nextKind=kind){
    try{
      const [contentResponse,overviewResponse]=await Promise.all([
        fetch("/api/v1/admin/content?kind="+nextKind,{cache:"no-store"}),
        fetch("/api/v1/admin/overview",{cache:"no-store"})
      ]);
      const c=await readJSON(contentResponse);
      const o=await readJSON(overviewResponse);
      setRecords(c.records||[]);setOverview(o);
      setGate(c.role==="admin"?"admin":"readonly");
    }catch(e){setError(e instanceof Error?e.message:"Unable to load admin data.");}
  }
  useEffect(()=>{
    let ignore=false;
    (async()=>{
      try{
        const r=await fetch("/api/v1/admin/session",{cache:"no-store"});
        if(ignore)return;
        if(!r.ok){setGate("blocked");return;}
        const json=await r.json();
        setGate(json.role==="admin"?"admin":"readonly");
        await refresh("article");
      }catch{if(!ignore)setGate("blocked");}
    })();
    return ()=>{ignore=true;};
  },[]);
  function open(item:AdminRecord|null){
    setSelected(item);
    setForm(item?{
      title:item.title,slug:item.slug,summary:item.summary,body:item.body,
      sourceUrl:item.sourceUrl,country:item.country,tradition:item.tradition,eventDate:item.eventDate
    }:blank);
    setError("");setNotice("");
  }
  function setField(key:keyof ContentForm,value:string){
    setForm(v=>({...v,[key]:value}));setNotice("");
  }
  function switchKind(next:AdminKind){
    setKind(next);setSelected(null);setForm(blank);setQuery("");setFilter("all");setError("");
    startTransition(async()=>refresh(next));
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setSaving(true);setError("");setNotice("");
    try{
      const isEdit=Boolean(selected);
      const url=isEdit?"/api/v1/admin/content/"+encodeURIComponent(selected!.id):"/api/v1/admin/content";
      const response=await fetch(url,{
        method:isEdit?"PATCH":"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(isEdit?{...form,expectedVersion:selected!.version}:{...form,kind})
      });
      const json=await readJSON(response);
      setNotice(isEdit?"Saved version "+json.record.version+".":"Draft created successfully.");
      await refresh(kind);
      open(json.record);
      setNotice(isEdit?"Changes saved.":"Draft created; submit it for review before publication.");
    }catch(e){setError(e instanceof Error?e.message:"Could not save.");}
    finally{setSaving(false);}
  }
  async function changeState(status:AdminState){
    if(!selected)return;
    if(status==="archived"&&!window.confirm("Archive this published record? It will disappear from public pages, and the audit log will be retained."))return;
    setSaving(true);setError("");setNotice("");
    try{
      const response=await fetch("/api/v1/admin/content/"+encodeURIComponent(selected.id),{
        method:"PATCH",headers:{"content-type":"application/json"},
        body:JSON.stringify({status,expectedVersion:selected.version})
      });
      const json=await readJSON(response);
      await refresh(kind);open(json.record);
      setNotice("Status changed to "+status.replaceAll("_"," ")+".");
    }catch(e){setError(e instanceof Error?e.message:"Could not change state. Save edits or refresh if the record changed.");}
    finally{setSaving(false);}
  }
  const visible=useMemo(()=>records.filter(r=>
    (filter==="all"||r.status===filter)&&
    (!query.trim()||[r.title,r.slug,r.country,r.tradition].some(x=>x.toLowerCase().includes(query.trim().toLowerCase())))
  ),[records,query,filter]);

  if(gate==="loading")return <section className="adminPage"><div className="adminHero"><h1>World Patro Administration</h1><p>Verifying protected account role…</p></div></section>;
  if(gate==="blocked")return <section className="adminPage">
    <div className="adminHero"><div className="eyebrow">PROTECTED ADMINISTRATIVE SYSTEM</div><h1>Administrator access required</h1>
      <p>This console is restricted to server-verified World Patro administrator, reviewer and editor roles. Admin roles cannot be created from a public form.</p>
      <div className="adminActions"><Link className="primaryBtn" href="/login">Sign in</Link><Link className="ghost" href="/app">Return to World Patro</Link></div>
    </div>
  </section>;

  const readOnly=gate!=="admin";
  return <section className="adminPage">
    <div className="adminHero">
      <div className="eyebrow">ॐ WORLD PATRO · EDITORIAL OPERATIONS</div>
      <h1>Administration Command Center</h1>
      <p>Manage reviewed sources, calendar authority releases, sacred-time observances and published learning content with versioned edits, explicit review and audit history.</p>
      <div className="adminActions"><span>Role: {overview?.role||gate}</span><span>Database: {overview?.backend||"checking"}</span><button type="button" className="ghost" onClick={()=>startTransition(async()=>refresh())} disabled={working}>Refresh</button></div>
    </div>
    {readOnly&&<p className="adminWarning">This role has read-only oversight. Editing and publication require the server-granted administrator role.</p>}
    {overview&&<div className="adminMetrics">
      {(["total","draft","inReview","published","archived"] as const).map(key=><article key={key}>
        <small>{key==="inReview"?"In review":key}</small><strong>{overview.metrics[key]}</strong>
      </article>)}
    </div>}
    <div className="adminToolbar">
      <div className="adminTabs">{KINDS.map(([value,label])=><button type="button" aria-pressed={kind===value} key={value} onClick={()=>switchKind(value)}>{label} ({overview?.metrics.byKind[value]??0})</button>)}</div>
      <div className="adminFilters">
        <input aria-label="Search records" placeholder="Search title, slug or location…" value={query} onChange={e=>setQuery(e.target.value)}/>
        <select aria-label="Filter publishing status" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All statuses</option>{STATES.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}
        </select>
        {!readOnly&&<button type="button" className="primaryBtn" onClick={()=>open(null)}>New draft</button>}
      </div>
    </div>
    {error&&<p className="adminError" role="alert">{error}</p>}
    {notice&&<p className="adminNotice" role="status">{notice}</p>}
    <div className="adminWorkArea">
      <div className="adminRecords">
        <div className="adminSectionHead"><h2>{KINDS.find(([k])=>k===kind)?.[1]}</h2><small>{visible.length} shown · latest 100 maximum</small></div>
        {visible.length===0&&<p className="adminEmpty">No matching records. Select “New draft” to create the first one when database access is active.</p>}
        {visible.map(r=><button type="button" key={r.id} aria-pressed={selected?.id===r.id} className="adminRecord" onClick={()=>open(r)}>
          <div><strong>{r.title}</strong><small>{r.slug} · v{r.version} · {r.country||"Global"}</small></div>
          <span data-status={r.status}>{r.status.replaceAll("_"," ")}</span>
        </button>)}
      </div>
      <section className="adminEditor">
        <div className="adminSectionHead"><div><div className="eyebrow">VERSIONED CONTENT EDITOR</div><h2>{selected?"Edit · "+selected.title:"Create draft"}</h2></div>{selected&&<small>v{selected.version}</small>}</div>
        <form onSubmit={save} className="adminForm">
          <label>Title<input required minLength={3} maxLength={160} value={form.title} disabled={readOnly} onChange={e=>setField("title",e.target.value)}/></label>
          <label>Unique slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={form.slug} disabled={readOnly||Boolean(selected)} onChange={e=>setField("slug",e.target.value)} placeholder="nepal-panchang-release"/></label>
          <label>Country / region<input maxLength={100} value={form.country} disabled={readOnly} onChange={e=>setField("country",e.target.value)}/></label>
          <label>Tradition / context<input maxLength={100} value={form.tradition} disabled={readOnly} onChange={e=>setField("tradition",e.target.value)}/></label>
          <label>Event date (optional)<input type="date" value={form.eventDate} disabled={readOnly} onChange={e=>setField("eventDate",e.target.value)}/></label>
          <label className="wide">Verified HTTPS source<input type="url" maxLength={1500} value={form.sourceUrl} disabled={readOnly} onChange={e=>setField("sourceUrl",e.target.value)} placeholder="https://official-source.example/..."/></label>
          <label className="wide">Short summary<textarea rows={3} maxLength={600} value={form.summary} disabled={readOnly} onChange={e=>setField("summary",e.target.value)}/></label>
          <label className="wide">Full content / methodology<textarea rows={9} maxLength={16000} value={form.body} disabled={readOnly} onChange={e=>setField("body",e.target.value)}/></label>
          {!readOnly&&<div className="adminFormActions"><button type="submit" className="primaryBtn" disabled={saving}>{saving?"Saving…":selected?"Save changes":"Create draft"}</button>
            {selected&&<button type="button" className="ghost" onClick={()=>open(null)}>Close editor</button>}
          </div>}
        </form>
        {selected&&!readOnly&&<div className="adminLifecycle">
          <p>Publication state: <strong>{selected.status.replaceAll("_"," ")}</strong>. Save edits before changing status.</p>
          {selected.status==="draft"&&<button disabled={saving} type="button" onClick={()=>changeState("in_review")}>Submit for review →</button>}
          {selected.status==="in_review"&&<>
            <button disabled={saving} type="button" onClick={()=>changeState("published")}>Publish reviewed content</button>
            <button disabled={saving} type="button" onClick={()=>changeState("draft")}>Return to draft</button>
          </>}
          {selected.status==="published"&&<button disabled={saving} type="button" onClick={()=>changeState("archived")}>Archive &amp; unpublish</button>}
          {selected.status==="archived"&&<button disabled={saving} type="button" onClick={()=>changeState("draft")}>Restore as draft</button>}
          <small>Publishing requires a title, summary, content body and HTTPS source URL. Status changes are written to the audit trail.</small>
        </div>}
      </section>
    </div>
    <section className="adminAudit">
      <div className="adminSectionHead"><h2>Administrative audit trail</h2><small>Latest 50 events</small></div>
      {overview?.recentAudit?.length?<div className="adminAuditList">{overview.recentAudit.slice(0,50).map((event,i)=><div key={String(event.id||i)}>
        <strong>{String(event.action||"edit")}</strong>
        <span>{String(event.recordId||event.record_id||"record")}</span>
        <small>v{String(event.version||"—")} · {String(event.newStatus||event.new_status||"—")}</small>
      </div>)}</div>:<p className="adminEmpty">Audit history appears after authorized record changes.</p>}
    </section>
  </section>;
}
