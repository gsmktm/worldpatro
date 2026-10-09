"use client";

import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword
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
      const credential = mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      if (mode === "signup" && !credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
      }

      const idToken = await credential.user.getIdToken(true);
      await establishServerSession(idToken);
      window.location.assign("/app");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit}>
    <input name="email" type="email" placeholder="Email" required autoComplete="email"/>
    <input name="password" type="password" placeholder="Password" minLength={8} required autoComplete={mode === "signup" ? "new-password" : "current-password"}/>
    <button className="primaryBtn" disabled={busy}>{busy ? "Working…" : mode === "signup" ? "Create Firebase account" : "Sign in with Firebase"}</button>
    <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
      {mode === "login" ? "Create account" : "I already have an account"}
    </button>
    {message && <p className="error">{message}</p>}
  </form>;
}
