import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, events: [] });
  const q = request.nextUrl.searchParams;
  let query = supabase.from("events").select("*").order("starts_at", { ascending: false }).limit(250);
  const country = q.get("country");
  const type = q.get("type");
  const from = q.get("from");
  const to = q.get("to");
  if (country) query = query.eq("country_code", country.toUpperCase());
  if (type) query = query.eq("event_type", type);
  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lte("starts_at", to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}
