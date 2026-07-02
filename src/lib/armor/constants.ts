export const ARMOR_STAT_HASHES = {
  Health: 392767087,
  Melee: 3493869314,
  Grenade: 1735777505,
  Super: 144602215,
  Class: 1943323491,
  Weapons: 2996146975,
} as const;

export const ARMOR_STAT_ORDER = [
  "Health",
  "Melee",
  "Grenade",
  "Super",
  "Class",
  "Weapons",
] as const;

export type ArmorStatName = (typeof ARMOR_STAT_ORDER)[number];

/** Armor 3.0 roll plugs and API stats use this hash for Melee instead of the legacy hash. */
export const ARMOR_30_MELEE_STAT_HASH = 4244567218;

export const ARMOR_STAT_HASHES_BY_NAME: Record<
  ArmorStatName,
  readonly number[]
> = {
  Health: [ARMOR_STAT_HASHES.Health],
  Melee: [ARMOR_STAT_HASHES.Melee, ARMOR_30_MELEE_STAT_HASH],
  Grenade: [ARMOR_STAT_HASHES.Grenade],
  Super: [ARMOR_STAT_HASHES.Super],
  Class: [ARMOR_STAT_HASHES.Class],
  Weapons: [ARMOR_STAT_HASHES.Weapons],
};

const CANONICAL_ARMOR_STAT_HASH = new Map<string, string>(
  Object.entries(ARMOR_STAT_HASHES_BY_NAME).flatMap(([name, hashes]) =>
    hashes.map((hash) => [String(hash), String(ARMOR_STAT_HASHES[name as ArmorStatName])]),
  ),
);

export function canonicalArmorStatHash(
  statHash: string | number,
): string | null {
  return CANONICAL_ARMOR_STAT_HASH.get(String(statHash)) ?? null;
}

export function isTrackedArmorStatHash(statHash: string | number): boolean {
  return canonicalArmorStatHash(statHash) !== null;
}

/** Archetype plug set hash on armor 3.0 manifest items. */
export const ARMOR_30_ARCHETYPE_PLUG_SET_HASH = 1315181101;

/** Sockets that hold archetype + rolled stat plugs on armor 3.0 instances. */
export const ARMOR_30_BASE_SOCKET_INDICES = [6, 7, 8, 9] as const;

export const ARMOR_30_EXOTIC_CLASS_SOCKET_INDICES = [10, 11] as const;
