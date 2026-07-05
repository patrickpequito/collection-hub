import { collectOwnedCatalystHashes } from "@/lib/catalyst-ownership";
import { parseProfileCharacters } from "@/lib/destiny-characters";
import {
  resolveDestinyMembership,
  type DestinyMembership,
} from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";
import { expandAcquiredItemHashes } from "@/lib/item-acquisition-index";
import type { BungieUserSession } from "@/lib/bungie";
import type { ProfileCharacter } from "@/types/destiny-characters";
import type { WeaponRollLocation } from "@/types/weapon-rolls";

export const DESTINY_PROFILE_COMPONENTS = [
  102, 200, 201, 205, 300, 305, 800, 900,
] as const;

export const ARMOR_PROFILE_COMPONENTS = [
  ...DESTINY_PROFILE_COMPONENTS,
  304,
] as const;

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type InventoryItem = {
  itemHash: number;
  itemInstanceId?: string;
};

export type LocatedInventoryItem = {
  itemHash: string;
  itemInstanceId: string;
  location: WeaponRollLocation;
  characterId?: string;
};

export type RawWeaponRollInstance = {
  itemInstanceId: string;
  itemHash: string;
  location: WeaponRollLocation;
  characterId?: string;
  isMasterwork: boolean;
  equippedPlugHashes: string[];
  socketPlugHashesByIndex: (string | undefined)[];
  gearTier: number | null;
};

export type RawArmorRollInstance = {
  itemInstanceId: string;
  itemHash: string;
  location: WeaponRollLocation;
  characterId?: string;
  statsByHash: Record<string, number>;
  equippedPlugHashes: string[];
  socketPlugHashesByIndex: (string | undefined)[];
  gearTier: number | null;
  defense: number | null;
};

