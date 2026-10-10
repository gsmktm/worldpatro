import { notFound } from "next/navigation";
import Link from "next/link";
import { FEATURE_MAP } from "@/lib/features";
import { ANCHORS } from "@/lib/wbe";
import { AGENT_PROFILES, SUPERVISOR_MODEL, SUBAGENT_MODEL } from "@/lib/agents/contracts";

export default async function ModulePage({params}:{params:Promise<{module:string}>}) {
  const {module} = await params;
  const feature = FEATURE_MAP.get(module);
  if (!feature) notFound();

  return <div>
    <section className="featureHero">
      <div className="featureHeroGlow"/>
      <div className="eyebrow">{feature.eyebrow}</div>
      <h1>{feature.title}</h1>
      <p>{feature.description}</p>
      <div className="chips">
        <span className="chip">STATUS · {feature.status.toUpperCase()}</span>
        {feature.api?.map(x=><span className="chip" key={x}>{x}</span>)}
      </div>
    </section>

    {module==="agents" ? <section className="agentProfileGrid">
      <article className="supervisorCard">
        <div className="supervisorMark">G</div>
        <div><div className="eyebrow">SUPERVISOR</div><h2>World Patro Conductor</h2><p>Plans the answer, delegates only what is necessary, reconciles truth layers, and never treats an external action as complete without confirmation.</p></div>
        <span>{SUPERVISOR_MODEL}</span>
      </article>
      {AGENT_PROFILES.map(agent => <article className="agentProfileCard" key={agent.role}>
        <div className="agentMark">{agent.mark}</div>
        <div><div className="eyebrow">{agent.role.toUpperCase()}</div><h3>{agent.name}</h3></div>
        <p>{agent.mission}</p>
        <small>{agent.boundary}</small>
        <span>{SUBAGENT_MODEL}</span>
      </article>)}
    </section> : <section className="featureGrid">
      <article className="featureCard"><h3>Functions</h3><ul>{feature.functions.map(x=><li key={x}>{x}</li>)}</ul></article>
      <article className="featureCard"><h3>Data & persistence</h3><ul>{(feature.tables?.length?feature.tables:["No persistence required for this core module"]).map(x=><li key={x}>{x}</li>)}</ul></article>
      <article className="featureCard"><h3>Execution flow</h3><ol><li>Resolve canonical context</li><li>Validate method / authority profile</li><li>Calculate or retrieve source-backed data</li><li>Attach provenance and uncertainty</li><li>Save / watch / export when authorized</li></ol></article>
      <article className="featureCard"><h3>Trust boundary</h3><ul><li>Facts require sources or reproducible methods</li><li>Official declarations override prediction where applicable</li><li>Astrology is labeled interpretation</li><li>WBGR-109 / WENS is labeled symbolism</li><li>Unsupported data is never guessed</li></ul></article>
    </section>}

    {module==="wbe" ? <section className="featureCard featureWide"><h3>9 Anchor Gates</h3><div className="chips">{ANCHORS.map(g=><span className="chip" key={g.code}>{g.graha} · {g.tradition} · {g.power}</span>)}</div><p className="muted">The complete cube contains 729 Gates. These pairings are symbolic lenses, not doctrinal claims.</p><Link className="ghost" href="/api/v1/wbgr/gates?anchors=true">Open API</Link></section> : null}
  </div>;
}
