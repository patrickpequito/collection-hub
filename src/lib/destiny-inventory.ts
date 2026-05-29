import { getBungieApiKey } from "@/lib/env";
import type { BungieUserSession } from "@/lib/bungie";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type DestinyMembership = {
  membershipId: string;
  membershipType: number;
  crossSaveOverride?: number;
};

type MembershipsResponse = {
  destinyMemberships: DestinyMembership[];
  primaryMembershipId?: string | null;
};

type InventoryItem = {
  itemHash: number;
};

type ProfileInventoryResponse = {
  profileInventory?: {
    data?: { items?: InventoryItem[] };
  };
  characterInventories?: {
    data?: Record<string, { items?: InventoryItem[] }>;
  };
  characterEquipment?: {
    data?: Record<string, { items?: InventoryItem[] }>;
  };
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

function pickDestinyMembership(
  memberships: DestinyMembership[],
  primaryMembershipId?: string | null,
): DestinyMembership | null {
  if (!memberships.length) return null;

  if (primaryMembershipId) {
    const primary = memberships.find(
      (m) => m.membershipId === primaryMembershipId,
    );
    if (primary) return primary;
  }

  const crossSave = memberships.find((m) => m.crossSaveOverride !== undefined);
  if (crossSave?.crossSaveOverride) {
    const active = memberships.find(
      (m) => m.membershipId === String(crossSave.crossSaveOverride),
    );
    if (active) return active;
  }

  return memberships[0];
}

function collectItemHashes(profile: ProfileInventoryResponse): Set<string> {
  const hashes = new Set<string>();

  for (const item of profile.profileInventory?.data?.items ?? []) {
    hashes.add(String(item.itemHash));
  }

  for (const bucket of Object.values(
    profile.characterInventories?.data ?? {},
  )) {
    for (const item of bucket.items ?? []) {
      hashes.add(String(item.itemHash));
    }
  }

  for (const bucket of Object.values(profile.characterEquipment?.data ?? {})) {
    for (const item of bucket.items ?? []) {
      hashes.add(String(item.itemHash));
    }
  }

  return hashes;
}

export async function fetchOwnedItemHashes(
  session: BungieUserSession,
): Promise<Set<string>> {
  const memberships = await bungieGet<MembershipsResponse>(
    "/Platform/User/GetMembershipsForCurrentUser/",
    session.accessToken,
  );

  const membership = pickDestinyMembership(
    memberships.destinyMemberships ?? [],
    memberships.primaryMembershipId,
  );

  if (!membership) {
    return new Set();
  }

  const components = [102, 201, 202].join(",");
  const profile = await bungieGet<ProfileInventoryResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${components}`,
    session.accessToken,
  );

  return collectItemHashes(profile);
}
