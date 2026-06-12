import {
  fetchCurrentBungieUser,
  refreshAccessToken,
  tokenResponseToSession,
  type BungieUserSession,
} from "@/lib/bungie";
import { getBungieOAuthConfig } from "@/lib/env";
import { getSession, setSession } from "@/lib/session";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/** Returns a session with a valid Bungie access token, refreshing when needed. */
export async function getFreshSession(): Promise<BungieUserSession | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return session;
  }

  if (!session.refreshToken) {
    return null;
  }

  try {
    const { apiKey, clientId, clientSecret } = getBungieOAuthConfig();
    const tokens = await refreshAccessToken({
      refreshToken: session.refreshToken,
      clientId,
      clientSecret,
    });
    const user = await fetchCurrentBungieUser(apiKey, tokens.access_token);
    const refreshed = tokenResponseToSession(tokens, user.displayName);
    refreshed.membershipId = user.membershipId;
    refreshed.refreshToken = tokens.refresh_token ?? session.refreshToken;
    await setSession(refreshed);
    return refreshed;
  } catch {
    return null;
  }
}
