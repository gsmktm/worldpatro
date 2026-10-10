import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const allowedTypes = new Set<EmailOtpType>(["email", "signup", "recovery", "invite", "magiclink", "email_change"]);
export function safeNextPath(input: string | null): string {
  if (!input || !input.startsWith("/") || input.startsWith("//") || input.includes("\\") || /[\u0000-\u001f\u007f]/.test(input)) return "/app/account";
  return input;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const destination = safeNextPath(url.searchParams.get("next"));
  const supabase = await createClient();

  if (supabase) {
    if (tokenHash && type && allowedTypes.has(type as EmailOtpType)) {
      const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(destination, url.origin), { headers: { "Cache-Control": "private, no-store" } });
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(destination, url.origin), { headers: { "Cache-Control": "private, no-store" } });
    }
  }
  return NextResponse.redirect(new URL("/login?error=Could+not+confirm+authentication", url.origin), { headers: { "Cache-Control": "private, no-store" } });
}
