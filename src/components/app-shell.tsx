"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FEATURES } from "@/lib/features";

const groups = [
  { label: "TIME", slugs: ["patro","panchang","astrology","kundli","muhurat","numerology","religions"] },
  { label: "INTELLIGENCE", slugs: ["world","research","sources","alerts"] },
  { label: "BALANCE", slugs: ["wens","wbe","gates"] },
  { label: "OPERATIONS", slugs: ["agents","workflows","admin","privacy","consult","learn"] }
];

export function AppShell({ children }:{ children:React.ReactNode }) {
  const pathname = usePathname();
  return <div className="os">
    <a className="skipToContent" href="#world-patro-main">Skip to main content</a>
    <aside className="side">
      <Link href="/" className="brand" aria-label="World Patro home">
        <span>ॐ</span>
        <strong>World Patro</strong>
        <small>NEPAL → THE WORLD</small>
      </Link>

      <Link href="/app" className="commandNav" aria-current={pathname==="/app"?"page":undefined}>
        <span>⌘</span>
        <b>Command Center</b>
        <small>One moment · whole system</small>
      </Link>

      <Link href="/app/system" className="workSystemNav" aria-current={pathname==="/app/system"?"page":undefined}>◎ All 20 modules · System status →</Link>
      <nav className="sideNav" aria-label="World Patro modules">
        {groups.map(group => <div className="navGroup" key={group.label}>
          <div className="navLabel">{group.label}</div>
          {group.slugs.map(slug => {
            const feature = FEATURES.find(item => item.slug === slug);
            return feature ? <Link key={slug} href={`/app/${slug}`} className="navItem" aria-current={pathname===`/app/${slug}`?"page":undefined}>
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
          <Link href="/app/system" className="topChip" aria-current={pathname==="/app/system"?"page":undefined}>All modules</Link>
          <Link href="/app/wens" className="topChip gold" aria-current={pathname==="/app/wens"?"page":undefined}>◈ WENS</Link>
          <Link href="/app/agents" className="topChip" aria-current={pathname==="/app/agents"?"page":undefined}>✦ Agents</Link>
          <Link href="/login" className="avatarButton" aria-label="Account">G</Link>
        </div>
      </header>
      <main id="world-patro-main" tabIndex={-1} className="workspace">{children}</main>
      <nav className="mobileDock" aria-label="Mobile navigation">
        <Link href="/app" aria-current={pathname==="/app"?"page":undefined}>⌘<small>Home</small></Link>
        <Link href="/app/patro" aria-current={pathname==="/app/patro"?"page":undefined}>◫<small>Patro</small></Link>
        <Link href="/app/agents" aria-current={pathname==="/app/agents"?"page":undefined}>✦<small>Agents</small></Link>
        <Link href="/app/research" aria-current={pathname==="/app/research"?"page":undefined}>⌕<small>Research</small></Link>
        <Link href="/login">◎<small>Account</small></Link>
      </nav>
    </div>
  </div>;
}
