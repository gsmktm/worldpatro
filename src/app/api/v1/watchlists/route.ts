import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

const Watchlist = z.object({
  name: z.string().min(1).max(160),
  filters: z.record(z.string(), z.unknown()).default({}),
  delivery: z.record(z.string(), z.unknown()).default({}),
  enabled: z.boolean().default(true)
});

export async function GET() {
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ backend: "firebase", watchlists: await listUserDocs(user.uid, "watchlists") });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("watchlists").select("*").eq("user_id", auth.userId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", watchlists: data });
}

export async function POST(request: Request) {
  const parsed = Watchlist.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid watchlist", issues: parsed.error.issues }, { status: 400 });

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const ref = await userCollection(user.uid, "watchlists").add({ ...parsed.data, createdAt: serverNow(), updatedAt: serverNow() });
    return NextResponse.json({ backend: "firebase", watchlist: { id: ref.id, ...parsed.data } }, { status: 201 });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("watchlists").insert({ user_id: auth.userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", watchlist: data }, { status: 201 });
}
