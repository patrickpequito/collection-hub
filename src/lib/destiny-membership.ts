import type { BungieUserSession } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

export type DestinyMembership = {
  membershipId: string;
  membershipType: number;
  crossSaveOverride?: number;
};

type MembershipsResponse = {
  destinyMemberships: DestinyMembership[];
  primaryMembershipId?: string | null;
};

type ProfileProbeResponse = {
  characters?: { data?: Record<string, unknown> };
};

function bungieHeaders(accessToken: string) {
  return {
    "X-API-Key": getBungieApiKey(),
    Authorization: `Bearer ${accessToken}`,
  };
}

async function bungieGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}${path}`, {
    headers: bungieHeaders(accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bungie API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as BungieResponse<T>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected Bungie API response");
  }

  return data.Response;
}

function pickCrossSaveMembership(
  memberships: DestinyMembership[],
): DestinyMembership | null {
  for (const membership of memberships) {
    if (!membership.crossSaveOverride) continue;

    const target = memberships.find(
      (candidate) =>
        candidate.membershipId === String(membership.crossSaveOverride),
    );
    if (target) return target;
  }

  return null;
}

async function membershipHasD2Profile(
  membership: DestinyMembership,
  accessToken: string,
): Promise<boolean> {
  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
    {
      headers: bungieHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) return false;

  const data = (await response.json()) as BungieResponse<ProfileProbeResponse>;
  return data.ErrorCode === 1;
}

function orderMembershipCandidates(
  memberships: DestinyMembership[],
  primaryMembershipId?: string | null,
): DestinyMembership[] {
  const ordered: DestinyMembership[] = [];
  const seen = new Set<string>();

  const add = (membership: DestinyMembership | null | undefined) => {
    if (!membership || seen.has(membership.membershipId)) return;
    seen.add(membership.membershipId);
    ordered.push(membership);
  };

  add(pickCrossSaveMembership(memberships));

  if (primaryMembershipId) {
    add(
      memberships.find(
        (membership) => membership.membershipId === primaryMembershipId,
      ),
    );
  }

  for (const membership of memberships) {
    add(membership);
  }

  return ordered;
}

export async function resolveDestinyMembership(
  session: BungieUserSession,
): Promise<DestinyMembership | null> {
  const memberships = await bungieGet<MembershipsResponse>(
    "/Platform/User/GetMembershipsForCurrentUser/",
    session.accessToken,
  );

  const destinyMemberships = memberships.destinyMemberships ?? [];
  if (!destinyMemberships.length) return null;

  const candidates = orderMembershipCandidates(
    destinyMemberships,
    memberships.primaryMembershipId,
  );

  for (const membership of candidates) {
    if (await membershipHasD2Profile(membership, session.accessToken)) {
      return membership;
    }
  }

  return candidates[0] ?? null;
}
