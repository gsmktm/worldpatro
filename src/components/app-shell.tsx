import Link from "next/link";
import { FEATURES } from "@/lib/features";

export function AppShell({ children }:{ children:React.ReactNode }) {
  return <div className="os">
    <aside className="side">
      <Link href="/" className="brand"><span>ॐ</span><strong>World Patro</strong><small>GLOBAL OS</small></Link>
      <nav className="sideNav">
        <Link href="/app" className="navItem">⌘ Command Center</Link>
        {FEATURES.map(f => <Link key={f.slug} href={`/app/${f.slug}`} className="navItem">{f.title}</Link>)}
      </nav>
      <div className="sideFooter"><span className="dot live"/> Source-aware · Variant-aware</div>
    </aside>
    <div className="osMain">
      <header className="topbar">
        <div><strong>World Patro</strong><span className="muted"> · Global Calendar, Astrology & World Intelligence OS</span></div>
        <div className="topActions"><Link href="/login" className="ghost">Account</Link><a href="/api/v1/health" className="ghost">API</a></div>
      </header>
      <main className="workspace">{children}</main>
    </div>
  </div>;
}
