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

function equippedPlugNames(
  equippedPlugHashes: readonly string[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Set<string> {
  const names = new Set<string>();
  for (const hash of equippedPlugHashes) {
    const name = plugIndex[hash]?.name;
    if (name) names.add(name);
  }
  return names;
}

function resolveEquippedPlugForColumn(
  equippedHash: string,
  column: WeaponPerkColumn,
  plugIndex: Record<string, WeaponPlugDefinition>,
): string | null {
  if (column.plugHashes.includes(equippedHash)) return equippedHash;

  const equippedName = plugIndex[equippedHash]?.name;
  if (equippedName) {
    const byName = column.plugHashes.find(
      (hash) => plugIndex[hash]?.name === equippedName,
    );
    if (byName) return byName;
  }

  return null;
}

/** Map equipped socket plugs to one catalog hash per weapon column. */
export function resolveEquippedPerColumn(
  equippedPlugHashes: readonly string[],
  perkColumns: readonly WeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
  socketPlugHashesByIndex?: readonly (string | undefined)[],
): (string | null)[] {
  const equipped = new Set(equippedPlugHashes);
  const equippedNames = equippedPlugNames(equippedPlugHashes, plugIndex);

  return perkColumns.map((column) => {
    if (
      column.socketIndex !== undefined &&
      socketPlugHashesByIndex &&
      column.socketIndex < socketPlugHashesByIndex.length
    ) {
      const socketHash = socketPlugHashesByIndex[column.socketIndex];
      if (socketHash) {
        return resolveEquippedPlugForColumn(socketHash, column, plugIndex);
      }
    }

    const direct = column.plugHashes.find((hash) => equipped.has(hash));
    if (direct) return direct;

    return (
      column.plugHashes.find((hash) => {
        const name = plugIndex[hash]?.name;
        return Boolean(name && equippedNames.has(name));
      }) ?? null
    );
  });
}

/** Equipped perk hashes for roll UI, one entry per perk column. */
export function resolveEquippedRollPerkHashes(
  equippedPlugHashes: readonly string[],
  perkColumns: readonly WeaponPerkColumn[] | undefined,
  plugIndex: Record<string, WeaponPlugDefinition>,
  socketPlugHashesByIndex?: readonly (string | undefined)[],
): string[] {
  if (!perkColumns?.length) return [];

  return resolveEquippedPerColumn(
    equippedPlugHashes,
    perkColumns,
    plugIndex,
    socketPlugHashesByIndex,
  ).flatMap((hash, index) =>
    hash && perkColumns[index]?.type === "perk" ? [hash] : [],
  );
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

export function resolveWeaponScreenshotForHash(
  weapon: AllLootItem,
  itemHash: string,
): string | undefined {
  const version = weapon.versions?.find((entry) => entry.itemHash === itemHash);
  if (version?.screenshotPath) return version.screenshotPath;

  const byHash = weapon.screenshotPathByItemHash?.[itemHash];
  if (byHash) return byHash;

  if (weapon.itemHash === itemHash) return weapon.screenshotPath;

  if (collectWeaponItemHashes(weapon).includes(itemHash)) {
    return weapon.screenshotPath;
  }

  return undefined;
}

export function filterEquippedWeaponPerkHashes(
  equippedPlugHashes: readonly string[],
  weapon: AllLootItem,
  itemHash: string,
  plugIndex: Record<string, WeaponPlugDefinition>,
  socketPlugHashesByIndex?: readonly (string | undefined)[],
): string[] {
  const columns = resolveRawPerkColumnsForHash(weapon, itemHash);
  if (!columns?.length) return [...equippedPlugHashes];

  return resolveEquippedRollPerkHashes(
    equippedPlugHashes,
    columns,
    plugIndex,
    socketPlugHashesByIndex,
  );
}

export function formatPerkDescription(description: string) {
  return description
    .replace(/\[#+[^\]]+\]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/•/g, "·")
    .trim();
}
