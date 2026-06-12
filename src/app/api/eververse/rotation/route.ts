import { NextResponse } from "next/server";
import {
  loadEververseRotation,
  rotationExpiresAtMs,
} from "@/lib/eververse/load-rotation";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const includeDebug = url.searchParams.get("debug") === "1";

  const result = await loadEververseRotation(session, {
    forceRefresh,
    includeDebug,
  });

  return NextResponse.json({
    rotation: result.rotation,
    source: result.source,
    error: result.error,
    apiNotice: result.apiNotice ?? null,
    nextResetMs: rotationExpiresAtMs(),
    ...(result.debug ? { debug: result.debug } : {}),
  });
}
