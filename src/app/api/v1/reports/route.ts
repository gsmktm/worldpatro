import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const ReportInput = z.object({
  kind: z.enum(["kundli","panchang","muhurat","compatibility","wbe","country","research"]),
  title: z.string().min(1).max(180),
  requestContext: z.record(z.string(), z.unknown()).default({}),
  result: z.record(z.string(), z.unknown()),
  calculationVersion: z.record(z.string(), z.unknown()).default({})
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  let query = auth.supabase.from("saved_reports").select("*").eq("user_id", auth.userId);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = ReportInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid report", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;
  const { data, error } = await auth.supabase.from("saved_reports").insert({
    user_id: auth.userId,
    kind: v.kind,
    title: v.title,
    request_context: v.requestContext,
    result: v.result,
    calculation_version: v.calculationVersion
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ report: data }, { status: 201 });
}
