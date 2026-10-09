import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, observances: [] });
  const q = request.nextUrl.searchParams;
  let query = supabase.from("religious_observances").select("*, source_registry(name,url,tier)").order("starts_at", { ascending: true }).limit(250);
  const tradition = q.get("tradition");
  const jurisdiction = q.get("jurisdiction");
  const from = q.get("from");
  const to = q.get("to");
  if (tradition) query = query.eq("tradition", tradition);
  if (jurisdiction) query = query.eq("jurisdiction", jurisdiction);
  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lte("starts_at", to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, observances: data });
}
