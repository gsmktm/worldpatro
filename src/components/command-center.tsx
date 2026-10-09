"use client";

import { useEffect, useState, useTransition } from "react";
import type { CalendarResult } from "@/lib/calendars";
import { AgentConsole } from "@/components/agent-console";

type Snapshot = { canonical:{isoDate:string;generatedAt:string}; calendars:CalendarResult[] };
type Indicator = { id:string; name:string; value:number|null; year:string|null; source:string };
type CountrySnapshot = { iso3:string; indicators:Indicator[]; retrievedAt:string };
type AgentStatus = { readyForGateway:boolean; specialists:Array<{role:string;name:string}> };

const number = new Intl.NumberFormat("en", { notation:"compact", maximumFractionDigits:2 });

export default function CommandCenter() {
  const [date,setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [snapshot,setSnapshot] = useState<Snapshot|null>(null);
  const [country,setCountry] = useState<CountrySnapshot|null>(null);
  const [agentStatus,setAgentStatus] = useState<AgentStatus|null>(null);
  const [error,setError] = useState("");
  const [pending,startTransition] = useTransition();

  function synchronize(selected=date) {
    startTransition(async () => {
      setError("");
      try {
        const [patroResponse,countryResponse,agentResponse] = await Promise.all([
          fetch(`/api/v1/patro/today?date=${selected}`,{cache:"no-store"}),
          fetch("/api/v1/world/country?iso3=NPL",{cache:"no-store"}),
          fetch("/api/v1/agents/status",{cache:"no-store"})
        ]);
        if (!patroResponse.ok) throw new Error("Patro synchronization failed.");
        setSnapshot(await patroResponse.json());
        if (countryResponse.ok) setCountry(await countryResponse.json());
        if (agentResponse.ok) setAgentStatus(await agentResponse.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Synchronization failed.");
      }
    });
  }

  useEffect(() => { synchronize(date); }, []);

  const calculated = snapshot?.calendars.filter(item => item.status === "calculated").length ?? 0;

  return <div className="cockpit">
    <section className="momentHero">
      <div className="momentCopy">
        <div className="eyebrow">WORLD PATRO · ONE MOMENT / WHOLE SYSTEM</div>
        <h1>See time. Verify the world. Act with context.</h1>
        <p>Nine calendars, astronomical sacred time, public-source intelligence, evidence workflows and bounded AI agents — composed as one Nepal-origin global command center.</p>
        <div className="heroTrust">
          <span><i className="greenDot"/> source-aware</span>
          <span>authority-aware</span>
          <span>human-confirmed operations</span>
        </div>
      </div>

      <div className="momentControl">
        <div className="controlTop"><span>Canonical moment</span><b>{date}</b></div>
        <label htmlFor="canonical-date">Date</label>
        <input id="canonical-date" type="date" value={date} onChange={event=>setDate(event.target.value)}/>
        <button onClick={()=>synchronize()} disabled={pending}>{pending ? "Synchronizing…" : "Synchronize World Patro"}</button>
        <div className="contextLine"><span>27.7172° N · 85.3240° E</span><span>Asia/Kathmandu</span></div>
        {error ? <small className="error">{error}</small> : <small>Change the date; every module resolves from the same context.</small>}
      </div>
    </section>

    <section className="signalStrip">
      <Metric label="Calendars" value="9" meta={`${calculated} deterministic now`} />
      <Metric label="Agents" value="7" meta={agentStatus?.readyForGateway ? "Gateway runtime ready" : "Gateway activates on Vercel runtime"} tone="gold" />
      <Metric label="WBE" value="729" meta="9 anchor gates · symbolic" />
      <Metric label="Truth layers" value="7" meta="fact → authority → unknown" />
    </section>

    <section className="commandGrid">
      <div className="patroDeck">
        <div className="panelTitle">
          <div><div className="eyebrow">ONE PATRO</div><h2>9 synchronized time lenses</h2></div>
          <span>{snapshot?.canonical?.isoDate?.slice(0,10) ?? "syncing…"}</span>
        </div>
        <div className="calendarGrid">
          {(snapshot?.calendars ?? []).map((calendar,index)=><article key={calendar.id} className={`calendarCard ${index===0?"featured":""}`}>
            <div className="cardHeader">
              <span className="calIcon">{calendar.icon}</span>
              <span className={`provenance ${calendar.status==="calculated"?"ok":"warn"}`}>{calendar.provenance}</span>
            </div>
            <h3>{calendar.name}</h3>
            <div className="calDate">{calendar.value}</div>
            <small>{calendar.method}</small>
          </article>)}
        </div>
      </div>

      <AgentConsole date={date}/>
    </section>

    <section className="intelGrid">
      <article className="intelPanel">
        <div className="panelTitle">
          <div><div className="eyebrow">PUBLIC FACTS · NEPAL</div><h2>Live indicator pulse</h2></div>
          <span className="sourceSeal">WORLD BANK</span>
        </div>
        <div className="indicatorGrid">
          {(country?.indicators ?? []).map(item => <div className="indicator" key={item.id}>
            <span>{item.name}</span>
            <strong>{item.value===null ? "Unavailable" : number.format(item.value)}</strong>
            <small>{item.year ?? "—"} · {item.source}</small>
          </div>)}
        </div>
        <div className="retrievalLine">Retrieved {country?.retrievedAt ? new Date(country.retrievedAt).toLocaleString() : "when synchronized"}</div>
      </article>

      <article className="trustPanel">
        <div className="eyebrow">TRUTH ARCHITECTURE</div>
        <h2>Every output declares what it is.</h2>
        <div className="truthStack">
          <span><b>FACT</b> deterministic or source-backed</span>
          <span><b>AUTHORITY</b> official / curated release</span>
          <span><b>ASTRONOMY</b> reproducible calculation</span>
          <span><b>INTERPRETATION</b> astrology / tradition</span>
          <span><b>WBE</b> symbolic framework</span>
          <span><b>SCENARIO</b> planning / hypothetical</span>
          <span><b>UNKNOWN</b> unresolved</span>
        </div>
      </article>
    </section>
  </div>;
}

function Metric({label,value,meta,tone}:{label:string;value:string;meta:string;tone?:"gold"}) {
  return <div className={`metric ${tone==="gold"?"metricGold":""}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>;
}
