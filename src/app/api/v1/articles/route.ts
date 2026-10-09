import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ configured: false, articles: [] });
  const q = request.nextUrl.searchParams;
  const slug = q.get("slug");
  let query = supabase.from("articles").select("id,slug,title,title_ne,excerpt,content,category,tags,author,published_at").eq("is_published", true);
  if (slug) query = query.eq("slug", slug).limit(1);
  else query = query.order("published_at", { ascending: false }).limit(100);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data });
}
