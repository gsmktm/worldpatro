import { timingSafeEqual } from "node:crypto";
import { getAuthenticatedUser, type AppUser } from "@/lib/auth-user";

export const AGENT_MAX_BODY_BYTES = 16_384;

export type AgentAccessMode = "authenticated" | "public" | "api-key";

export function agentAccessMode(): AgentAccessMode {
  const configured = process.env.WORLD_PATRO_AGENT_ACCESS_MODE;
  if (configured === "public" || configured === "api-key" || configured === "authenticated") {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "authenticated" : "public";
}

function secureEqual(expected: string, actual: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function requestApiKey(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-world-patro-api-key")?.trim() || "";
}

export async function authorizeAgentRequest(request: Request): Promise<{
  allowed: boolean;
  mode: AgentAccessMode;
  user: AppUser | null;
  reason?: "authentication-required" | "api-key-required";
}> {
  const mode = agentAccessMode();

  if (mode === "public") {
    return { allowed: true, mode, user: await getAuthenticatedUser() };
  }

  if (mode === "api-key") {
    const expected = process.env.WORLD_PATRO_AGENT_API_KEY || "";
    const supplied = requestApiKey(request);
    if (!expected || !supplied || !secureEqual(expected, supplied)) {
      return { allowed: false, mode, user: null, reason: "api-key-required" };
    }
    return { allowed: true, mode, user: null };
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return { allowed: false, mode, user: null, reason: "authentication-required" };
  }

  return { allowed: true, mode, user };
}
