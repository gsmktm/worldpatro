import { notFound } from "next/navigation";
import Link from "next/link";
import { FEATURE_MAP } from "@/lib/features";
import { ANCHORS } from "@/lib/wbe";

export default async function ModulePage({params}:{params:Promise<{module:string}>}) {
  const {module} = await params;
  const feature = FEATURE_MAP.get(module);
  if (!feature) notFound();

  return <div>
    <section className="featureHero">
      <div className="eyebrow">{feature.eyebrow}</div>
      <h1>{feature.title}</h1>
      <p>{feature.description}</p>
      <div className="chips">
        <span className="chip">STATUS · {feature.status.toUpperCase()}</span>
        {feature.api?.map(x=><span className="chip" key={x}>{x}</span>)}
      </div>
    </section>
    <section className="featureGrid">
      <article className="featureCard"><h3>Functions</h3><ul>{feature.functions.map(x=><li key={x}>{x}</li>)}</ul></article>
      <article className="featureCard"><h3>Data & persistence</h3><ul>{(feature.tables?.length?feature.tables:["No persistence required for this core module"]).map(x=><li key={x}>{x}</li>)}</ul></article>
      <article className="featureCard"><h3>Flow</h3><ul><li>Choose canonical context</li><li>Validate method / authority profile</li><li>Calculate or retrieve source-backed data</li><li>Attach provenance and uncertainty</li><li>Save / watch / export when signed in</li></ul></article>
      <article className="featureCard"><h3>Trust boundary</h3><ul><li>Facts require sources</li><li>Official declarations override prediction where applicable</li><li>Astrology is labeled interpretation</li><li>WBE is labeled symbolism</li><li>Unsupported data is never guessed</li></ul></article>
    </section>
    {module==="wbe" && <section className="featureCard" style={{marginTop:12}}><h3>9 Anchor Gates</h3><div className="chips">{ANCHORS.map(g=><span className="chip" key={g.code}>{g.graha} · {g.tradition} · {g.power}</span>)}</div><p className="muted">The complete cube contains 729 Gates. These pairings are symbolic lenses, not doctrinal claims.</p><Link className="ghost" href="/api/v1/wbe/gates?anchors=true">Open API</Link></section>}
  </div>;
}
