import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/bungie";
import { appendQueryParam, sanitizeReturnTo } from "@/lib/auth-return-to";
import { getAppOrigin, getBungieOAuthConfig } from "@/lib/env";
import { createSignedOAuthState } from "@/lib/oauth-state";

export async function GET(request: Request) {
  const returnTo = sanitizeReturnTo(
    new URL(request.url).searchParams.get("returnTo"),
  );

  try {
    const { clientId } = getBungieOAuthConfig();
    const state = createSignedOAuthState(returnTo);

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
