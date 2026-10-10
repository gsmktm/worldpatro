import { NextResponse } from "next/server";
import { z } from "zod";
import { useFirebaseBackend } from "@/lib/firebase/config";
import { getFirebaseUser } from "@/lib/firebase/user";
import { firestoreDb, serverNow, userCollection } from "@/lib/firebase/data";
import { requireUser } from "@/lib/auth";
import { readMutationJson } from "@/lib/http/write-guard";

const Transition = z.object({
  status: z.enum(["draft","review","approved","assigned","active","verify","closed","archived","cancelled"]),
  payload: z.record(z.string(), z.unknown()).default({})
}).strict();

const NEXT: Record<string, string[]> = {
  draft:["review","cancelled"], review:["draft","approved","cancelled"], approved:["assigned","cancelled"],
  assigned:["active","cancelled"], active:["verify","cancelled"], verify:["active","closed"], closed:["archived"]
};

class WorkflowError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

const respond = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{5,128}$/.test(id)) return respond({ error: "Invalid workflow order ID." }, 400);

  const body = await readMutationJson(request, 8192);
  if (!body.ok) return body.response;
  const parsed = Transition.safeParse(body.data);
  if (!parsed.success) return respond({ error: "Invalid transition", issues: parsed.error.issues }, 400);

  if (useFirebaseBackend()) {
    const user = await getFirebaseUser();
    if (!user) return respond({ error: "Authentication required" }, 401);

    const db = firestoreDb();
    const ref = userCollection(user.uid, "workflowOrders").doc(id);
    const eventRef = userCollection(user.uid, "workflowEvents").doc();
    const notificationRef = userCollection(user.uid, "notifications").doc();
    let fromStatus = "";

    try {
      // Commit the state transition, event and notification together.
      // A failed audit write must never leave a silently advanced workflow.
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new WorkflowError("Workflow order not found.", 404);
        const current = snap.data() ?? {};
        fromStatus = String(current.status || "");
        if (!(NEXT[fromStatus] || []).includes(parsed.data.status)) {
          throw new WorkflowError(`Invalid workflow transition: ${fromStatus} → ${parsed.data.status}`, 409);
        }
        const prior = current.approvalState;
        const approvalState =
          prior && typeof prior === "object" && !Array.isArray(prior)
            ? { ...prior, ...parsed.data.payload }
            : parsed.data.payload;

        tx.update(ref, { status: parsed.data.status, approvalState, updatedAt: serverNow() });
        tx.set(eventRef, {
          orderId:id,eventType:"status_changed",fromStatus,toStatus:parsed.data.status,
          payload:parsed.data.payload,createdAt:serverNow()
        });
        tx.set(notificationRef, {
          topic:"workflow",severity:["verify","closed"].includes(parsed.data.status)?"important":"notice",
          title:"Workflow status changed",body:`${fromStatus} → ${parsed.data.status}`,
          orderId:id,createdAt:serverNow()
        });
      });
    } catch (error) {
      if (error instanceof WorkflowError) return respond({ error: error.message }, error.status);
      return respond({ error: "Workflow update unavailable; no transition was committed." }, 503);
    }

    return respond({ backend:"firebase", order:{id,status:parsed.data.status,fromStatus} });
  }

  const auth = await requireUser();
  if (auth.error || !auth.supabase || !auth.userId) return auth.error!;
  const { data, error } = await auth.supabase.rpc("transition_workflow_order", {
    p_order_id:id,p_to_status:parsed.data.status,p_payload:parsed.data.payload
  });
  if (error) return respond({ error: "Workflow transition was rejected or unavailable." }, 409);
  return respond({ backend:"supabase", order:data });
}
