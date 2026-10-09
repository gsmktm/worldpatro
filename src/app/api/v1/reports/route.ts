import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

const ReportInput = z.object({
  kind: z.enum(["kundli","panchang","muhurat","compatibility","wbe","country","research"]),
  title: z.string().min(1).max(180),
  requestContext: z.record(z.string(), z.unknown()).default({}),
  result: z.record(z.string(), z.unknown()),
  calculationVersion: z.record(z.string(), z.unknown()).default({})
});

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind");

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const reports = (await listUserDocs(user.uid, "reports")).filter(r => !kind || r.kind === kind);
    return NextResponse.json({ backend: "firebase", reports });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  let query = auth.supabase.from("saved_reports").select("*").eq("user_id", auth.userId);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", reports: data });
}

export async function POST(request: Request) {
  const parsed = ReportInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid report", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const ref = await userCollection(user.uid, "reports").add({
      ...v, createdAt: serverNow()
    });
    return NextResponse.json({ backend: "firebase", report: { id: ref.id, ...v } }, { status: 201 });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("saved_reports").insert({
    user_id: auth.userId, kind: v.kind, title: v.title, request_context: v.requestContext,
    result: v.result, calculation_version: v.calculationVersion
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", report: data }, { status: 201 });
}
