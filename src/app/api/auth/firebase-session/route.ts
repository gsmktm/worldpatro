import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { firebaseSessionCookieName, isFirebaseAdminConfigured } from "@/lib/firebase/config";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { idToken?: string } | null;
  if (!body?.idToken) {
    return NextResponse.json({ error: "idToken is required." }, { status: 400 });
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(body.idToken, true);
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

export async function DELETE() {
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
