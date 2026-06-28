import type {
  AllLootItem,
  ResolvedWeaponPerkColumn,
  WeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";

function resolvePerkColumnsFromRaw(
  perkColumns: WeaponPerkColumn[] | undefined,
  plugIndex: Record<string, WeaponPlugDefinition>,
): ResolvedWeaponPerkColumn[] {
  if (!perkColumns?.length) return [];

  return perkColumns
    .map((column) => ({
      type: column.type,
      perks: column.plugHashes.flatMap((plugHash) => {
        const plug = plugIndex[plugHash];
        if (!plug) return [];
        return [{ ...plug, plugHash }];
      }),
    }))
    .filter((column) => column.perks.length > 0);
}

export function resolveWeaponPerkColumns(
  weapon: AllLootItem,
  plugIndex: Record<string, WeaponPlugDefinition>,
): ResolvedWeaponPerkColumn[] {
  return resolvePerkColumnsFromRaw(weapon.perkColumns, plugIndex);
}

export function collectWeaponPoolPlugHashes(weapon: AllLootItem): Set<string> {
  const hashes = new Set<string>();

  const addColumns = (columns?: WeaponPerkColumn[]) => {
    for (const column of columns ?? []) {
      for (const plugHash of column.plugHashes) {
        hashes.add(plugHash);
      }
    }
  };

  addColumns(weapon.perkColumns);
  for (const columns of Object.values(weapon.perkColumnsByItemHash ?? {})) {
    addColumns(columns);
  }
  for (const version of weapon.versions ?? []) {
    addColumns(version.perkColumns);
  }

  return hashes;
}

function resolveRawPerkColumnsForHash(
  weapon: AllLootItem,
  itemHash: string,
): WeaponPerkColumn[] | undefined {
  const version = weapon.versions?.find((entry) => entry.itemHash === itemHash);
  if (version?.perkColumns?.length) return version.perkColumns;

  const byHash = weapon.perkColumnsByItemHash?.[itemHash];
  if (byHash?.length) return byHash;

  if (weapon.itemHash === itemHash && weapon.perkColumns?.length) {
    return weapon.perkColumns;
  }

  if (
    collectWeaponItemHashes(weapon).includes(itemHash) &&
    weapon.perkColumns?.length
  ) {
    return weapon.perkColumns;
  }

  return undefined;
}

export function resolveWeaponPerkColumnsForHash(
  weapon: AllLootItem,
  itemHash: string,
  plugIndex: Record<string, WeaponPlugDefinition>,
): ResolvedWeaponPerkColumn[] {
  return resolvePerkColumnsFromRaw(
    resolveRawPerkColumnsForHash(weapon, itemHash),
    plugIndex,
  );
}

export function resolveWeaponRawPerkColumnsForHash(
  weapon: AllLootItem,
  itemHash: string,
): WeaponPerkColumn[] | undefined {
  return resolveRawPerkColumnsForHash(weapon, itemHash);
}

export function resolveWeaponStatsForHash(
  weapon: AllLootItem,
  itemHash: string,
): AllLootItem["stats"] {
  const version = weapon.versions?.find((entry) => entry.itemHash === itemHash);
  const byHash = weapon.statsByItemHash?.[itemHash];
  if (byHash?.length) return byHash;
  if (version?.stats?.length) return version.stats;
  if (weapon.itemHash === itemHash) return weapon.stats;
  if (collectWeaponItemHashes(weapon).includes(itemHash)) return weapon.stats;
  return undefined;
}

export function filterEquippedWeaponPerkHashes(
  equippedPlugHashes: readonly string[],
  weapon: AllLootItem,
  plugIndex: Record<string, WeaponPlugDefinition>,
): string[] {
  const poolHashes = collectWeaponPoolPlugHashes(weapon);
  if (!poolHashes.size) return [...equippedPlugHashes];

  const poolNames = new Set<string>();
  for (const hash of poolHashes) {
    const name = plugIndex[hash]?.name;
    if (name) poolNames.add(name);
  }

  const filtered: string[] = [];
  const seenNames = new Set<string>();

  for (const hash of equippedPlugHashes) {
    if (poolHashes.has(hash)) {
      filtered.push(hash);
      continue;
    }

    const name = plugIndex[hash]?.name;
    if (name && poolNames.has(name) && !seenNames.has(name)) {
      filtered.push(hash);
      seenNames.add(name);
    }
  }

  return filtered;
}

export function formatPerkDescription(description: string) {
  return description
    .replace(/\[#+[^\]]+\]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/•/g, "·")
    .trim();
}
