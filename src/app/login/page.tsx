import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";
import { login, signup } from "./actions";

export const dynamic = "force-dynamic";

function SupabaseLogin({ error, message }: { error?: string; message?: string }) {
  return <div className="loginProviderForm">
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="loginFeedback" role="status">{message}</p>}
    <form className="loginFields">
      <label htmlFor="supabase-email">Email address</label>
      <input id="supabase-email" name="email" type="email" placeholder="you@example.com" required maxLength={254} autoComplete="email" />
      <label htmlFor="supabase-password">Password</label>
      <input id="supabase-password" name="password" type="password" required minLength={8} autoComplete="current-password" />
      <p className="loginInputHelp">New accounts require a password with at least 12 characters.</p>
      <div className="loginFormActions">
        <button type="submit" className="primaryBtn" formAction={login}>Sign in</button>
        <button type="submit" className="ghost" formAction={signup}>Create account</button>
      </div>
    </form>
    <div className="loginUtilities"><Link href="/login/recovery">Forgot password?</Link><Link href="/app/system">Platform status ↗</Link></div>
    <p className="loginFootnote">Powered by Supabase Authentication. New accounts may require email confirmation. Account data access is protected by row-level security once the database policies are activated.</p>
  </div>;
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const q = await searchParams;
  const supabaseReady = isSupabaseConfigured();

  return <main className="loginWrap"><section className="loginCard loginProviderCard">
    <div className="eyebrow">WORLD PATRO ACCOUNT · SUPABASE</div>
    <h1>Sign in</h1>
    <p className="muted">One account · Supabase Authentication · secure server-side session</p>
    {supabaseReady
      ? <SupabaseLogin error={q.error} message={q.message} />
      : <p className="error" role="alert">Supabase authentication is not configured on this deployment. Configure the project URL and publishable key in Vercel and redeploy. Public World Patro features remain available.</p>}
    <div className="loginPublicLink"><Link className="ghost" href="/app">Continue to public command center</Link></div>
  </section></main>;
}
