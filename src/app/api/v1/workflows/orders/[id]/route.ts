import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { firestoreDb, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";

const Transition = z.object({
  status: z.enum(["draft","review","approved","assigned","active","verify","closed","archived","cancelled"]),
  payload: z.record(z.string(), z.unknown()).default({})
});

const NEXT: Record<string, string[]> = {
  draft:["review","cancelled"], review:["draft","approved","cancelled"], approved:["assigned","cancelled"],
  assigned:["active","cancelled"], active:["verify","cancelled"], verify:["active","closed"], closed:["archived"]
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Transition.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid transition", issues: parsed.error.issues }, { status: 400 });

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const db = firestoreDb();
    const ref = userCollection(user.uid, "workflowOrders").doc(id);
    let fromStatus = "";

    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("Workflow order not found.");
        fromStatus = String(snap.data()?.status || "");
        if (!(NEXT[fromStatus] || []).includes(parsed.data.status)) {
          throw new Error(`Invalid workflow transition: ${fromStatus} → ${parsed.data.status}`);
        }
        tx.update(ref, { status: parsed.data.status, approvalState: parsed.data.payload, updatedAt: serverNow() });
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Transition failed" }, { status: 400 });
    }

    await userCollection(user.uid, "workflowEvents").add({
      orderId:id,eventType:"status_changed",fromStatus,toStatus:parsed.data.status,payload:parsed.data.payload,createdAt:serverNow()
    });
    await userCollection(user.uid, "notifications").add({
      topic:"workflow",severity:["verify","closed"].includes(parsed.data.status)?"important":"notice",
      title:"Workflow status changed",body:`${fromStatus} → ${parsed.data.status}`,orderId:id,createdAt:serverNow()
    });
    return NextResponse.json({ backend:"firebase", order:{id,status:parsed.data.status,fromStatus} });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.rpc("transition_workflow_order", {
    p_order_id:id,p_to_status:parsed.data.status,p_payload:parsed.data.payload
  });
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({backend:"supabase",order:data});
}
