import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { firebaseSessionCookieName, useFirebaseBackend } from "@/lib/firebase/config";

export type FirebaseAppUser = {
  uid: string;
  email?: string;
  emailVerified?: boolean;
};

export async function getFirebaseUser(): Promise<FirebaseAppUser | null> {
  if (!useFirebaseBackend()) return null;
  const store = await cookies();
  const session = store.get(firebaseSessionCookieName)?.value;
  if (!session) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: typeof decoded.email === "string" ? decoded.email : undefined,
      emailVerified: Boolean(decoded.email_verified)
    };
  } catch {
    return null;
  }
}
