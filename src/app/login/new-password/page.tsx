import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Password · World Patro" };

export default async function NewPassword({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const client = await createClient();
  if (!client) redirect("/login?error=Authentication+is+not+configured");
  const {data:{user},error} = await client.auth.getUser();
  if (error || !user) redirect("/login?error=Open+a+valid+recovery+link+first");
  const q=await searchParams;
  return <main className="loginWrap"><section className="loginCard loginProviderCard">
    <div className="eyebrow">WORLD PATRO · SECURE ACCOUNT</div>
    <h1>Choose a new password</h1>
    <p className="muted">Create a unique password with at least 12 characters. Your account stays private.</p>
    {q.error&&<p className="error" role="alert">{q.error}</p>}
    <form className="loginFields" action={updatePassword}>
      <label htmlFor="new-password">New password</label>
      <input id="new-password" name="password" type="password" required autoComplete="new-password" minLength={12} maxLength={256}/>
      <label htmlFor="repeat-password">Repeat password</label>
      <input id="repeat-password" name="confirmPassword" type="password" required autoComplete="new-password" minLength={12} maxLength={256}/>
      <button className="primaryBtn" type="submit">Save new password</button>
    </form>
    <div className="loginPublicLink"><Link className="ghost" href="/app">Return to command center</Link></div>
  </section></main>;
}
