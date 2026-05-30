import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { BungieUserSession } from "@/lib/bungie";
import { sanitizeReturnTo } from "@/lib/auth-return-to";
import { getSessionSecret } from "@/lib/env";

const SESSION_COOKIE = "d2_session";
const OAUTH_STATE_COOKIE = "bungie_oauth_state";
const OAUTH_RETURN_TO_COOKIE = "bungie_oauth_return_to";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encodeSession(session: BungieUserSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(value: string): BungieUserSession | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as BungieUserSession;

    if (!session.membershipId || !session.accessToken || !session.expiresAt) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<BungieUserSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  return decodeSession(raw);
}

export async function setSession(session: BungieUserSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function setOAuthState(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function setOAuthReturnTo(returnTo: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_RETURN_TO_COOKIE, sanitizeReturnTo(returnTo), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function consumeOAuthReturnTo(): Promise<string> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(OAUTH_RETURN_TO_COOKIE)?.value;
  cookieStore.delete(OAUTH_RETURN_TO_COOKIE);
  return sanitizeReturnTo(saved);
}

export async function consumeOAuthState(
  state: string | null,
): Promise<boolean> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!saved || !state) {
    return false;
  }

  const savedBuffer = Buffer.from(saved);
  const stateBuffer = Buffer.from(state);

  if (savedBuffer.length !== stateBuffer.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, stateBuffer);
}

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}
