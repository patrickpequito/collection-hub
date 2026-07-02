import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchCurrentBungieUser,
  tokenResponseToSession,
} from "@/lib/bungie";
import { appendQueryParam } from "@/lib/auth-return-to";
import { getAppOrigin, getBungieOAuthConfig } from "@/lib/env";
import { oauthReplaceRedirect } from "@/lib/oauth-redirect";
import { parseSignedOAuthState } from "@/lib/oauth-state";
import {
  consumeOAuthReturnTo,
  consumeOAuthState,
  getSession,
  setSession,
} from "@/lib/session";

async function resolveOAuthCallback(
  state: string | null,
): Promise<{ stateOk: boolean; returnTo: string }> {
  const parsed = parseSignedOAuthState(state);
  if (parsed.valid) {
    return { stateOk: true, returnTo: parsed.returnTo };
  }

  const cookieStateOk = await consumeOAuthState(state);
  const cookieReturnTo = await consumeOAuthReturnTo();
  return { stateOk: cookieStateOk, returnTo: cookieReturnTo };
}

function redirectAfterLogin(
  base: string,
  returnTo: string,
  param: "login" | "error",
  value: string,
) {
  const target = new URL(appendQueryParam(returnTo, param, value), base).toString();
  return new NextResponse(oauthReplaceRedirect(target), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = getAppOrigin();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const bungieError = url.searchParams.get("error");
  const { stateOk, returnTo } = await resolveOAuthCallback(state);

  if (bungieError) {
    return redirectAfterLogin(base, returnTo, "error", bungieError);
  }

  if (!code) {
    return redirectAfterLogin(base, returnTo, "error", "missing_code");
  }

  if (!stateOk) {
    const session = await getSession();
    if (session) {
      return redirectAfterLogin(base, returnTo, "login", "success");
    }

    return redirectAfterLogin(base, returnTo, "error", "invalid_state");
  }

  try {
    const { apiKey, clientId, clientSecret } = getBungieOAuthConfig();
    const tokens = await exchangeCodeForTokens({
      code,
      clientId,
      clientSecret,
    });

    const user = await fetchCurrentBungieUser(apiKey, tokens.access_token);
    const session = tokenResponseToSession(tokens, user.displayName);
    session.membershipId = user.membershipId;

    await setSession(session);

    return redirectAfterLogin(base, returnTo, "login", "success");
  } catch (error) {
    const session = await getSession();
    if (session) {
      return redirectAfterLogin(base, returnTo, "login", "success");
    }

    const message =
      error instanceof Error ? error.message : "Failed to complete sign-in";
    return redirectAfterLogin(base, returnTo, "error", message);
  }
}
