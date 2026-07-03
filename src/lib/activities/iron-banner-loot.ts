import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildArmorRowsFromCatalogItems,
  buildArmorRowsFromSet,
  buildPartialArmorRowsFromCatalogItems,
} from "@/lib/activities/armor-rows";
import { groupActivityCosmeticLoot } from "@/lib/activities/cosmetic-loot-sections";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import {
  IRON_BANNER_ACTIVE_WEAPON_POOL_ID,
  IRON_BANNER_HUB,
  IRON_BANNER_WEAPON_POOLS,
  LEGACY_IRON_BANNER_CLASS_ITEMS,
} from "@/data/activities/iron-banner";
import type {
  ActivityWeaponPool,
  LegacyArmorSetGroup,
  ResolvedActivityHubLoot,
} from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSet } from "@/types/armor-set";
import type { ArmorSetBonusCatalog } from "@/types/armor-set-bonuses";

function isIronBannerSource(source = ""): boolean {
  return /iron banner/i.test(source);
}

function toLootItem(item: AllLootItem): LootItem {
  return toLootItemFromCatalog(item);
}

async function loadArmorSetBonusNames(): Promise<Map<string, string>> {
  const filePath = path.join(
    process.cwd(),
    "public/data/armor-set-bonuses.json",
  );
  const raw = await readFile(filePath, "utf8");
  const catalog = JSON.parse(raw) as ArmorSetBonusCatalog;
  const index = new Map<string, string>();
  for (const [hash, entry] of Object.entries(catalog.sets)) {
    index.set(hash, entry.setName);
  }
  return index;
}

function buildSetNameIndex(
  items: AllLootItem[],
  bonusNames: Map<string, string>,
): Map<string, string> {
  const index = new Map<string, string>();
  for (const item of items) {
    const hash = item.equipableItemSetHash;
    if (!hash || index.has(hash)) continue;
    const fromBonuses = bonusNames.get(hash);
    if (fromBonuses) {
      index.set(hash, fromBonuses);
      continue;
    }
    const trimmed = item.name.replace(
      / (Helm|Helmet|Gauntlets|Gloves|Grips|Plate|Chest|Rig|Robe|Robes|Vest|Greaves|Strides|Boots|Leg|Mark|Cloak|Bond|Cover|Mask|Cowl|Hood)$/i,
      "",
    );
    index.set(hash, trimmed);
  }
  return index;
}

function normalizeLegacySetKey(setName: string): string {
  return setName.replace(/\s+set$/i, "").trim().toLowerCase();
}

function isExcludedLegacyName(
  setName: string,
  excluded: ReadonlySet<string>,
): boolean {
  const key = normalizeLegacySetKey(setName);
  return [...excluded].some(
    (name) =>
      key === normalizeLegacySetKey(name) ||
      setName === name ||
      setName.startsWith(`${name} `),
  );
}

function isCoveredLegacySet(
  setName: string,
  coveredKeys: ReadonlySet<string>,
): boolean {
  return coveredKeys.has(normalizeLegacySetKey(setName));
}

function resolveSeasonFromItems(items: AllLootItem[]): {
  seasonLabel?: string;
  seasonNumber: number;
} {
  let seasonNumber = 0;
  let seasonLabel: string | undefined;

  for (const item of items) {
    const number = item.seasonNumber ?? 0;
    if (number >= seasonNumber) {
      seasonNumber = number;
      seasonLabel = item.seasonLabel;
    }
  }

  return { seasonLabel, seasonNumber };
}

function collectCatalogItemsForLegacySet(
  setName: string,
  armorItems: AllLootItem[],
): AllLootItem[] {
  const prefix = `${setName} `;
  const items = armorItems.filter(
    (item) => item.name === setName || item.name.startsWith(prefix),
  );
  const seen = new Set(items.map((item) => item.itemHash));
  const classItemNames = LEGACY_IRON_BANNER_CLASS_ITEMS[setName];

  if (classItemNames) {
    for (const name of Object.values(classItemNames)) {
      const classItem = armorItems.find((item) => item.name === name);
      if (classItem && !seen.has(classItem.itemHash)) {
        items.push(classItem);
        seen.add(classItem.itemHash);
      }
    }
  }

  return items;
}

function seasonForArmorSetName(
  setName: string,
  armorItems: AllLootItem[],
): { seasonLabel?: string; seasonNumber: number } {
  return resolveSeasonFromItems(
    collectCatalogItemsForLegacySet(setName, armorItems),
  );
}

function sortLegacyGroupsNewestFirst(
  groups: LegacyArmorSetGroup[],
): LegacyArmorSetGroup[] {
  return [...groups].sort(
    (a, b) =>
      (b.seasonNumber ?? 0) - (a.seasonNumber ?? 0) ||
      a.setName.localeCompare(b.setName),
  );
}

function legacyGroupsFromCatalog(
  armorItems: AllLootItem[],
  setNamesByHash: Map<string, string>,
  currentHashes: ReadonlySet<string>,
  excluded: ReadonlySet<string>,
): LegacyArmorSetGroup[] {
  const byHash = new Map<string, AllLootItem[]>();

  for (const item of armorItems) {
    const hash = item.equipableItemSetHash;
    if (!hash || currentHashes.has(hash)) continue;
    const bucket = byHash.get(hash) ?? [];
    bucket.push(item);
    byHash.set(hash, bucket);
  }

  const groups: LegacyArmorSetGroup[] = [];

  for (const [hash, items] of byHash) {
    const setName = setNamesByHash.get(hash);
    if (!setName || isExcludedLegacyName(setName, excluded)) continue;

    const rows = buildArmorRowsFromCatalogItems(items, setName);
    if (rows.length > 0) {
      const { seasonLabel, seasonNumber } = resolveSeasonFromItems(items);
      groups.push({ setName, seasonLabel, seasonNumber, rows });
    }
  }

  return groups;
}

