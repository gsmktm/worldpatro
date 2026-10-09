import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Item = z.object({
  notebookId: z.string().uuid(),
  kind: z.string().min(1).max(80),
  refId: z.string().max(240).optional().nullable(),
  note: z.string().max(8000).optional().nullable(),
  payload: z.record(z.string(), z.unknown()).default({})
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const notebookId = new URL(request.url).searchParams.get("notebookId");
  if (!notebookId) return NextResponse.json({ error: "notebookId is required" }, { status: 400 });
  const { data, error } = await auth.supabase.from("research_items").select("*").eq("notebook_id", notebookId).eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = Item.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid research item", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;
  const { data, error } = await auth.supabase.from("research_items").insert({
    notebook_id: v.notebookId, user_id: auth.userId, kind: v.kind, ref_id: v.refId ?? null, note: v.note ?? null, payload: v.payload
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}
