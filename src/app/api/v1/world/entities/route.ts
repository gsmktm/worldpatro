import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, entities: [] });
  const q = request.nextUrl.searchParams;
  let query = supabase.from("entities").select("*").order("canonical_name").limit(250);
  const type = q.get("type");
  const country = q.get("country");
  const search = q.get("q");
  if (type) query = query.eq("entity_type", type);
  if (country) query = query.eq("country_code", country.toUpperCase());
  if (search) query = query.ilike("canonical_name", `%${search.replaceAll("%","")}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entities: data });
}
