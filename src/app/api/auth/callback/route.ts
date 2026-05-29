import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchCurrentBungieUser,
  tokenResponseToSession,
} from "@/lib/bungie";
import { getAppOrigin, getBungieOAuthConfig } from "@/lib/env";
import { consumeOAuthState, setSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = getAppOrigin();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const bungieError = url.searchParams.get("error");

  if (bungieError) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(bungieError)}`, base),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", base),
    );
  }

  const stateOk = await consumeOAuthState(state);
  if (!stateOk) {
    return NextResponse.redirect(
      new URL("/?error=invalid_state", base),
    );
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

    return NextResponse.redirect(new URL("/?login=success", base));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete sign-in";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, base),
    );
  }
}
