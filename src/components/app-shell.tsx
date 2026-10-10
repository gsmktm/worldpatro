import Link from "next/link";
import { FEATURES } from "@/lib/features";

const groups = [
  { label: "TIME", slugs: ["patro","panchang","astrology","kundli","muhurat","numerology","religions"] },
  { label: "INTELLIGENCE", slugs: ["world","research","sources","alerts"] },
  { label: "BALANCE", slugs: ["wens","wbe","gates"] },
  { label: "OPERATIONS", slugs: ["agents","workflows","admin","privacy","consult","learn"] }
];

export function AppShell({ children }:{ children:React.ReactNode }) {
  return <div className="os">
    <aside className="side">
      <Link href="/" className="brand" aria-label="World Patro home">
        <span>ॐ</span>
        <strong>World Patro</strong>
        <small>NEPAL → THE WORLD</small>
      </Link>

      <Link href="/app" className="commandNav">
        <span>⌘</span>
        <b>Command Center</b>
        <small>One moment · whole system</small>
      </Link>

      <Link href="/app/system" className="workSystemNav">◎ All 20 modules · System status →</Link>
      <nav className="sideNav" aria-label="World Patro modules">
        {groups.map(group => <div className="navGroup" key={group.label}>
          <div className="navLabel">{group.label}</div>
          {group.slugs.map(slug => {
            const feature = FEATURES.find(item => item.slug === slug);
            return feature ? <Link key={slug} href={`/app/${slug}`} className="navItem">
              <span className="navDot"/>
              <span>{feature.title}</span>
            </Link> : null;
          })}
        </div>)}
      </nav>

      <div className="sideFooter">
        <div><span className="dot live"/> Production architecture</div>
        <small>Method · source · version · boundary</small>
      </div>
    </aside>

    <div className="osMain">
      <header className="topbar">
        <div className="topIdentity">
          <strong>World Patro</strong>
          <span>Global Time & Intelligence OS</span>
        </div>
        <div className="topContext">
          <span className="topChip">🇳🇵 Kathmandu</span>
          <span className="topChip">Asia/Kathmandu</span>
          <Link href="/app/system" className="topChip">All modules</Link>
          <Link href="/app/wens" className="topChip gold">◈ WENS</Link>
          <Link href="/app/agents" className="topChip">✦ Agents</Link>
          <Link href="/login" className="avatarButton" aria-label="Account">G</Link>
        </div>
      </header>
      <main className="workspace">{children}</main>
      <nav className="mobileDock" aria-label="Mobile navigation">
        <Link href="/app">⌘<small>Home</small></Link>
        <Link href="/app/patro">◫<small>Patro</small></Link>
        <Link href="/app/agents">✦<small>Agents</small></Link>
        <Link href="/app/research">⌕<small>Research</small></Link>
        <Link href="/login">◎<small>Account</small></Link>
      </nav>
    </div>
  </div>;
}
