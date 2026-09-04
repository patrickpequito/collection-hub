import {
  buildPartialArmorRowsFromCatalogItems,
} from "@/lib/activities/armor-rows";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import type { SeasonHub } from "@/data/seasons/types";
import { SEASON_WORLD_LOOT_POOL } from "@/data/seasons/types";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import {
  itemNameBelongsToArmorSet,
} from "@/lib/armor-sets/named-set-match";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";

const ADEPT = /\(adept\)/i;
const EVERVERSE = /eververse|bright engram/i;

export type SeasonWeaponPool = {
  id: string;
  title: string;
  weapons: LootItem[];
};

export type SeasonLoot = {
  armorGroups: LegacyArmorSetGroup[];
  weaponPools: SeasonWeaponPool[];
  exoticItems: LootItem[];
  /** Season Pass cosmetics reclaimable from the Season Archive. */
  cosmeticItems: LootItem[];
  /**
   * Progress bar groups — obtainable gear plus curated Season Archive cosmetics.
   */
  progressOwnershipGroups: string[][];
  progressTotal: number;
};

function indexCatalogByAnyHash(
  items: AllLootItem[],
): Map<string, AllLootItem> {
  const index = new Map<string, AllLootItem>();
  for (const item of items) {
    for (const hash of collectAllLootItemHashes(item)) {
      if (!index.has(hash)) index.set(hash, item);
    }
  }
  return index;
}

function enrichArmorRowsWithOwnership(
  rows: ReturnType<typeof buildPartialArmorRowsFromCatalogItems>,
  catalogByHash: Map<string, AllLootItem>,
) {
  return rows.map((row) => {
    const pieces = { ...row.pieces };
    for (const slot of Object.keys(pieces) as Array<keyof typeof pieces>) {
      const piece = pieces[slot];
      if (!piece) continue;
      const catalogItem = catalogByHash.get(piece.itemHash);
      if (!catalogItem) continue;
      pieces[slot] = {
        ...piece,
        ownershipHashes: collectAllLootItemHashes(catalogItem),
      };
    }
    return { ...row, pieces };
  });
}

function isSeasonWeapon(item: AllLootItem, hub: SeasonHub): boolean {
  if (item.type !== "Weapon") return false;
  if (item.rarity !== "Legendary") return false;
  if (ADEPT.test(item.name)) return false;
  if (EVERVERSE.test(item.source ?? "")) return false;
  if (hub.excludedWeaponNames?.includes(item.name)) return false;
  if (hub.extraWeaponNames?.includes(item.name)) return true;
  if (item.seasonLabel === hub.seasonLabel) return true;
  if (hub.matchWeaponVersions === false) return false;
  return (item.versions ?? []).some(
    (version) => version.seasonLabel === hub.seasonLabel,
  );
}

function ownershipGroup(item: LootItem): string[] {
  return item.ownershipHashes?.length
    ? item.ownershipHashes
    : [item.itemHash];
}

function isObtainableCatalogItem(item: AllLootItem | undefined): boolean {
  return Boolean(item?.obtainable);
}

function resolveWeaponPoolId(
  weapon: LootItem,
  hub: SeasonHub,
): string {
  const override = hub.weaponPoolByName?.[weapon.name];
  if (override) return override;

  const source = weapon.source ?? "";
  for (const pool of hub.weaponPools) {
    if (pool.sourcePattern.test(source)) return pool.id;
  }
  return SEASON_WORLD_LOOT_POOL.id;
}

