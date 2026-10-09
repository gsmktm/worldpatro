import Link from "next/link";

export default function Landing() {
  return <main className="landing">
    <div className="landingInner">
      <div className="eyebrow">NEPAL → THE WORLD · TIME CONNECTS HUMANITY</div>
      <div className="landingOm">ॐ</div>
      <h1>World Patro</h1>
      <h2>Global Calendar, Astrology & World Intelligence OS</h2>
      <p>Nine calendar systems, astronomical sacred time, provenance-first public world data, research, alerts, workflows and the WBE-9 symbolic balance ecosystem — one command center with clear boundaries between fact and interpretation.</p>
      <div className="ctaRow"><Link className="primary" href="/app">Open Command Center</Link><Link className="ghost" href="/app/patro">9 Calendars</Link><Link className="ghost" href="/app/wbe">WBE-9</Link></div>
    </div>
  </main>;
}
