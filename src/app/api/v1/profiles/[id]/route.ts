import { NextResponse } from "next/server";
import { z } from "zod";
import { readMutationJson, requireSameOrigin } from "@/lib/http/write-guard";
import { requireUser } from "@/lib/auth";

const UpdateProfile = z.object({
  name: z.string().min(1).max(120).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birthTime: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/).nullable().optional(),
  timezone: z.string().min(1).max(100).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  elevationM: z.number().min(-500).max(10000).optional(),
  placeName: z.string().max(240).nullable().optional(),
  calculationSettings: z.record(z.string(), z.unknown()).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readMutationJson(request, 8192);
  if (!body.ok) return body.response;
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid birth profile ID" }, { status: 400 });
  const parsed = UpdateProfile.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile update", issues: parsed.error.issues }, { status: 400 });
  if (!Object.keys(parsed.data).length)
    return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const v = parsed.data;
  const patch: Record<string, unknown> = {};
  if (v.name !== undefined) patch.name = v.name;
  if (v.birthDate !== undefined) patch.birth_date = v.birthDate;
  if (v.birthTime !== undefined) patch.birth_time = v.birthTime;
  if (v.timezone !== undefined) patch.timezone = v.timezone;
  if (v.lat !== undefined) patch.lat = v.lat;
  if (v.lon !== undefined) patch.lon = v.lon;
  if (v.elevationM !== undefined) patch.elevation_m = v.elevationM;
  if (v.placeName !== undefined) patch.place_name = v.placeName;
  if (v.calculationSettings !== undefined) patch.calculation_settings = v.calculationSettings;
  const { data, error } = await auth.supabase.from("birth_profiles").update(patch).eq("id", id).eq("user_id", auth.userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid birth profile ID" }, { status: 400 });
  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("birth_profiles")
    .delete().eq("id", id).eq("user_id", auth.userId).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Profile deletion unavailable" }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
