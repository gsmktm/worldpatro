"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { firebaseClientConfigured, getFirebaseAuth } from "@/lib/firebase/client";

export default function Login() {
  const configured = firebaseClientConfigured();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setMessage("");

    try {
      const auth = getFirebaseAuth();
      if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/app";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="loginWrap">
    <section className="loginCard">
      <div className="eyebrow">WORLD PATRO · FIREBASE AUTH</div>
      <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
      {!configured && <p className="error">Firebase Web configuration is not connected yet. The public command center remains available.</p>}
      {message && <p className="error">{message}</p>}
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="Email" required autoComplete="email"/>
        <input name="password" type="password" placeholder="Password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"}/>
        <button className="primaryBtn" type="submit" disabled={!configured || busy}>{busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <button style={{marginTop:10,width:"100%"}} onClick={()=>setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Create a new account" : "I already have an account"}
      </button>
      <div style={{marginTop:16}}><Link className="ghost" href="/app">Continue to public command center</Link></div>
    </section>
  </main>;
}
