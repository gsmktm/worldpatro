"use client";
import Link from "next/link";
import DatabaseHealth from "@/components/database-health";
import {useEffect,useState} from "react";
type Module={
  slug:string;title:string;group:string;url:string;api:string[];
  availability:string;access:string;implementation:string;note:string;
};
type Payload={
  total:number;modules:Module[];categories:Array<{title:string;count:number}>;
  agentSpecialists:Array<{name:string;role:string;mission:string}>;
  infrastructure:{dataBackend:string;supabaseConfigured:boolean;firebaseWebConfigured:boolean;firebaseAdminConfigured:boolean;gatewayConfigured:boolean;agentAccess:string};caveat:string;
};
export default function SystemOverview(){
  const [snapshot,setSnapshot]=useState<Payload|null>(null);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState("");
  const [fetching,setFetching]=useState(false);
  async function load(){
    setFetching(true);setError("");
    try{
      const r=await fetch("/api/v1/platform/modules",{cache:"no-store"});
      if(!r.ok)throw new Error("Platform inventory temporarily unavailable.");
      setSnapshot(await r.json());
    }catch(e){setError(e instanceof Error?e.message:"Could not load platform status.");}
    finally{setFetching(false);}
  }
  useEffect(()=>{void load();},[]);
  const visible=snapshot?.modules.filter(m=>
    !filter||[m.title,m.group,m.slug].some(s=>s.toLowerCase().includes(filter.toLowerCase())))||[];
  return <section className="moduleWorkbench">
    <div className="workHero"><div className="eyebrow">ONE SYSTEM · {snapshot?.total ?? "…"} LINKED FUNCTIONS</div>
      <h1>Platform Command Map</h1>
      <p>A live inventory of modules, linked APIs and their readiness gates. “Available” means the application route exists and its core implementation is present—not that every provider is reachable or every private operation has been authenticated and tested.</p>
      <div className="workModuleLinks"><Link href="/app/patro">Open nine calendars →</Link><Link href="/app/agents">Open supervisor →</Link><Link href="/app/admin">Open admin →</Link></div>
    </div>
    {error&&<p className="workError" role="alert">{error}</p>}
    {snapshot&&<div className="workInfra">
      <div><span>Modules</span><strong>{snapshot.total}</strong></div>
      <div><span>Backend</span><strong>{snapshot.infrastructure.dataBackend}</strong></div>
      <div><span>Supabase API</span><strong>{snapshot.infrastructure.supabaseConfigured?"Configured":"Pending"}</strong></div>
      <div><span>Agent gateway</span><strong>{snapshot.infrastructure.gatewayConfigured?"Detected":"Not detected"}</strong></div>
    </div>}
    <DatabaseHealth />
    <div className="workToolbar"><label htmlFor="filter-modules">Find a module</label>
      <input id="filter-modules" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Panchang, agent, sources…"/>
      <button className="ghost" disabled={fetching} onClick={load}>{fetching?"Checking…":"Refresh availability"}</button>
    </div>
    {["TIME","INTELLIGENCE","BALANCE","OPERATIONS"].map(group=><section key={group} className="workPanel">
      <div className="eyebrow">{group}</div><h2>{group==="TIME"?"Calendars & Sacred Time":group==="INTELLIGENCE"?"World & Evidence":group==="BALANCE"?"Symbolic Engines":"Agents & Private Operations"}</h2>
      <div className="workModuleGrid">{visible.filter(m=>m.group===group).map(m=><article key={m.slug}>
        <span className="workState" data-state={m.availability}>{m.availability.replaceAll("-"," ")}</span>
        <h3><Link href={m.url}>{m.title} ↗</Link></h3>
        <p>{m.note}</p><small>Access: {m.access} · {m.implementation}</small>
        {m.api.length>0&&<details><summary>API routes</summary>{m.api.map(path=><code key={path}>{path}</code>)}</details>}
      </article>)}</div>
    </section>)}
    <section className="workPanel"><div className="eyebrow">ONE SUPERVISOR · SIX SPECIALISTS</div><h2>Agent structure</h2>
      <div className="workModuleGrid">{(snapshot?.agentSpecialists||[]).map(agent=><article key={agent.role}><h3>{agent.name}</h3><small>{agent.role}</small><p>{agent.mission}</p></article>)}</div>
      <p className="workMuted">{snapshot?.caveat}</p>
    </section>
  </section>;
}
