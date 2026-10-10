import Link from "next/link";
import { requestPasswordReset } from "../actions";
export const metadata = { title: "Recover Account · World Patro" };
export default async function RecoverAccount({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}) {
  const q = await searchParams;
  return <main className="loginWrap"><section className="loginCard loginProviderCard">
    <div className="eyebrow">WORLD PATRO · ACCOUNT RECOVERY</div>
    <h1>Reset your password</h1>
    <p className="muted">Enter your Supabase account email. We will send a recovery link if the account exists.</p>
    {q.error&&<p className="error" role="alert">{q.error}</p>}
    {q.message&&<p className="loginFeedback" role="status">{q.message}</p>}
    <form className="loginFields" action={requestPasswordReset}>
      <label htmlFor="recovery-email">Email address</label>
      <input id="recovery-email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com"/>
      <button className="primaryBtn" type="submit">Send recovery link</button>
    </form>
    <div className="loginPublicLink"><Link className="ghost" href="/login">← Back to sign in</Link></div>
  </section></main>;
}
