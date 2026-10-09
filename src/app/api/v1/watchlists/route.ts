import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Watchlist = z.object({
  name: z.string().min(1).max(160),
  filters: z.record(z.string(), z.unknown()).default({}),
  delivery: z.record(z.string(), z.unknown()).default({}),
  enabled: z.boolean().default(true)
});

export async function GET() {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("watchlists").select("*").eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlists: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = Watchlist.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid watchlist", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await auth.supabase.from("watchlists").insert({ user_id: auth.userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlist: data }, { status: 201 });
}