function buildWeaponPools(
  weapons: LootItem[],
  hub: SeasonHub,
): SeasonWeaponPool[] {
  const byPoolId = new Map<string, LootItem[]>();

  for (const weapon of weapons) {
    const poolId = resolveWeaponPoolId(weapon, hub);
    const bucket = byPoolId.get(poolId) ?? [];
    bucket.push(weapon);
    byPoolId.set(poolId, bucket);
  }

  const orderedDefinitions = [...hub.weaponPools, SEASON_WORLD_LOOT_POOL];
  const pools: SeasonWeaponPool[] = [];

  for (const definition of orderedDefinitions) {
    const bucket = byPoolId.get(definition.id);
    if (!bucket?.length) continue;
    pools.push({
      id: definition.id,
      title: definition.title,
      weapons: bucket.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return pools;
}

function buildNamedSetGroup(
  catalogItems: AllLootItem[],
  catalogByHash: Map<string, AllLootItem>,
  setName: string,
  itemType: "Armor" | "Ornament",
  hub: SeasonHub,
): LegacyArmorSetGroup | null {
  const matching = catalogItems.filter(
    (item) =>
      item.type === itemType &&
      item.rarity === "Legendary" &&
      itemNameBelongsToArmorSet(item.name, setName),
  );
  const rows = enrichArmorRowsWithOwnership(
    buildPartialArmorRowsFromCatalogItems(matching, setName),
    catalogByHash,
  );
  if (rows.length === 0) return null;
  const source =
    rows
      .flatMap((row) => Object.values(row.pieces))
      .find((piece) => piece?.source)?.source ?? "";
  const isOrnament = itemType === "Ornament";
  return {
    setName,
    displayName: isOrnament ? `${setName} ornaments` : undefined,
    kind: isOrnament ? "ornament" : "armor",
    seasonLabel: hub.seasonLabel,
    seasonNumber: hub.seasonNumber,
    previewFile: resolveArmorSetPreviewFile(setName, source),
    rows,
  };
}

function collectProgressFromGroups(
  groups: LegacyArmorSetGroup[],
  catalogByHash: Map<string, AllLootItem>,
  progressOwnershipGroups: string[][],
) {
  for (const group of groups) {
    for (const row of group.rows) {
      for (const piece of Object.values(row.pieces)) {
        if (!piece) continue;
        const catalogItem = catalogByHash.get(piece.itemHash);
        if (!isObtainableCatalogItem(catalogItem)) continue;
        progressOwnershipGroups.push(ownershipGroup(piece));
      }
    }
  }
}

export async function resolveSeasonLoot(hub: SeasonHub): Promise<SeasonLoot> {
  const catalog = await loadAllLootCatalog();
  const catalogItems = catalog.items;
  const catalogByHash = indexCatalogByAnyHash(catalogItems);

  const ornamentsByArmorSet = new Map<string, LegacyArmorSetGroup[]>();
  for (const ornament of hub.ornamentSets ?? []) {
    const group = buildNamedSetGroup(
      catalogItems,
      catalogByHash,
      ornament.setName,
      "Ornament",
      hub,
    );
    if (!group) continue;
    const bucket = ornamentsByArmorSet.get(ornament.armorSetName) ?? [];
    bucket.push(group);
    ornamentsByArmorSet.set(ornament.armorSetName, bucket);
  }

  const armorGroups: LegacyArmorSetGroup[] = [];
  for (const setName of hub.armorSetNames) {
    const group = buildNamedSetGroup(
      catalogItems,
      catalogByHash,
      setName,
      "Armor",
      hub,
    );
    if (!group) continue;
    armorGroups.push(group);
    const ornaments = ornamentsByArmorSet.get(setName);
    if (ornaments?.length) {
      armorGroups.push(...ornaments);
      ornamentsByArmorSet.delete(setName);
    }
  }
  for (const leftover of ornamentsByArmorSet.values()) {
    armorGroups.push(...leftover);
  }

  const weapons = catalogItems
    .filter((item) => isSeasonWeapon(item, hub))
    .map((item) => toLootItemFromCatalog(item));

  const weaponPools = buildWeaponPools(weapons, hub);

  const exoticItems = hub.exoticItemNames
    .map((name) => catalogItems.find((item) => item.name === name))
    .filter((item): item is AllLootItem => Boolean(item))
    .map((item) => toLootItemFromCatalog(item));

  const progressOwnershipGroups: string[][] = [];
  collectProgressFromGroups(armorGroups, catalogByHash, progressOwnershipGroups);

  for (const pool of weaponPools) {
    for (const weapon of pool.weapons) {
      const catalogItem = catalogByHash.get(weapon.itemHash);
      if (!isObtainableCatalogItem(catalogItem)) continue;
      progressOwnershipGroups.push(ownershipGroup(weapon));
    }
  }

  for (const exotic of exoticItems) {
    const catalogItem = catalogByHash.get(exotic.itemHash);
    if (!isObtainableCatalogItem(catalogItem)) continue;
    progressOwnershipGroups.push(ownershipGroup(exotic));
  }

  const cosmeticItems = (hub.cosmeticRewards ?? [])
    .map((name) => catalogItems.find((item) => item.name === name))
    .filter((item): item is AllLootItem => Boolean(item))
    .map((item) => toLootItemFromCatalog(item));

  for (const cosmetic of cosmeticItems) {
    // Season Archive reclaimables count even when catalog marks them unobtainable.
    progressOwnershipGroups.push(ownershipGroup(cosmetic));
  }

  return {
    armorGroups,
    weaponPools,
    exoticItems,
    cosmeticItems,
    progressOwnershipGroups,
    progressTotal: progressOwnershipGroups.length,
  };
}
