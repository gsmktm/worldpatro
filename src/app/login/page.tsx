import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";
import { login, signup } from "./actions";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}) {
  const q = await searchParams;
  const configured = isSupabaseConfigured();
  return <main className="loginWrap"><section className="loginCard">
    <div className="eyebrow">WORLD PATRO ACCOUNT</div><h1>Sign in</h1>
    {!configured && <p className="error">Supabase environment variables are not connected yet. The public command center remains available.</p>}
    {q.error && <p className="error">{q.error}</p>}{q.message && <p>{q.message}</p>}
    <form>
      <input name="email" type="email" placeholder="Email" required autoComplete="email"/>
      <input name="password" type="password" placeholder="Password" required minLength={8} autoComplete="current-password"/>
      <button className="primaryBtn" formAction={login} disabled={!configured}>Sign in</button>
      <button formAction={signup} disabled={!configured}>Create account</button>
    </form>
    <div style={{marginTop:16}}><Link className="ghost" href="/app">Continue to public command center</Link></div>
  </section></main>;
}
