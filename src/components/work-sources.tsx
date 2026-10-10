"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

type Source={slug:string;name:string;tier:string;kind:string;url:string;status:string;last_verified_at?:string};
type Published={id:string;title:string;summary:string;sourceUrl:string;status:string};
export default function SourceWorkbench(){
  const [sources,setSources]=useState<Source[]>([]);
  const [published,setPublished]=useState<Published[]>([]);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [query,setQuery]=useState("");
  async function load(){
    setError("");setNotice("");
    const [registry,editorial]=await Promise.allSettled([
      fetch("/api/v1/sources",{cache:"no-store"}).then(async r=>{
        if(!r.ok)throw new Error("Source registry API unavailable.");
        return r.json();
      }),
      fetch("/api/v1/content?kind=source",{cache:"no-store"}).then(async r=>{
        if(!r.ok)throw new Error("Reviewed-source database inactive.");
        return r.json();
      })
    ]);
    if(registry.status==="fulfilled")setSources(Array.isArray(registry.value.sources)?registry.value.sources:[]);
    else setError("Built-in source catalogue unavailable.");
    if(editorial.status==="fulfilled")setPublished(Array.isArray(editorial.value.records)?editorial.value.records:[]);
    else setNotice("Editorially published sources await backend activation; built-in source catalogue is independent.");
  }
  useEffect(()=>{void load();},[]);
  const filtered=sources.filter(s=>[s.name,s.slug,s.kind].some(x=>x.toLowerCase().includes(query.toLowerCase())));
  return <section className="moduleWorkbench">
    <div className="workHero"><div className="eyebrow">WORLD PATRO · FACTS & ATTRIBUTION</div>
      <h1>Source Registry</h1><p>Distinguish public provider integrations from individual, administrator-approved records. Links are attributed to their named publishers; a configured API is not automatically a source for every claim.</p>
      <div className="workModuleLinks"><Link href="/app/admin">Admin review workflow →</Link><Link href="/app/authorities">Authority releases →</Link><Link href="/app/research">Research notebooks →</Link></div></div>
    <div className="workToolbar"><label htmlFor="source-query">Filter registry</label><input id="source-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="World Bank, USGS, calendar…"/>
      <button className="ghost" onClick={()=>load()}>Refresh sources</button></div>
    {error&&<p className="workError" role="alert">{error}</p>}
    {notice&&<p className="workWarning" role="status">{notice}</p>}
    <section className="workPanel"><div className="eyebrow">PUBLIC PROVIDER CATALOGUE</div><h2>{filtered.length} sources</h2>
      <div className="workSourceGrid">{filtered.map(src=><article key={src.slug}><div className="eyebrow">TIER {src.tier} · {src.kind}</div>
      <h3>{src.name}</h3><small>Integration status: {src.status}</small>
      {src.url.startsWith("https://")&&<a href={src.url} target="_blank" rel="noopener noreferrer">Visit provider ↗</a>}</article>)}</div>
    </section>
    <section className="workPanel"><div className="eyebrow">REVIEWED CONTENT · PUBLISHED ONLY</div><h2>{published.length} approved source records</h2>
      {published.length===0&&<p className="workMuted">No editorially approved source records returned. This does not invalidate the named public integration catalogue above.</p>}
      {published.map(x=><article className="workListItem" key={x.id}><div><strong>{x.title}</strong><small>{x.summary}</small></div>
      {x.sourceUrl?.startsWith("https://")&&<a href={x.sourceUrl} target="_blank" rel="noopener noreferrer">Evidence ↗</a>}</article>)}
    </section>
  </section>;
}
