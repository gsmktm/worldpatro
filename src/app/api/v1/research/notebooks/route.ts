import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { listUserDocs, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

const Notebook = z.object({ title: z.string().min(1).max(180), description: z.string().max(2000).optional().nullable() });

export async function GET() {
  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ backend: "firebase", notebooks: await listUserDocs(user.uid, "researchNotebooks") });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("research_notebooks").select("*").eq("user_id", auth.userId).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", notebooks: data });
}

export async function POST(request: Request) {
  const parsed = Notebook.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notebook", issues: parsed.error.issues }, { status: 400 });

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const ref = await userCollection(user.uid, "researchNotebooks").add({ ...parsed.data, createdAt: serverNow(), updatedAt: serverNow() });
    return NextResponse.json({ backend: "firebase", notebook: { id: ref.id, ...parsed.data } }, { status: 201 });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.from("research_notebooks").insert({ user_id: auth.userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ backend: "supabase", notebook: data }, { status: 201 });
}
