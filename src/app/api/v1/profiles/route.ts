import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const BirthProfileInput = z.object({
  name: z.string().min(1).max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/).optional().nullable(),
  timezone: z.string().min(1).max(100).default("Asia/Kathmandu"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  elevationM: z.number().min(-500).max(10000).default(0),
  placeName: z.string().max(240).optional().nullable(),
  calculationSettings: z.record(z.string(), z.unknown()).default({})
});

export async function GET() {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase
    .from("birth_profiles")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const parsed = BirthProfileInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid birth profile", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;
  const { data, error } = await auth.supabase.from("birth_profiles").insert({
    user_id: auth.userId,
    name: v.name,
    birth_date: v.birthDate,
    birth_time: v.birthTime ?? null,
    timezone: v.timezone,
    lat: v.lat,
    lon: v.lon,
    elevation_m: v.elevationM,
    place_name: v.placeName ?? null,
    calculation_settings: v.calculationSettings
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data }, { status: 201 });
}
