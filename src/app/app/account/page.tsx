import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account · World Patro" };

export default async function Account() {
  const client = await createClient();
  const { data: { user }, error } = client ? await client.auth.getUser() : { data: { user: null }, error: null };
  if (!user || error) return <section className="accountPage">
    <div className="accountHero"><div className="eyebrow">WORLD PATRO · ACCOUNT</div><h1>Your World Patro account</h1>
      <p>Sign in securely with Supabase to save personal reports and manage account-owned workspaces.</p>
      <div className="accountActions"><Link className="primaryBtn" href="/login">Sign in or create account</Link><Link className="ghost" href="/app/system">View system status</Link></div>
      <p className="accountFootnote">A configured database does not guarantee that registration, private tables or migrations are active. Check system status before entering sensitive records.</p>
    </div>
  </section>;
  return <section className="accountPage">
    <div className="accountHero"><div className="eyebrow">WORLD PATRO · VERIFIED SESSION</div><h1>My account</h1>
      <p>Your Supabase session is verified with the authentication provider. Manage access and personal workspaces from one place.</p>
      <div className="accountIdentity"><span className="accountAvatar" aria-hidden="true">◎</span><div><strong>{user.email||"Verified Supabase user"}</strong><small>Account ID: {user.id.slice(0,8)}… · Provider: Supabase Auth</small></div></div>
      <div className="accountActions"><Link className="primaryBtn" href="/app/privacy">Privacy & export</Link><Link className="ghost" href="/app/research">Research workspace</Link><Link className="ghost" href="/app/system">System status</Link></div>
      <form action={logout} className="accountSignout"><button className="ghost" type="submit">Sign out securely</button></form>
    </div>
    <div className="accountQuickGrid"><article><h2>Personal reports</h2><p>Saved calculations belong to your authenticated identity.</p><Link href="/app/kundli">Open Kundli Studio →</Link></article>
    <article><h2>Research & evidence</h2><p>Manage notebooks, sources and verified claims with owner-only storage.</p><Link href="/app/research">Open workspace →</Link></article>
    <article><h2>Workflow operations</h2><p>Track requests and review work in the private workflow area.</p><Link href="/app/workflows">Open workflows →</Link></article></div>
  </section>;
}
