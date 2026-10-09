"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData:FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase+is+not+configured");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({email,password});
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/app");
}

export async function signup(formData:FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase+is+not+configured");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signUp({email,password});
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
