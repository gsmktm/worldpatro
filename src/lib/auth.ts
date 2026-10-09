import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  if (!supabase) {
    return { supabase: null, userId: null, error: NextResponse.json({ error: "Supabase is not configured" }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId || typeof userId !== "string") {
    return { supabase, userId: null, error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  return { supabase, userId, error: null };
}
