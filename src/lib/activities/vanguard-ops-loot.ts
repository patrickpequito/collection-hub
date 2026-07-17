import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildArmorRowsFromCatalogItems,
  buildArmorRowsFromSet,
  buildPartialArmorRowsFromCatalogItems,
} from "@/lib/activities/armor-rows";
import { groupActivityCosmeticLoot } from "@/lib/activities/cosmetic-loot-sections";
import { resolveYearOfProphecyArmorGroups } from "@/lib/activities/year-of-prophecy-armor-loot";
import { resolveIntroductionSeasonFromItems } from "@/lib/activities/legacy-armor-season";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import {
  VANGUARD_OPS_HUB,
  VANGUARD_OPS_CURRENT_ARMOR_SETS,
  LEGACY_VANGUARD_CLASS_ITEMS,
  LEGACY_VANGUARD_CROSS_CLASS_SETS,
} from "@/data/activities/vanguard-ops";
import type {
  ActivityCurrentArmorPanel,
  LegacyArmorSetGroup,
  ResolvedActivityHubLoot,
} from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import { itemNameBelongsToArmorSet } from "@/lib/armor-sets/named-set-match";
import type { ArmorSet } from "@/types/armor-set";
import type { ArmorSetBonusCatalog } from "@/types/armor-set-bonuses";

function isVanguardOpsSource(source = ""): boolean {
  if (/vanguard ops, crucible, or gambit/i.test(source)) return false;
  return /complete strikes and earn rank-up packages from commander zavala|commander zavala|zavala rank up reputation/i.test(
    source,
  );
}

function toLootItem(item: AllLootItem): LootItem {
  return toLootItemFromCatalog(item);
}

