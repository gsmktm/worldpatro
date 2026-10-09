import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createOwned, listOwned } from "@/lib/firebase/repository";

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
  const { auth, error } = await requireUser();
  if (error || !auth) return error!;
  if (auth.provider === "firebase") return NextResponse.json({ profiles: await listOwned("birthProfiles", auth.userId) });

  const { data, error: dbError } = await auth.supabase!.from("birth_profiles").select("*").eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ profiles: data });
}

export async function POST(request: Request) {
  const { auth, error } = await requireUser();
  if (error || !auth) return error!;
  const parsed = BirthProfileInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid birth profile", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;

  if (auth.provider === "firebase") {
    const profile = await createOwned("birthProfiles", auth.userId, {
      name:v.name,birthDate:v.birthDate,birthTime:v.birthTime??null,timezone:v.timezone,
      lat:v.lat,lon:v.lon,elevationM:v.elevationM,placeName:v.placeName??null,calculationSettings:v.calculationSettings
    });
    return NextResponse.json({ profile }, { status: 201 });
  }

  const { data, error: dbError } = await auth.supabase!.from("birth_profiles").insert({
    user_id:auth.userId,name:v.name,birth_date:v.birthDate,birth_time:v.birthTime??null,timezone:v.timezone,
    lat:v.lat,lon:v.lon,elevation_m:v.elevationM,place_name:v.placeName??null,calculation_settings:v.calculationSettings
  }).select().single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ profile:data }, { status:201 });
}
