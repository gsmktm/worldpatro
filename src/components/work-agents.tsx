"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {AgentConsole,type AgentRuntimeStatus} from "@/components/agent-console";
type Profile={role:string;name:string;mark:string;mission:string;boundary:string};
type Status=AgentRuntimeStatus&{
  specialists:Profile[];supervisor:{name:string;model:string};
  subagentModel:string;
  executionPolicy:{maxSupervisorSteps:number;maxSpecialistSteps:number;externalActions:string};
};
function localDay(){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kathmandu",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return p.year+"-"+p.month+"-"+p.day;
}
export default function AgentWorkspace(){
  const [status,setStatus]=useState<Status|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    const ctrl=new AbortController();
    fetch("/api/v1/agents/status",{signal:ctrl.signal,cache:"no-store"})
      .then(async r=>{if(!r.ok)throw new Error("Conductor status unavailable.");return r.json();})
      .then(s=>setStatus(s)).catch(e=>{if(!ctrl.signal.aborted)setError(String(e));});
    return ()=>ctrl.abort();
  },[]);
  return <section className="moduleWorkbench">
    <div className="workHero"><div className="eyebrow">ॐ · SUPERVISOR & SIX SPECIALISTS</div>
      <h1>World Patro Agent Conductor</h1>
      <p>One accountable supervisor coordinates six bounded specialists. Every response separates source-backed facts, astronomical computation, tradition, symbolism and unknown information. No specialist can silently publish, purchase or alter external accounts.</p>
      <p className="workMuted">Agent execution requires configured AI Gateway and the selected server access mode; public module APIs remain usable even when the conductor is gated.</p></div>
    <div className="workColumns">
      <AgentConsole date={localDay()} status={status}/>
      <section className="workPanel"><div className="eyebrow">BOUNDARY & DELEGATION</div><h2>Six specialist roles</h2>
        {error&&<p className="workError">{error}</p>}
        <div className="workAgentList">{(status?.specialists||[]).map(p=><article key={p.role}>
          <span>{p.mark}</span><div><strong>{p.name} · {p.role}</strong><small>{p.mission}</small><em>{p.boundary}</em></div>
        </article>)}</div>
        {status&&<p className="workMuted">Supervisor: {status.supervisor.model} · specialist model: {status.subagentModel} · maximum supervisor steps: {status.executionPolicy.maxSupervisorSteps}. Operations require human confirmation.</p>}
        {!status&&!error&&<p className="workMuted">Checking runtime configuration…</p>}
      </section>
    </div>
    <div className="workModuleLinks"><Link href="/app/patro">Calendar specialist →</Link><Link href="/app/world">World facts →</Link><Link href="/app/research">Evidence research →</Link><Link href="/app/wbe">Balance →</Link><Link href="/app/workflows">Human workflows →</Link></div>
  </section>;
}
