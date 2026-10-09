import Link from "next/link";
import FirebaseLoginForm from "@/components/firebase-login-form";
import { isFirebaseClientConfigured } from "@/lib/firebase/config";
import { isSupabaseConfigured } from "@/lib/env";
import { login, signup } from "./actions";

export default async function Login({ searchParams }: { searchParams: Promise<{error?:string;message?:string}> }) {
  const q = await searchParams;
  const firebaseReady = isFirebaseClientConfigured();
  const supabaseReady = isSupabaseConfigured();

  return <main className="loginWrap"><section className="loginCard">
    <div className="eyebrow">WORLD PATRO ACCOUNT</div>
    <h1>Sign in</h1>

    {firebaseReady ? <>
      <p className="muted">Firebase Authentication · secure server session cookie</p>
      <FirebaseLoginForm/>
    </> : supabaseReady ? <>
      {q.error && <p className="error">{q.error}</p>}
      {q.message && <p>{q.message}</p>}
      <form>
        <input name="email" type="email" placeholder="Email" required autoComplete="email"/>
        <input name="password" type="password" placeholder="Password" required minLength={8} autoComplete="current-password"/>
        <button className="primaryBtn" formAction={login}>Sign in</button>
        <button formAction={signup}>Create account</button>
      </form>
    </> : <p className="error">No authenticated backend is configured yet. Public World Patro features remain available.</p>}

    <div style={{marginTop:16}}><Link className="ghost" href="/app">Continue to public command center</Link></div>
  </section></main>;
}
