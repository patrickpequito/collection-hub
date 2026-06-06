import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sanitizeReturnTo } from "@/lib/auth-return-to";
import { getSessionSecret } from "@/lib/env";

const MAX_AGE_MS = 10 * 60 * 1000;

type OAuthStatePayload = {
  n: string;
  r: string;
  t: number;
};

function signPayload(payloadB64: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

/** Signed OAuth state — survives mobile browsers that drop short-lived cookies. */
export function createSignedOAuthState(returnTo: string): string {
  const payload: OAuthStatePayload = {
    n: randomBytes(16).toString("base64url"),
    r: sanitizeReturnTo(returnTo),
    t: Date.now(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export type ParsedOAuthState = {
  valid: boolean;
  returnTo: string;
};

export function parseSignedOAuthState(state: string | null): ParsedOAuthState {
  const fallback: ParsedOAuthState = { valid: false, returnTo: "/" };
  if (!state) return fallback;

  const dot = state.lastIndexOf(".");
  if (dot < 0) return fallback;

  const payloadB64 = state.slice(0, dot);
  const signature = state.slice(dot + 1);
  const expected = signPayload(payloadB64);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return fallback;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as OAuthStatePayload;

    if (!payload.n || !payload.r || typeof payload.t !== "number") {
      return fallback;
    }

    if (Date.now() - payload.t > MAX_AGE_MS) {
      return fallback;
    }

    return {
      valid: true,
      returnTo: sanitizeReturnTo(payload.r),
    };
  } catch {
    return fallback;
  }
}
