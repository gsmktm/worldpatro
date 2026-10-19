"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN = "/login";

function validEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  return email.length <= 254 && emailPattern.test(email) ? email : null;
}

function validPassword(value: FormDataEntryValue | null, minimum = 8): string | null {
  return typeof value === "string" && value.length >= minimum && value.length <= 256 ? value : null;
}

function authRedirect(message: string, kind: "error" | "message" = "error"): never {
  redirect(`${LOGIN}?${kind}=${encodeURIComponent(message)}`);
}

function publicSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://worldpatro.vercel.app";
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return "https://worldpatro.vercel.app";
    return url.origin;
  } catch {
    return "https://worldpatro.vercel.app";
  }
}

export async function login(formData: FormData) {
  const email = validEmail(formData.get("email"));
  const password = validPassword(formData.get("password"));
  if (!email || !password) authRedirect("Enter a valid email and password.");
  const supabase = await createClient();
  if (!supabase) authRedirect("Authentication is not configured.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authRedirect("Sign-in failed. Check your credentials or confirm your email.");
  redirect("/app/account");
}

export async function signup(formData: FormData) {
  const email = validEmail(formData.get("email"));
  const password = validPassword(formData.get("password"), 12);
  if (!email || !password) authRedirect("Use a valid email and a password of at least 12 characters.");
  const supabase = await createClient();
  if (!supabase) authRedirect("Authentication is not configured.");
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { emailRedirectTo: publicSiteUrl() + "/auth/confirm" }
  });
  if (error) authRedirect("Account registration could not be completed. Try again later.");
  if (data.session) redirect("/app/account");
  authRedirect("If registration is available, check your email for a confirmation link.", "message");
}

export async function requestPasswordReset(formData: FormData) {
  const email = validEmail(formData.get("email"));
  if (!email) redirect("/login/recovery?error=Enter+a+valid+email+address");
  const supabase = await createClient();
  if (supabase) {
    // Keep the response neutral about whether the email address exists.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: publicSiteUrl() + "/auth/confirm?next=%2Flogin%2Fnew-password"
    });
  }
  redirect("/login/recovery?message=If+this+account+exists%2C+check+your+email+for+a+reset+link");
}

export async function updatePassword(formData: FormData) {
  const password = validPassword(formData.get("password"), 12);
  const confirm = formData.get("confirmPassword");
  if (!password || password !== confirm) {
    redirect("/login/new-password?error=Passwords+must+match+and+contain+at+least+12+characters");
  }
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Authentication+is+not+configured");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?error=Your+password+reset+link+is+invalid+or+expired");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/login/new-password?error=Could+not+update+password");
  await supabase.auth.signOut();
  redirect("/login?message=Password+updated.+Sign+in+with+your+new+password");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login?message=You+have+signed+out");
}
