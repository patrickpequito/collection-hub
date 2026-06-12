const BUNGIE_ORIGIN = "https://www.bungie.net";

export type BungieTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_expires_in?: number;
  membership_id: string;
};

export type BungieUserSession = {
  membershipId: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  ThrottleSeconds: number;
  ErrorStatus: string;
  Message: string;
  MessageData: Record<string, string>;
};

type CurrentUserResponse = {
  bungieNetUser: {
    membershipId: number;
    uniqueName: string;
    displayName: string;
  };
};

export function buildAuthorizeUrl(clientId: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
  });

  return `${BUNGIE_ORIGIN}/en/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(input: {
  code: string;
  clientId: string;
  clientSecret: string;
}): Promise<BungieTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  });

  const response = await fetch(`${BUNGIE_ORIGIN}/platform/app/oauth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Bungie token: ${text}`);
  }

  return (await response.json()) as BungieTokenResponse;
}

export async function refreshAccessToken(input: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<BungieTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    client_id: input.clientId,
    client_secret: input.clientSecret,
  });

  const response = await fetch(`${BUNGIE_ORIGIN}/platform/app/oauth/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh Bungie token: ${text}`);
  }

  return (await response.json()) as BungieTokenResponse;
}

export async function fetchCurrentBungieUser(
  apiKey: string,
  accessToken: string,
): Promise<{ membershipId: string; displayName: string }> {
  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/User/GetMembershipsForCurrentUser/`,
    {
      headers: {
        "X-API-Key": apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Bungie user: ${text}`);
  }

  const data = (await response.json()) as BungieResponse<CurrentUserResponse>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected Bungie API response");
  }

  const user = data.Response.bungieNetUser;
  return {
    membershipId: String(user.membershipId),
    displayName: user.displayName || user.uniqueName,
  };
}

export function tokenResponseToSession(
  tokens: BungieTokenResponse,
  displayName: string,
): BungieUserSession {
  return {
    membershipId: tokens.membership_id,
    displayName,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}
