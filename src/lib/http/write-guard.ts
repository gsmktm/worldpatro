import { NextResponse } from "next/server";

/** Shared guard for cookie-authenticated JSON mutations. */
function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export function requireSameOrigin(request: Request): NextResponse | null {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return errorResponse("Cross-origin mutation forbidden.", 403);
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return errorResponse("Cross-origin mutation forbidden.", 403);
      }
    } catch {
      return errorResponse("Invalid Origin header.", 403);
    }
  }
  return null;
}

export async function readMutationJson(
  request: Request,
  maxBytes = 8192
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const originError = requireSameOrigin(request);
  if (originError) return { ok: false, response: originError };

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: errorResponse("Use application/json.", 415) };
  }
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && Number.isFinite(Number(declaredLength)) &&
      Number(declaredLength) > maxBytes) {
    return { ok: false, response: errorResponse("JSON request is too large.", 413) };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, response: errorResponse("JSON body is required.", 400) };

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, response: errorResponse("JSON request is too large.", 413) };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const data: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return { ok: true, data };
  } catch {
    return { ok: false, response: errorResponse("Invalid JSON body.", 400) };
  } finally {
    reader.releaseLock();
  }
}
