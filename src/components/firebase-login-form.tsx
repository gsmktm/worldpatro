"use client";

import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  inMemoryPersistence,
  setPersistence,
  signOut
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

async function establishServerSession(idToken: string) {
  const response = await fetch("/api/auth/firebase-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Could not create server session.");
  }
}

export default function FirebaseLoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const auth = getFirebaseAuth();
      // Server httpOnly cookie owns the session; do not persist a parallel browser login.
      await setPersistence(auth, inMemoryPersistence);
      const credential = mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      if (mode === "signup" && !credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
      }

      const idToken = await credential.user.getIdToken(true);
      await establishServerSession(idToken);
      await signOut(auth);
      window.location.assign("/app");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="loginFields" onSubmit={submit}>
    <label htmlFor="firebase-email">Email address</label>
    <input id="firebase-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email"/>
    <label htmlFor="firebase-password">Password</label>
    <input id="firebase-password" name="password" type="password" placeholder="Password" minLength={8} required autoComplete={mode === "signup" ? "new-password" : "current-password"}/>
    <div className="loginFormActions">
      <button className="primaryBtn" disabled={busy}>{busy ? "Working…" : mode === "signup" ? "Create Firebase account" : "Sign in with Firebase"}</button>
      <button type="button" className="ghost" disabled={busy} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Create account" : "I already have an account"}
      </button>
    </div>
    {message && <p className="error" role="alert">{message}</p>}
  </form>;
}