function legacyGroupsFromCatalogBySetName(
  armorItems: AllLootItem[],
  legacySetNames: string[],
  excluded: ReadonlySet<string>,
  coveredKeys: ReadonlySet<string>,
): LegacyArmorSetGroup[] {
  const groups: LegacyArmorSetGroup[] = [];

  for (const setName of legacySetNames) {
    if (isExcludedLegacyName(setName, excluded)) continue;
    if (isCoveredLegacySet(setName, coveredKeys)) continue;

    const items = collectCatalogItemsForLegacySet(setName, armorItems);
    if (items.length === 0) continue;

    const rows = buildPartialArmorRowsFromCatalogItems(items, setName);
    if (rows.length === 0) continue;

    const { seasonLabel, seasonNumber } = seasonForArmorSetName(
      setName,
      armorItems,
    );
    groups.push({ setName, seasonLabel, seasonNumber, rows });
  }

  return groups;
}

function legacyGroupsFromArmorSets(
  sets: ArmorSet[],
  armorItems: AllLootItem[],
  excluded: ReadonlySet<string>,
  coveredKeys: ReadonlySet<string>,
): LegacyArmorSetGroup[] {
  return sets
    .filter(
      (set) =>
        !isExcludedLegacyName(set.name, excluded) &&
        !isCoveredLegacySet(set.name, coveredKeys),
    )
    .map((set) => {
      const { seasonLabel, seasonNumber } = seasonForArmorSetName(
        set.name,
        armorItems,
      );
      return {
        setName: set.name,
        seasonLabel,
        seasonNumber,
        rows: buildArmorRowsFromSet(set),
      };
    })
    .filter((group) => group.rows.length > 0);
}

function resolveWeaponsByName(
  weaponNames: readonly string[],
  catalogItems: AllLootItem[],
): LootItem[] {
  const weaponsByName = new Map(
    catalogItems
      .filter((item) => item.type === "Weapon")
      .map((item) => [item.name, item]),
  );

  return weaponNames.flatMap((name) => {
    const item = weaponsByName.get(name);
    return item ? [toLootItem(item)] : [];
  });
}

function resolveIronBannerWeaponPools(
  catalogItems: AllLootItem[],
): ActivityWeaponPool[] {
  return IRON_BANNER_WEAPON_POOLS.map((pool) => ({
    id: pool.id,
    label: pool.label,
    isActive: pool.id === IRON_BANNER_ACTIVE_WEAPON_POOL_ID,
    items: resolveWeaponsByName(pool.weaponNames, catalogItems),
  }));
}

export async function resolveIronBannerLoot(): Promise<ResolvedActivityHubLoot> {
  const [lootCatalog, armorCatalog, bonusNames] = await Promise.all([
    loadAllLootCatalog(),
    loadArmorSetCatalog(),
    loadArmorSetBonusNames(),
  ]);

  const ironBannerItems = lootCatalog.items.filter((item) =>
    isIronBannerSource(item.source),
  );
  const setNamesByHash = buildSetNameIndex(ironBannerItems, bonusNames);
  const excludedLegacy = new Set(IRON_BANNER_HUB.excludeLegacySetNames ?? []);
  const currentHashes = new Set(IRON_BANNER_HUB.currentArmorSetHashes);

  const ironBannerArmor = ironBannerItems.filter(
    (item) => item.type === "Armor" && item.rarity !== "Exotic",
  );

  const currentArmorItems = ironBannerArmor.filter(
    (item) =>
      item.equipableItemSetHash &&
      currentHashes.has(item.equipableItemSetHash),
  );

  const currentSetName =
    setNamesByHash.get(IRON_BANNER_HUB.currentArmorSetHashes[0] ?? "") ??
    "Current set";

  const currentArmorRows = buildArmorRowsFromCatalogItems(
    currentArmorItems,
    currentSetName,
  );

  const catalogLegacyGroups = legacyGroupsFromCatalog(
    ironBannerArmor,
    setNamesByHash,
    currentHashes,
    excludedLegacy,
  );

  const coveredKeys = new Set(
    catalogLegacyGroups.map((group) => normalizeLegacySetKey(group.setName)),
  );

  const legacyArmorSets = armorCatalog.sets.filter((set) =>
    isIronBannerSource(set.source),
  );

  const catalogByNameGroups = legacyGroupsFromCatalogBySetName(
    ironBannerArmor,
    legacyArmorSets.map((set) => set.name),
    excludedLegacy,
    coveredKeys,
  );

  for (const group of catalogByNameGroups) {
    coveredKeys.add(normalizeLegacySetKey(group.setName));
  }

  const armorSetLegacyGroups = legacyGroupsFromArmorSets(
    legacyArmorSets,
    ironBannerArmor,
    excludedLegacy,
    coveredKeys,
  );

  const legacyArmorGroups = sortLegacyGroupsNewestFirst([
    ...catalogLegacyGroups,
    ...catalogByNameGroups,
    ...armorSetLegacyGroups,
  ]);

  const currentWeaponPools = resolveIronBannerWeaponPools(lootCatalog.items);

  const currentOtherSections = groupActivityCosmeticLoot(
    ironBannerItems.filter(
      (item) =>
        item.obtainable &&
        item.type !== "Weapon" &&
        item.type !== "Armor",
    ),
    toLootItem,
  );

  return {
    currentArmorRows,
    currentWeaponPools,
    currentOtherSections,
    legacyArmorGroups,
  };
}
