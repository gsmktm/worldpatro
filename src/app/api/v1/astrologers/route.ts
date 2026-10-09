import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, astrologers: [] });
  const speciality = request.nextUrl.searchParams.get("speciality");
  let query = supabase.from("astrologers").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(100);
  if (speciality) query = query.contains("specialities", [speciality]);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ astrologers: data });
}
