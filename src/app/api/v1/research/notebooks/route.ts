import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Notebook = z.object({ title: z.string().min(1).max(180), description: z.string().max(2000).optional().nullable() });

export async function GET() {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("research_notebooks").select("*").eq("user_id", auth.userId).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notebooks: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = Notebook.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notebook", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await auth.supabase.from("research_notebooks").insert({ user_id: auth.userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notebook: data }, { status: 201 });
}
