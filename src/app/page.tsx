import Link from "next/link";

const pillars = [
  ["TIME","9 calendars + Panchang","One canonical moment, many legitimate methods."],
  ["INTELLIGENCE","Sources before claims","Public data, evidence and freshness before conclusions."],
  ["CONDUCTOR","Supervisor + 6 specialists","Bounded agents that delegate rather than hallucinate omniscience."],
  ["BALANCE","WBGR-109 · 1799 BS · WENS","Nine traditions, nine grahas and nine themes; 109 curated paths across 729 symbolic gates."]
];

export default function Landing() {
  return <main className="landingV2">
    <section className="landingHero">
      <div className="himalayaLine" aria-hidden="true"/>
      <div className="landingSeal">ॐ</div>
      <div className="eyebrow">FROM THE HIMALAYAS · NEPAL → THE WORLD</div>
      <h1>World Patro</h1>
      <h2>Global Time & Intelligence OS</h2>
      <p>Calendar truth, astronomical sacred time, public-source intelligence, evidence workflows and bounded AI — composed as one quiet command system.</p>
      <div className="ctaRow">
        <Link className="primary" href="/app">Enter Command Center</Link>
        <Link className="ghost" href="/app/wens">Explore WENS</Link>
        <Link className="ghost" href="/app/agents">Meet the Agents</Link>
        <Link className="ghost" href="/app/patro">Open 9 Calendars</Link>
      </div>
      <div className="landingOrbit" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
    </section>
    <section className="pillarGrid">
      {pillars.map(([label,title,description])=><article key={label}>
        <span>{label}</span><h3>{title}</h3><p>{description}</p>
      </article>)}
    </section>
    <footer className="landingFooter"><span>WORLD PATRO</span><span>FACT · AUTHORITY · ASTRONOMY · INTERPRETATION · WBGR-109 / WENS · SCENARIO · UNKNOWN</span></footer>
  </main>;
}
