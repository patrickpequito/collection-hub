import {
  refreshAccessToken,
  type BungieUserSession,
} from "@/lib/bungie";
import { getBungieOAuthConfig } from "@/lib/env";
import { getSession, setSession } from "@/lib/session";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Pages fire several API calls at once; share one refresh per refresh token so
 * parallel requests don't each spend (and invalidate) the same token.
 */
const inFlightRefreshes = new Map<string, Promise<BungieUserSession>>();

async function refreshSession(
  session: BungieUserSession,
  refreshToken: string,
): Promise<BungieUserSession> {
  const { clientId, clientSecret } = getBungieOAuthConfig();
  const tokens = await refreshAccessToken({
    refreshToken,
    clientId,
    clientSecret,
  });
  return {
    ...session,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? refreshToken,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    refreshExpiresAt: tokens.refresh_expires_in
      ? Date.now() + tokens.refresh_expires_in * 1000
      : session.refreshExpiresAt,
  };
}

/**
 * Returns a session with a valid Bungie access token, refreshing it when it is
 * about to expire. Use in route handlers (it may rewrite the session cookie).
 */
export async function getFreshSession(): Promise<BungieUserSession | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return session;
  }

  const { refreshToken } = session;
  if (!refreshToken) return null;

  try {
    let pending = inFlightRefreshes.get(refreshToken);
    if (!pending) {
      pending = refreshSession(session, refreshToken).finally(() => {
        // Keep briefly so requests already in flight reuse the result.
        setTimeout(() => inFlightRefreshes.delete(refreshToken), 30_000);
      });
      inFlightRefreshes.set(refreshToken, pending);
    }
    const refreshed = await pending;
    await setSession(refreshed);
    return refreshed;
  } catch (error) {
    console.warn(
      "Bungie token refresh failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
