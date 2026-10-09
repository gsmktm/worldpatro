import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export function firestoreDb() {
  return getFirebaseAdminFirestore();
}

export function userCollection(uid: string, collectionName: string) {
  return firestoreDb().collection("users").doc(uid).collection(collectionName);
}

export function serializeFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeFirestoreValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serializeFirestoreValue(nested);
    }
    return out;
  }
  return value;
}

export function serializeDocument(doc: DocumentSnapshot) {
  return {
    id: doc.id,
    ...(serializeFirestoreValue(doc.data() ?? {}) as Record<string, unknown>)
  };
}

export const serverNow = () => FieldValue.serverTimestamp();

export async function listUserDocs(uid: string, collectionName: string, limit = 100) {
  const snapshot = await userCollection(uid, collectionName).limit(limit).get();
  return snapshot.docs.map(serializeDocument).sort((a, b) => {
    const av = String((a as Record<string, unknown>).createdAt ?? "");
    const bv = String((b as Record<string, unknown>).createdAt ?? "");
    return bv.localeCompare(av);
  });
}