type ItemInstanceComponent = {
  isMasterwork?: boolean;
  gearTier?: number | null;
  primaryStat?: { statHash?: number; value?: number };
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
  plugHash?: number;
  plug?: DestinyItemPlug;
  isEnabled?: boolean;
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
  characterCollectibles?: {
    data?: Record<
      string,
      { collectibles?: Record<string, { state: number }> }
    >;
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
    stats?: {
      data?: Record<
        string,
        { stats?: Record<string, { statHash?: number; value?: number }> }
      >;
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
  characterProgressions?: {
    data?: Record<
      string,
      {
        progressions?: Record<
          string,
          { level?: number; rewardItemStates?: number[] }
        >;
      }
    >;
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

export function collectLocatedInventoryItems(
  profile: ProfileInventoryResponse,
): LocatedInventoryItem[] {
  const items: LocatedInventoryItem[] = [];

  for (const item of profile.profileInventory?.data?.items ?? []) {
    if (!item.itemInstanceId) continue;
    items.push({
      itemHash: String(item.itemHash),
      itemInstanceId: item.itemInstanceId,
      location: "vault",
    });
  }

  for (const [characterId, bucket] of Object.entries(
    profile.characterInventories?.data ?? {},
  )) {
    for (const item of bucket.items ?? []) {
      if (!item.itemInstanceId) continue;
      items.push({
        itemHash: String(item.itemHash),
        itemInstanceId: item.itemInstanceId,
        location: "inventory",
        characterId,
      });
    }
  }

  for (const [characterId, bucket] of Object.entries(
    profile.characterEquipment?.data ?? {},
  )) {
    for (const item of bucket.items ?? []) {
      if (!item.itemInstanceId) continue;
      items.push({
        itemHash: String(item.itemHash),
        itemInstanceId: item.itemInstanceId,
        location: "equipped",
        characterId,
      });
    }
  }

  return items;
}

function resolveSocketPlugHash(socket: DestinyItemSocketState): string | null {
  const plugHash = socket.plugHash ?? socket.plug?.plugItemHash;
  if (!plugHash) return null;
  if (socket.isEnabled === false) return null;
  return String(plugHash);
}

function collectSocketPlugHashesByIndex(
  profile: ProfileInventoryResponse,
  itemInstanceId: string,
): (string | undefined)[] {
  const sockets =
    profile.itemComponents?.sockets?.data?.[itemInstanceId]?.sockets ?? [];

  return sockets.map((socket) => {
    const plugHash = socket.plugHash ?? socket.plug?.plugItemHash;
    return plugHash ? String(plugHash) : undefined;
  });
}

function collectEquippedPlugHashes(
  profile: ProfileInventoryResponse,
  itemInstanceId: string,
): string[] {
  const sockets =
    profile.itemComponents?.sockets?.data?.[itemInstanceId]?.sockets ?? [];
  const hashes: string[] = [];

  for (const socket of sockets) {
    const plugHash = resolveSocketPlugHash(socket);
    if (!plugHash) continue;
    hashes.push(plugHash);
  }

  return hashes;
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
      const plugHash = resolveSocketPlugHash(socket);
      if (plugHash) {
        hashes.add(plugHash);
      }
    }
  }

  return hashes;
}

export async function fetchDestinyProfile(
  session: BungieUserSession,
  membership: DestinyMembership,
  components: readonly number[] = DESTINY_PROFILE_COMPONENTS,
): Promise<ProfileInventoryResponse> {
  return bungieGet<ProfileInventoryResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=${components.join(",")}`,
    session.accessToken,
  );
}

export type RollInstancesResult<TRoll> = {
  instances: TRoll[];
  characters: ProfileCharacter[];
};

/** Physical weapon copies held on characters or in the vault. */
export async function fetchWeaponRollInstances(
  session: BungieUserSession,
  itemHashes: ReadonlySet<string>,
): Promise<RollInstancesResult<RawWeaponRollInstance>> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return { instances: [], characters: [] };

  const profile = await fetchDestinyProfile(session, membership);
  const characters = parseProfileCharacters(profile);
  const instances = profile.itemComponents?.instances?.data ?? {};
  const rolls: RawWeaponRollInstance[] = [];

  for (const item of collectLocatedInventoryItems(profile)) {
    if (!itemHashes.has(item.itemHash)) continue;

    const instance = instances[item.itemInstanceId];
    const gearTier =
      typeof instance?.gearTier === "number" ? instance.gearTier : null;
    rolls.push({
      itemInstanceId: item.itemInstanceId,
      itemHash: item.itemHash,
      location: item.location,
      characterId: item.characterId,
      isMasterwork: instance?.isMasterwork ?? false,
      equippedPlugHashes: collectEquippedPlugHashes(
        profile,
        item.itemInstanceId,
      ),
      socketPlugHashesByIndex: collectSocketPlugHashesByIndex(
        profile,
        item.itemInstanceId,
      ),
      gearTier,
    });
  }

  return { instances: rolls, characters };
}

/** Physical armor copies held on characters or in the vault. */
export async function fetchArmorRollInstances(
  session: BungieUserSession,
  itemHashes: ReadonlySet<string>,
): Promise<RollInstancesResult<RawArmorRollInstance>> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return { instances: [], characters: [] };

  const profile = await fetchDestinyProfile(
    session,
    membership,
    ARMOR_PROFILE_COMPONENTS,
  );
  const characters = parseProfileCharacters(profile);
  const itemStats = profile.itemComponents?.stats?.data ?? {};
  const instances = profile.itemComponents?.instances?.data ?? {};
  const socketData = profile.itemComponents?.sockets?.data ?? {};
  const rolls: RawArmorRollInstance[] = [];

  for (const item of collectLocatedInventoryItems(profile)) {
    if (!itemHashes.has(item.itemHash)) continue;

    const statsByHash: Record<string, number> = {};
    for (const [hash, entry] of Object.entries(
      itemStats[item.itemInstanceId]?.stats ?? {},
    )) {
      if (entry.value !== undefined) {
        statsByHash[hash] = entry.value;
      }
    }

    const instance = instances[item.itemInstanceId];
    const gearTier =
      typeof instance?.gearTier === "number" ? instance.gearTier : null;
    const defense =
      typeof instance?.primaryStat?.value === "number"
        ? instance.primaryStat.value
        : null;
    const socketPlugHashesByIndex = (
      socketData[item.itemInstanceId]?.sockets ?? []
    ).map((socket) => {
      const plugHash = socket.plugHash ?? socket.plug?.plugItemHash;
      return plugHash ? String(plugHash) : undefined;
    });

    rolls.push({
      itemInstanceId: item.itemInstanceId,
      itemHash: item.itemHash,
      location: item.location,
      characterId: item.characterId,
      statsByHash,
      equippedPlugHashes: collectEquippedPlugHashes(
        profile,
        item.itemInstanceId,
      ),
      socketPlugHashesByIndex,
      gearTier,
      defense,
    });
  }

  return { instances: rolls, characters };
}

function collectProfileCollectibles(
  profile: ProfileInventoryResponse,
): Record<string, { state: number }> {
  const merged: Record<string, { state: number }> = {
    ...(profile.profileCollectibles?.data?.collectibles ?? {}),
  };

  for (const character of Object.values(
    profile.characterCollectibles?.data ?? {},
  )) {
    for (const [hash, entry] of Object.entries(character.collectibles ?? {})) {
      merged[hash] = entry;
    }
  }

  return merged;
}

/** Items currently held on characters or in the vault. */
export async function fetchOwnedItemHashes(
  session: BungieUserSession,
): Promise<Set<string>> {
  const membership = await resolveDestinyMembership(session);

  if (!membership) {
    return new Set();
  }

  const profile = await fetchDestinyProfile(session, membership);

  const inventoryHashes = collectInventoryHashes(profile);
  const collectibles = collectProfileCollectibles(profile);
  const plugHashes = collectUnlockedPlugHashes(profile);
  const catalystHashes = await collectOwnedCatalystHashes({
    profileRecords: profile.profileRecords?.data?.records,
    characterRecordsByCharacter: profile.characterRecords?.data,
    unlockedPlugHashes: plugHashes,
    masterworkWeaponHashes: collectMasterworkWeaponHashes(profile),
  });

  for (const hash of catalystHashes) {
    inventoryHashes.add(hash);
  }

  return await expandAcquiredItemHashes({
    inventoryHashes,
    collectibles,
    plugHashes,
  });
}
