import "server-only";

import { headers } from "next/headers";
import { getAdminAuth, firebaseAdminConfigured } from "@/lib/firebase/admin";

export type FirebaseIdentity = {
  uid: string;
  email?: string;
};

export async function firebaseIdentityFromRequest(): Promise<FirebaseIdentity | null> {
  if (!firebaseAdminConfigured()) return null;
  const h = await headers();
  const value = h.get("authorization");
  if (!value?.startsWith("Bearer ")) return null;
  const token = value.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