async function loadArmorSetBonusNames(): Promise<Map<string, string>> {
  const filePath = path.join(
    process.cwd(),
    "data/armor-set-bonuses.json",
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
      / (Helm|Helmet|Gauntlets|Gloves|Grips|Plate|Chest|Rig|Robe|Robes|Vest|Greaves|Strides|Boots|Leg|Mark|Cloak|Bond|Cover|Mask|Cowl|Hood|Casque|Cuirass|Sleeves)$/i,
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

function resolveSeasonFromItems(
  items: AllLootItem[],
  setName?: string,
): {
  seasonLabel?: string;
  seasonNumber: number;
} {
  return resolveIntroductionSeasonFromItems(items, setName);
}

function collectCatalogItemsForLegacySet(
  setName: string,
  armorItems: AllLootItem[],
): AllLootItem[] {
  const crossClassPrefixes = LEGACY_VANGUARD_CROSS_CLASS_SETS[setName];
  if (crossClassPrefixes) {
    const items: AllLootItem[] = [];
    const seen = new Set<string>();

    for (const prefix of Object.values(crossClassPrefixes)) {
      if (!prefix) continue;
      const matches = armorItems.filter(
        (item) => item.name === prefix || item.name.startsWith(`${prefix} `),
      );
      for (const item of matches) {
        if (seen.has(item.itemHash)) continue;
        items.push(item);
        seen.add(item.itemHash);
      }
    }

    const classItemNames = LEGACY_VANGUARD_CLASS_ITEMS[setName];
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

  return armorItems.filter((item) =>
    itemNameBelongsToArmorSet(item.name, setName),
  );
}

function seasonForArmorSetName(
  setName: string,
  armorItems: AllLootItem[],
): { seasonLabel?: string; seasonNumber: number } {
  return resolveSeasonFromItems(
    collectCatalogItemsForLegacySet(setName, armorItems),
    setName,
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

  for (const [, items] of byHash) {
    const hash = items[0]?.equipableItemSetHash;
    const setName = hash ? setNamesByHash.get(hash) : undefined;
    if (!setName || isExcludedLegacyName(setName, excluded)) continue;

    const rows = buildArmorRowsFromCatalogItems(items, setName);
    if (rows.length > 0) {
      const { seasonLabel, seasonNumber } = resolveSeasonFromItems(items, setName);
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

function resolveVanguardOpsWeapons(items: AllLootItem[]): LootItem[] {
  const byName = new Map<string, AllLootItem>();

  for (const item of items) {
    if (item.type !== "Weapon" || !item.obtainable) continue;
    if (!byName.has(item.name)) {
      byName.set(item.name, item);
    }
  }

  return [...byName.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toLootItem);
}

function buildCurrentArmorPanel(
  catalogItems: AllLootItem[],
  setHash: string,
  bonusNames: Map<string, string>,
  previewFiles?: string[],
): ActivityCurrentArmorPanel {
  const items = catalogItems.filter(
    (item) =>
      item.type === "Armor" &&
      item.rarity !== "Exotic" &&
      item.equipableItemSetHash === setHash,
  );
  const setName = bonusNames.get(setHash) ?? "Current set";

  return {
    armorRows: buildArmorRowsFromCatalogItems(items, setName),
    previewFiles,
  };
}

export async function resolveVanguardOpsLoot(): Promise<ResolvedActivityHubLoot> {
  const [lootCatalog, armorCatalog, bonusNames] = await Promise.all([
    loadAllLootCatalog(),
    loadArmorSetCatalog(),
    loadArmorSetBonusNames(),
  ]);

  const vanguardItems = lootCatalog.items.filter((item) =>
    isVanguardOpsSource(item.source),
  );
  const setNamesByHash = buildSetNameIndex(vanguardItems, bonusNames);
  const excludedLegacy = new Set(VANGUARD_OPS_HUB.excludeLegacySetNames ?? []);
  const currentHashes = new Set(VANGUARD_OPS_HUB.currentArmorSetHashes);

  const vanguardArmor = vanguardItems.filter(
    (item) => item.type === "Armor" && item.rarity !== "Exotic",
  );

  const currentArmorPanels = VANGUARD_OPS_CURRENT_ARMOR_SETS.map((set) =>
    buildCurrentArmorPanel(
      lootCatalog.items,
      set.hash,
      bonusNames,
      [set.previewFile],
    ),
  );

  const currentArmorRows =
    currentArmorPanels[currentArmorPanels.length - 1]?.armorRows ?? [];

  const catalogLegacyGroups = legacyGroupsFromCatalog(
    vanguardArmor,
    setNamesByHash,
    currentHashes,
    excludedLegacy,
  );

  const coveredKeys = new Set(
    catalogLegacyGroups.map((group) => normalizeLegacySetKey(group.setName)),
  );

  const legacyArmorSets = armorCatalog.sets.filter((set) =>
    isVanguardOpsSource(set.source),
  );

  const configuredLegacySetNames = Object.keys(LEGACY_VANGUARD_CROSS_CLASS_SETS);
  const catalogLegacySetNames = legacyArmorSets.map((set) => set.name);
  const legacySetNames = [
    ...new Set([...configuredLegacySetNames, ...catalogLegacySetNames]),
  ];

  const catalogByNameGroups = legacyGroupsFromCatalogBySetName(
    vanguardArmor,
    legacySetNames,
    excludedLegacy,
    coveredKeys,
  );

  for (const group of catalogByNameGroups) {
    coveredKeys.add(normalizeLegacySetKey(group.setName));
  }

  const armorSetLegacyGroups = legacyGroupsFromArmorSets(
    legacyArmorSets,
    vanguardArmor,
    excludedLegacy,
    coveredKeys,
  );

  const legacyArmorGroups = sortLegacyGroupsNewestFirst([
    ...catalogLegacyGroups,
    ...catalogByNameGroups,
    ...armorSetLegacyGroups,
  ]);

  const currentOtherSections = groupActivityCosmeticLoot(
    vanguardItems.filter(
      (item) =>
        item.obtainable &&
        item.type !== "Weapon" &&
        item.type !== "Armor",
    ),
    toLootItem,
  );

  const currentWeapons = resolveVanguardOpsWeapons(vanguardItems);

  const yearOfProphecyArmorGroups = resolveYearOfProphecyArmorGroups(
    lootCatalog.items.filter((item) => item.type === "Armor"),
  );

  return {
    currentArmorRows,
    currentArmorPanels,
    currentWeapons,
    currentOtherSections,
    legacyArmorGroups,
    yearOfProphecyArmorGroups,
  };
}
