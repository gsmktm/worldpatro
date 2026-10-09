import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, claims: [] });
  const q = request.nextUrl.searchParams;
  let query = supabase.from("claims").select("*, evidence(*, source_registry(name,url,tier,publisher))").order("created_at", { ascending: false }).limit(100);
  const entityId = q.get("entityId");
  const state = q.get("state");
  const type = q.get("type");
  if (entityId) query = query.eq("subject_entity_id", entityId);
  if (state) query = query.eq("verification_state", state);
  if (type) query = query.eq("claim_type", type);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ claims: data });
}
