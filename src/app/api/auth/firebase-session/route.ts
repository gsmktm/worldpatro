import { NextResponse } from "next/server";
import { readMutationJson, requireSameOrigin } from "@/lib/http/write-guard";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { firebaseSessionCookieName, useFirebaseBackend } from "@/lib/firebase/config";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const input = await readMutationJson(request, 32768);
  if (!input.ok) return input.response;
  if (!useFirebaseBackend()) {
    return NextResponse.json({ error: "Firebase sessions are disabled: World Patro uses Supabase Authentication." }, { status: 503 });
  }

  const body = input.data as { idToken?: unknown } | null;
  if (typeof body?.idToken !== "string" || body.idToken.length < 20 || body.idToken.length > 16384) {
    return NextResponse.json({ error: "idToken is required." }, { status: 400 });
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(body.idToken, true);
    // Firebase recommends minting session cookies only from a recent user sign-in.
    // Refreshing an ID token does not reset auth_time and cannot bypass this check.
    if (typeof decoded.auth_time !== "number" ||
        decoded.auth_time * 1000 > Date.now() + 60_000 ||
        Date.now() - decoded.auth_time * 1000 > 5 * 60_000) {
      return NextResponse.json({ error: "Recent sign-in required." }, { status: 401 });
    }
    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, { expiresIn: FIVE_DAYS_MS });

    const response = NextResponse.json({
      ok: true,
      user: { uid: decoded.uid, email: decoded.email ?? null, emailVerified: Boolean(decoded.email_verified) }
    });

    response.cookies.set(firebaseSessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(FIVE_DAYS_MS / 1000)
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid Firebase ID token." }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(firebaseSessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
