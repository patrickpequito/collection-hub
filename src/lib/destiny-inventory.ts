import { collectOwnedCatalystHashes } from "@/lib/catalyst-ownership";
import { getBungieApiKey } from "@/lib/env";
import { expandAcquiredItemHashes } from "@/lib/item-acquisition-index";
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
  itemInstanceId?: string;
};

type ItemInstanceComponent = {
  isMasterwork?: boolean;
};

type DestinyItemPlug = {
  plugItemHash?: number;
  canInsert?: boolean;
  enabled?: boolean;
};

type DestinyPlugSetsComponent = {
  plugs?: Record<string, DestinyItemPlug[]>;
};

type DestinyItemSocketState = {
  plug?: DestinyItemPlug;
  isEquipped?: boolean;
};

type DestinyItemSocketsComponent = {
  sockets?: DestinyItemSocketState[];
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
  profileCollectibles?: {
    data?: {
      collectibles?: Record<string, { state: number }>;
    };
  };
  profilePlugSets?: {
    data?: DestinyPlugSetsComponent;
  };
  characterPlugSets?: {
    data?: Record<string, DestinyPlugSetsComponent>;
  };
  itemComponents?: {
    instances?: {
      data?: Record<string, ItemInstanceComponent>;
    };
    sockets?: {
      data?: Record<string, DestinyItemSocketsComponent>;
    };
  };
  characters?: {
    data?: Record<string, unknown>;
  };
  profileRecords?: {
    data?: { records?: Record<string, { state: number }> };
  };
  characterRecords?: {
    data?: Record<string, { records?: Record<string, { state: number }> }>;
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

function collectInventoryItems(
  profile: ProfileInventoryResponse,
): InventoryItem[] {
  const items: InventoryItem[] = [];

  for (const item of profile.profileInventory?.data?.items ?? []) {
    items.push(item);
  }

  for (const bucket of Object.values(
    profile.characterInventories?.data ?? {},
  )) {
    for (const item of bucket.items ?? []) {
      items.push(item);
    }
  }

  for (const bucket of Object.values(profile.characterEquipment?.data ?? {})) {
    for (const item of bucket.items ?? []) {
      items.push(item);
    }
  }

  return items;
}

function collectInventoryHashes(profile: ProfileInventoryResponse): Set<string> {
  const hashes = new Set<string>();
  for (const item of collectInventoryItems(profile)) {
    hashes.add(String(item.itemHash));
  }
  return hashes;
}

function collectMasterworkWeaponHashes(
  profile: ProfileInventoryResponse,
): Set<string> {
  const instances = profile.itemComponents?.instances?.data ?? {};
  const hashes = new Set<string>();

  for (const item of collectInventoryItems(profile)) {
    if (!item.itemInstanceId) continue;
    const instance = instances[item.itemInstanceId];
    if (instance?.isMasterwork) {
      hashes.add(String(item.itemHash));
    }
  }

  return hashes;
}

function collectUnlockedPlugHashes(
  profile: ProfileInventoryResponse,
): Set<string> {
  const hashes = new Set<string>();

  const considerPlug = (plug: DestinyItemPlug | undefined) => {
    if (!plug?.plugItemHash) return;
    if (plug.canInsert || plug.enabled) {
      hashes.add(String(plug.plugItemHash));
    }
  };

  for (const plugs of Object.values(profile.profilePlugSets?.data?.plugs ?? {})) {
    for (const plug of plugs) considerPlug(plug);
  }

  for (const charId of Object.keys(profile.characters?.data ?? {})) {
    const charPlugSets = profile.characterPlugSets?.data?.[charId];
    for (const plugs of Object.values(charPlugSets?.plugs ?? {})) {
      for (const plug of plugs) considerPlug(plug);
    }
  }

  for (const itemSockets of Object.values(
    profile.itemComponents?.sockets?.data ?? {},
  )) {
    for (const socket of itemSockets.sockets ?? []) {
      considerPlug(socket.plug);
      if (socket.isEquipped && socket.plug?.plugItemHash) {
        hashes.add(String(socket.plug.plugItemHash));
      }
    }
  }

  return hashes;
}

/** Items currently held on characters or in the vault. */
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

  const components = [102, 200, 201, 205, 300, 305, 800, 900].join(",");
  const profile = await bungieGet<ProfileInventoryResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${components}`,
    session.accessToken,
  );

  const inventoryHashes = collectInventoryHashes(profile);
  const collectibles =
    profile.profileCollectibles?.data?.collectibles ?? {};
  const plugHashes = collectUnlockedPlugHashes(profile);
  const catalystHashes = collectOwnedCatalystHashes({
    profileRecords: profile.profileRecords?.data?.records,
    characterRecordsByCharacter: profile.characterRecords?.data,
    unlockedPlugHashes: plugHashes,
    masterworkWeaponHashes: collectMasterworkWeaponHashes(profile),
  });

  for (const hash of catalystHashes) {
    inventoryHashes.add(hash);
  }

  return expandAcquiredItemHashes({
    inventoryHashes,
    collectibles,
    plugHashes,
  });
}
