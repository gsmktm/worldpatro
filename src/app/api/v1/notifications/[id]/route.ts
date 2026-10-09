import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Patch = z.object({ read: z.boolean().optional(), acknowledged: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { id } = await params;
  const parsed = Patch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification update" }, { status: 400 });
  const patch: Record<string, string | null> = {};
  if (parsed.data.read !== undefined) patch.read_at = parsed.data.read ? new Date().toISOString() : null;
  if (parsed.data.acknowledged !== undefined) patch.acknowledged_at = parsed.data.acknowledged ? new Date().toISOString() : null;
  const { data, error } = await auth.supabase.from("notifications").update(patch).eq("id", id).eq("user_id", auth.userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data });
}
