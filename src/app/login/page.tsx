import Link from "next/link";
import FirebaseLoginForm from "@/components/firebase-login-form";
import { isFirebaseAdminConfigured, isFirebaseClientConfigured } from "@/lib/firebase/config";
import { isSupabaseConfigured } from "@/lib/env";
import { login, signup } from "./actions";

function SupabaseLogin({ error, message }: { error?: string; message?: string }) {
  return <div className="loginProviderForm">
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="loginFeedback" role="status">{message}</p>}
    <form className="loginFields">
      <label htmlFor="supabase-email">Email address</label>
      <input id="supabase-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
      <label htmlFor="supabase-password">Password</label>
      <input id="supabase-password" name="password" type="password" required minLength={8} autoComplete="current-password" />
      <div className="loginFormActions">
        <button className="primaryBtn" formAction={login}>Sign in with Supabase</button>
        <button className="ghost" formAction={signup}>Create Supabase account</button>
      </div>
    </form>
    <p className="loginFootnote">Supabase sign-in depends on the selected project's Auth configuration. Account-owned features also require the World Patro database schema and row-level security policies.</p>
  </div>;
}

export default async function Login({ searchParams }: { searchParams: Promise<{error?:string;message?:string}> }) {
  const q = await searchParams;
  const firebaseClientReady = isFirebaseClientConfigured();
  const firebaseAdminReady = isFirebaseAdminConfigured();
  const firebaseReady = firebaseClientReady && firebaseAdminReady;
  const supabaseReady = isSupabaseConfigured();

  return <main className="loginWrap"><section className="loginCard loginProviderCard">
    <div className="eyebrow">WORLD PATRO ACCOUNT</div>
    <h1>Sign in</h1>
    {firebaseReady ? <>
      <p className="muted">Firebase Authentication · verified server session cookie</p>
      <FirebaseLoginForm />
    </> : <>
      {firebaseClientReady && <div className="loginProviderNotice" role="status">
        <strong>Firebase sign-in needs server setup</strong>
        <p>Firebase Web is configured, but Firebase Admin server sessions are not available. Set the server-only <code>FIREBASE_SERVICE_ACCOUNT_JSON_BASE64</code> environment variable in Vercel for the matching Firebase project, then redeploy.</p>
        <p>Never paste the service-account JSON or private key into a chat, GitHub, or any <code>NEXT_PUBLIC_</code> variable.</p>
      </div>}
      {supabaseReady ? firebaseClientReady ? <details className="loginAlternate" open>
        <summary>Alternative · use a separate Supabase account</summary>
        <p className="loginProviderWarning">Firebase and Supabase are different identity providers. An existing Firebase account is not automatically a Supabase account; signing in here does not activate Firebase sessions or migrate stored records.</p>
        <SupabaseLogin error={q.error} message={q.message} />
      </details> : <>
        <p className="muted">Supabase Authentication · secure server-side session</p>
        <SupabaseLogin error={q.error} message={q.message} />
      </> : !firebaseClientReady && <p className="error">No authenticated backend is configured yet. Public World Patro features remain available.</p>}
    </>}
    <div className="loginPublicLink"><Link className="ghost" href="/app">Continue to public command center</Link></div>
  </section></main>;
}
