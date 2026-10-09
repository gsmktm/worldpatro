import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const Consultation = z.object({
  astrologerId: z.string().uuid().optional().nullable(),
  mode: z.enum(["chat","call","video","in_person"]),
  topic: z.string().min(2).max(1000),
  scheduledAt: z.string().datetime().optional().nullable(),
  consentRecording: z.boolean().default(false)
});

export async function GET() {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("consultations").select("*, astrologers(name,slug)").eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ consultations: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = Consultation.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid consultation", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;
  const { data, error } = await auth.supabase.from("consultations").insert({
    user_id: auth.userId, astrologer_id: v.astrologerId ?? null, mode: v.mode, topic: v.topic,
    scheduled_at: v.scheduledAt ?? null, consent_recording: v.consentRecording, status: "requested"
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ consultation: data }, { status: 201 });
}
