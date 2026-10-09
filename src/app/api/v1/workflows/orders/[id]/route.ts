import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Transition = z.object({
  status: z.enum(["draft","review","approved","assigned","active","verify","closed","archived","cancelled"]),
  payload: z.record(z.string(), z.unknown()).default({})
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { id } = await params;
  const parsed = Transition.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid transition", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await auth.supabase.rpc("transition_workflow_order", {
    p_order_id: id,
    p_to_status: parsed.data.status,
    p_payload: parsed.data.payload
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data });
}
