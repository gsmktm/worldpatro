import "server-only";

import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export function now() {
  return FieldValue.serverTimestamp();
}

function serializeRecord(data: DocumentData): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, serialize(value)])
  );
}

export async function listOwned(collectionName: string, userId: string, limit = 100) {
  const snap = await getAdminDb()
    .collection(collectionName)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...serializeRecord(doc.data()) }));
}

export async function createOwned(collectionName: string, userId: string, data: Record<string, unknown>) {
  const ref = await getAdminDb().collection(collectionName).add({
    ...data,
    userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
  const doc = await ref.get();
  return { id: doc.id, ...serializeRecord(doc.data() ?? {}) };
}

export async function updateOwned(collectionName: string, id: string, userId: string, patch: Record<string, unknown>) {
  const ref = getAdminDb().collection(collectionName).doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.userId !== userId) return null;
  await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  const next = await ref.get();
  return { id: next.id, ...serializeRecord(next.data() ?? {}) };
}

export async function deleteOwned(collectionName: string, id: string, userId: string) {
  const ref = getAdminDb().collection(collectionName).doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.userId !== userId) return false;
  await ref.delete();
  return true;
}

export function serialize(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, serialize(nested)])
    );
  }
  return value;
}
