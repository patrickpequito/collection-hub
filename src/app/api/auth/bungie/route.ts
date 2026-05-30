import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/bungie";
import { appendQueryParam, sanitizeReturnTo } from "@/lib/auth-return-to";
import { getAppOrigin, getBungieOAuthConfig } from "@/lib/env";
import { createOAuthState, setOAuthReturnTo, setOAuthState } from "@/lib/session";

export async function GET(request: Request) {
  const returnTo = sanitizeReturnTo(
    new URL(request.url).searchParams.get("returnTo"),
  );

  try {
    const { clientId } = getBungieOAuthConfig();
    const state = createOAuthState();
    await setOAuthState(state);
    await setOAuthReturnTo(returnTo);

    const authorizeUrl = buildAuthorizeUrl(clientId, state);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Bungie sign-in";
    return NextResponse.redirect(
      new URL(
        appendQueryParam(returnTo, "error", message),
        getAppOrigin(),
      ),
    );
  }
}
