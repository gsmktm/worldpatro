import { NextResponse } from "next/server";
import { readMutationJson } from "@/lib/http/write-guard";
import { z } from "zod";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { useFirebaseBackend } from "@/lib/firebase/config";
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
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ backend: "firebase", profiles: await listUserDocs(user.uid, "birthProfiles") });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("birth_profiles").select("*").eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", profiles: data });
}

export async function POST(request: Request) {
  const body = await readMutationJson(request, 16384);
  if (!body.ok) return body.response;
  const parsed = BirthProfileInput.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid birth profile", issues: parsed.error.issues }, { status: 400 });
  const v = parsed.data;

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const ref = await userCollection(user.uid, "birthProfiles").add({
      name: v.name, birthDate: v.birthDate, birthTime: v.birthTime ?? null, timezone: v.timezone,
      lat: v.lat, lon: v.lon, elevationM: v.elevationM, placeName: v.placeName ?? null,
      calculationSettings: v.calculationSettings, createdAt: serverNow(), updatedAt: serverNow()
    });
    return NextResponse.json({ backend: "firebase", profile: { id: ref.id, ...v } }, { status: 201 });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("birth_profiles").insert({
    user_id: auth.userId, name: v.name, birth_date: v.birthDate, birth_time: v.birthTime ?? null,
    timezone: v.timezone, lat: v.lat, lon: v.lon, elevation_m: v.elevationM,
    place_name: v.placeName ?? null, calculation_settings: v.calculationSettings
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", profile: data }, { status: 201 });
}
