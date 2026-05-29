import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/bungie";
import { getAppOrigin, getBungieOAuthConfig } from "@/lib/env";
import { createOAuthState, setOAuthState } from "@/lib/session";

export async function GET() {
  try {
    const { clientId } = getBungieOAuthConfig();
    const state = createOAuthState();
    await setOAuthState(state);

    const authorizeUrl = buildAuthorizeUrl(clientId, state);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Bungie sign-in";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, getAppOrigin()),
    );
  }
}
