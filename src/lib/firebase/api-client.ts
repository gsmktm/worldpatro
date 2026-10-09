"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";

export async function firebaseFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  const token = user ? await user.getIdToken() : null;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
