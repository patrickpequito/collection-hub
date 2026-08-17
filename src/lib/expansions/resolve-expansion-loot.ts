import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildArmorRowsFromCatalogItems,
  buildArmorRowsFromSet,
  buildPartialArmorRowsFromCatalogItems,
} from "@/lib/activities/armor-rows";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import type { ExpansionHub } from "@/data/expansions/types";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import {
  extractLegendaryArmorSetName,
  itemNameBelongsToArmorSet,
} from "@/lib/armor-sets/named-set-match";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import type {
  ActivityHubLootSection,
  LegacyArmorSetGroup,
} from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSet } from "@/types/armor-set";

const ADEPT = /\(adept\)/i;

const EXPANSION_OTHER_SECTION_TYPES = [
  { type: "Emblem", title: "Emblems" },
  { type: "Shader", title: "Shaders" },
  { type: "Ghost Shell", title: "Ghost Shells" },
  { type: "Ship", title: "Ships" },
  { type: "Sparrow", title: "Sparrows" },
  { type: "Ornament", title: "Ornaments" },
  { type: "Ghost Projection", title: "Ghost Projections" },
  { type: "Emote", title: "Emotes" },
  { type: "Transmat Effect", title: "Transmat Effects" },
] as const;

export type ExpansionCollectionSection = "armor" | "weapons" | "other";

export type ExpansionCollectionItem = LootItem & {
  section: ExpansionCollectionSection;
  rarity?: string;
  itemTypeDisplayName?: string;
};

export type ExpansionDeepLootPool = {
  id: string;
  title: string;
  armorGroups: LegacyArmorSetGroup[];
  weapons: LootItem[];
  otherSections: ActivityHubLootSection[];
};

export type ExpansionCollectionMeta = {
  badgeName: string;
  iconPath: string;
  bannerIconPath: string;
  completionRecordHash: string;
};

export type ExpansionRegionChest = {
  entryHash: string;
  label: string;
};

export type ExpansionLostSector = {
  name: string;
  checklistEntryHash: string;
  discoveryObjectiveHash: string;
  expertRecordHash: string;
  masterRecordHash: string;
  /** Hardest available clear — Flawless Solo Mastery (no dedicated GM triumph). */
  grandmasterRecordHash: string;
};

export type ExpansionWellspringBoss = {
  name: string;
  normalObjectiveHash: string;
  masterObjectiveHash: string;
};

export type ExpansionCampaignMission = {
  name: string;
  normalRecordHash: string | null;
  legendObjectiveHash: string;
};

type ExpansionCollectionFile = {
  badgeName?: string;
  iconPath?: string;
  bannerIconPath?: string;
  completionRecordHash?: string;
  items?: Array<{
    itemHash: string;
    collectibleHash: string;
    name: string;
    iconPath: string;
    itemTypeDisplayName: string;
    rarity: string;
    section: ExpansionCollectionSection;
    source: string;
  }>;
  regionChests?: {
    checklistHash: string;
    triumphHash?: string;
    entries: ExpansionRegionChest[];
  };
  lostSectors?: {
    checklistHash: string;
    discoveryRecordHash: string;
    sectors: ExpansionLostSector[];
  };
  wellspring?: {
    normalRecordHash: string;
    masterRecordHash: string;
    bosses: ExpansionWellspringBoss[];
  };
  campaign?: {
    legendaryRecordHash: string;
    missions: ExpansionCampaignMission[];
  };
};

export type ExpansionLoot = {
  collectionMeta: ExpansionCollectionMeta;
  collectionItems: ExpansionCollectionItem[];
  exoticItems: LootItem[];
  destinationArmorRows: ActivityArmorRow[];
  destinationWeapons: LootItem[];
  deepLootPools: ExpansionDeepLootPool[];
  regionChestsChecklistHash: string;
  regionChests: ExpansionRegionChest[];
  lostSectorsChecklistHash: string;
  lostSectorsDiscoveryRecordHash: string;
  lostSectors: ExpansionLostSector[];
  wellspringNormalRecordHash: string;
  wellspringMasterRecordHash: string;
  wellspringBosses: ExpansionWellspringBoss[];
  campaignLegendaryRecordHash: string;
  campaignMissions: ExpansionCampaignMission[];
  lootItemCount: number;
  lootItemHashes: string[];
  collectionHashes: string[];
};

function normalizeIconHash(hash: string): string {
  return hash.replace(/\.png$/i, "");
}

function pathHasSeasonIcon(
  iconPath: string | undefined,
  hashes: readonly string[],
): boolean {
  if (!iconPath) return false;
  return hashes.some((hash) =>
    iconPath.includes(normalizeIconHash(hash)),
  );
}

function hasHubSeasonIcon(item: AllLootItem, hub: ExpansionHub): boolean {
  if (pathHasSeasonIcon(item.seasonIconPath, hub.seasonIconHashes)) {
    return true;
  }
  return (item.versions ?? []).some((version) =>
    pathHasSeasonIcon(version.seasonIconPath, hub.seasonIconHashes),
  );
}

function isExcludedFromHub(item: AllLootItem, hub: ExpansionHub): boolean {
  for (const pattern of hub.excludedNamePatterns ?? []) {
    if (pattern.test(item.name)) return true;
  }
  if (
    hub.excludedSeasonLabels?.includes(item.seasonLabel ?? "")
  ) {
    return true;
  }
  const source = item.source ?? "";
  for (const pattern of hub.excludedSourcePatterns ?? []) {
    if (pattern.test(source)) return true;
  }
  return false;
}

function isHubChapterItem(item: AllLootItem, hub: ExpansionHub): boolean {
  if (isExcludedFromHub(item, hub)) return false;
  if (hub.seasonLabels.includes(item.seasonLabel ?? "")) return true;
  if (hasHubSeasonIcon(item, hub)) return true;
  // Remasters keep Monument/EoF as primary but retain an expansion version row.
  return (item.versions ?? []).some((version) =>
    hub.seasonLabels.includes(version.seasonLabel ?? ""),
  );
}

function isHubEraExotic(item: AllLootItem, hub: ExpansionHub): boolean {
  if (item.rarity !== "Exotic") return false;
  if (item.type !== "Weapon" && item.type !== "Armor") return false;
  if (hub.exoticExcludedNames?.includes(item.name)) return false;
  if (
    hub.exoticExcludedSourcePattern?.test(item.source ?? "")
  ) {
    return false;
  }
  if (hasHubSeasonIcon(item, hub)) return true;
  if (hub.seasonLabels.includes(item.seasonLabel ?? "")) return true;
  if (hub.exoticQuestSourcePattern?.test(item.source ?? "")) return true;
  return (item.versions ?? []).some((version) =>
    hub.seasonLabels.includes(version.seasonLabel ?? ""),
  );
}

function forcedDeepLootPoolId(
  item: AllLootItem,
  hub: ExpansionHub,
): string | undefined {
  if (item.type !== "Weapon") return undefined;
  return hub.deepLootWeaponPoolByName?.[item.name];
}

function groupExpansionOtherLoot(items: AllLootItem[]): ActivityHubLootSection[] {
  const byType = new Map<string, LootItem[]>();
  for (const item of items) {
    const bucket = byType.get(item.type) ?? [];
    bucket.push(toLootItemFromCatalog(item));
    byType.set(item.type, bucket);
  }

  const known = new Set(
    EXPANSION_OTHER_SECTION_TYPES.map((section) => section.type),
  );
  const sections: ActivityHubLootSection[] = EXPANSION_OTHER_SECTION_TYPES.map(
    ({ type, title }) => ({
      title,
      items: (byType.get(type) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }),
  ).filter((section) => section.items.length > 0);

  const leftover = [...byType.entries()]
    .filter(
      ([type]) =>
        !known.has(
          type as (typeof EXPANSION_OTHER_SECTION_TYPES)[number]["type"],
        ),
    )
    .flatMap(([, list]) => list)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (leftover.length) {
    sections.push({ title: "Other", items: leftover });
  }
  return sections;
}

function isDeepLootGearItem(item: AllLootItem): boolean {
  if (item.type === "Armor" || item.type === "Weapon") {
    return item.rarity === "Legendary";
  }
  return true;
}

function buildDeepLootArmorGroups(
  armorItems: AllLootItem[],
  catalogItems: AllLootItem[],
  catalogByHash: Map<string, AllLootItem>,
  hub: ExpansionHub,
): LegacyArmorSetGroup[] {
  const setNames = new Set<string>();
  for (const item of armorItems) {
    const extracted = extractLegendaryArmorSetName(item.name);
    if (extracted) setNames.add(extracted);
  }

  const primarySeasonLabel = hub.seasonLabels[0] ?? hub.title;
  const groups: LegacyArmorSetGroup[] = [];
  for (const setName of [...setNames].sort((a, b) => a.localeCompare(b))) {
    // Prefer all-loot pieces over armor-sets.json — Bungie equipable sets often
    // wire the wrong universal class items for playlist armor.
    const matching = catalogItems.filter(
      (item) =>
        item.type === "Armor" &&
        item.rarity === "Legendary" &&
        isHubChapterItem(item, hub) &&
        itemNameBelongsToArmorSet(item.name, setName),
    );
    const rows = enrichArmorRowsWithOwnership(
      buildPartialArmorRowsFromCatalogItems(matching, setName),
      catalogByHash,
    );
    if (rows.length === 0) continue;
    const source =
      rows
        .flatMap((row) => Object.values(row.pieces))
        .find((piece) => piece?.source)?.source ?? "";
    groups.push({
      setName,
      seasonLabel: primarySeasonLabel,
      seasonNumber: hub.seasonNumber,
      previewFile: resolveArmorSetPreviewFile(setName, source),
      rows,
    });
  }
  return groups;
}

function collectPoolHashes(pool: ExpansionDeepLootPool): string[] {
  const hashes: string[] = [];
  for (const group of pool.armorGroups) {
    for (const row of group.rows) {
      for (const piece of Object.values(row.pieces)) {
        if (!piece) continue;
        hashes.push(...(piece.ownershipHashes ?? [piece.itemHash]));
      }
    }
  }
  for (const item of [
    ...pool.weapons,
    ...pool.otherSections.flatMap((section) => section.items),
  ]) {
    hashes.push(...(item.ownershipHashes ?? [item.itemHash]));
  }
  return hashes;
}

function findArmorSet(sets: ArmorSet[], name: string): ArmorSet | undefined {
  return sets.find((set) => set.name === name);
}

function enrichArmorRowsWithOwnership(
  rows: ActivityArmorRow[],
  catalogByHash: Map<string, AllLootItem>,
): ActivityArmorRow[] {
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

function emptyCollectionFile(): ExpansionCollectionFile {
  return {
    badgeName: "",
    iconPath: "",
    bannerIconPath: "",
    completionRecordHash: "",
    items: [],
    regionChests: { checklistHash: "", entries: [] },
    lostSectors: {
      checklistHash: "",
      discoveryRecordHash: "",
      sectors: [],
    },
    wellspring: {
      normalRecordHash: "",
      masterRecordHash: "",
      bosses: [],
    },
    campaign: { legendaryRecordHash: "", missions: [] },
  };
}

async function loadCollectionFile(
  slug: string,
): Promise<ExpansionCollectionFile> {
  const filePath = path.join(
    process.cwd(),
    `data/expansions/${slug}-collection.json`,
  );
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as ExpansionCollectionFile;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return emptyCollectionFile();
    }
    throw error;
  }
}

function isDestinationWeapon(
  item: AllLootItem,
  hub: ExpansionHub,
): boolean {
  if (item.type !== "Weapon") return false;
  if (ADEPT.test(item.name)) return false;
  if (!isHubChapterItem(item, hub)) return false;
  if (hub.destinationWeaponSourcePattern.test(item.source ?? "")) {
    return true;
  }
  return (hub.destinationWeaponExtraNames ?? []).includes(item.name);
}

export async function resolveExpansionLoot(
  hub: ExpansionHub,
): Promise<ExpansionLoot> {
  const [catalog, armorCatalog, collectionFile] = await Promise.all([
    loadAllLootCatalog(),
    loadArmorSetCatalog(),
    loadCollectionFile(hub.slug),
  ]);

  const items = catalog.items;
  const catalogByHash = indexCatalogByAnyHash(items);
  const destinationExtraNames = new Set(hub.destinationWeaponExtraNames ?? []);
  const raidDungeonExcluded = new Set(
    hub.raidDungeonDeepLootExcludedNames ?? [],
  );

  const collectionItems: ExpansionCollectionItem[] = (
    collectionFile.items ?? []
  ).map((entry) => {
    const catalogItem = catalogByHash.get(entry.itemHash);
    if (catalogItem) {
      return {
        ...toLootItemFromCatalog(catalogItem),
        section: entry.section,
        rarity: entry.rarity || catalogItem.rarity,
        itemTypeDisplayName: entry.itemTypeDisplayName,
      };
    }
    return {
      itemHash: entry.itemHash,
      name: entry.name,
      iconPath: entry.iconPath,
      source: entry.source,
      ownershipHashes: [entry.itemHash],
      section: entry.section,
      rarity: entry.rarity,
      itemTypeDisplayName: entry.itemTypeDisplayName,
    };
  });

  const exoticItems = items
    .filter((item) => isHubEraExotic(item, hub))
    .sort((a, b) => {
      const typeOrder = a.type === b.type ? 0 : a.type === "Weapon" ? -1 : 1;
      return typeOrder || a.name.localeCompare(b.name);
    })
    .map(toLootItemFromCatalog);

  const destinationArmorRows: ActivityArmorRow[] = [];
  for (const setName of hub.destinationArmorSetNames) {
    const set = findArmorSet(armorCatalog.sets, setName);
    if (set) {
      destinationArmorRows.push(
        ...enrichArmorRowsWithOwnership(
          buildArmorRowsFromSet(set),
          catalogByHash,
        ),
      );
      continue;
    }
    const matching = items.filter(
      (item) =>
        item.type === "Armor" &&
        (item.name === setName || item.name.startsWith(`${setName} `)),
    );
    if (matching.length) {
      destinationArmorRows.push(
        ...enrichArmorRowsWithOwnership(
          buildArmorRowsFromCatalogItems(matching, setName),
          catalogByHash,
        ),
      );
    }
  }

  const destinationWeapons = items
    .filter((item) => isDestinationWeapon(item, hub))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toLootItemFromCatalog);

  const deepLootPools: ExpansionDeepLootPool[] = [];
  const claimedHashes = new Set<string>();

  const claimItems = (poolItems: AllLootItem[]) => {
    for (const item of poolItems) {
      for (const hash of collectAllLootItemHashes(item)) {
        claimedHashes.add(hash);
      }
    }
  };

  // Destination weapons should not also appear in Deep Loot.
  claimItems(items.filter((item) => isDestinationWeapon(item, hub)));

  const buildPool = (
    id: string,
    title: string,
    poolItems: AllLootItem[],
  ): ExpansionDeepLootPool | null => {
    const armorItems = poolItems.filter((item) => item.type === "Armor");
    const weapons = poolItems
      .filter((item) => item.type === "Weapon")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toLootItemFromCatalog);
    const otherItems = poolItems.filter(
      (item) => item.type !== "Armor" && item.type !== "Weapon",
    );
    const armorGroups = buildDeepLootArmorGroups(
      armorItems,
      items,
      catalogByHash,
      hub,
    );
    const otherSections = groupExpansionOtherLoot(otherItems);
    if (armorGroups.length + weapons.length + otherSections.length === 0) {
      return null;
    }
    claimItems(poolItems);
    return { id, title, armorGroups, weapons, otherSections };
  };

  const isDeepLootCandidate = (item: AllLootItem): boolean =>
    isHubChapterItem(item, hub) &&
    isDeepLootGearItem(item) &&
    item.rarity !== "Exotic" &&
    !ADEPT.test(item.name) &&
    !raidDungeonExcluded.has(item.name) &&
    !/eververse|bright engram/i.test(item.source ?? "") &&
    !hub.deepLootExcludedSourcePattern.test(item.source ?? "") &&
    !destinationExtraNames.has(item.name) &&
    ![...collectAllLootItemHashes(item)].some((hash) =>
      claimedHashes.has(hash),
    );

  for (const activity of hub.deepLootActivities) {
    const poolItems = items.filter((item) => {
      if (!isDeepLootCandidate(item)) return false;
      const forcedPool = forcedDeepLootPoolId(item, hub);
      if (forcedPool != null) return forcedPool === activity.id;
      return activity.sourcePattern.test(item.source ?? "");
    });
    const pool = buildPool(activity.id, activity.title, poolItems);
    if (pool) deepLootPools.push(pool);
  }

  const leftoverItems = items.filter((item) => {
    if (!isDeepLootCandidate(item)) return false;
    const forcedPool = forcedDeepLootPoolId(item, hub);
    if (forcedPool != null) return forcedPool === "world-loot";
    return true;
  });
  const worldPool = buildPool("world-loot", "World loot", leftoverItems);
  if (worldPool) deepLootPools.push(worldPool);

  const collectionHashes = collectionItems.flatMap(
    (item) => item.ownershipHashes ?? [item.itemHash],
  );

  const lootHashes = new Set<string>(collectionHashes);
  for (const item of [...exoticItems, ...destinationWeapons]) {
    for (const hash of item.ownershipHashes ?? [item.itemHash]) {
      lootHashes.add(hash);
    }
  }
  for (const pool of deepLootPools) {
    for (const hash of collectPoolHashes(pool)) {
      lootHashes.add(hash);
    }
  }
  for (const row of destinationArmorRows) {
    for (const piece of Object.values(row.pieces)) {
      if (!piece) continue;
      for (const hash of piece.ownershipHashes ?? [piece.itemHash]) {
        lootHashes.add(hash);
      }
    }
  }

  return {
    collectionMeta: {
      badgeName: collectionFile.badgeName ?? "",
      iconPath: collectionFile.iconPath ?? "",
      bannerIconPath: collectionFile.bannerIconPath ?? "",
      completionRecordHash: collectionFile.completionRecordHash ?? "",
    },
    collectionItems,
    exoticItems,
    destinationArmorRows,
    destinationWeapons,
    deepLootPools,
    regionChestsChecklistHash:
      collectionFile.regionChests?.checklistHash ?? "",
    regionChests: collectionFile.regionChests?.entries ?? [],
    lostSectorsChecklistHash: collectionFile.lostSectors?.checklistHash ?? "",
    lostSectorsDiscoveryRecordHash:
      collectionFile.lostSectors?.discoveryRecordHash ?? "",
    lostSectors: collectionFile.lostSectors?.sectors ?? [],
    wellspringNormalRecordHash:
      collectionFile.wellspring?.normalRecordHash ?? "",
    wellspringMasterRecordHash:
      collectionFile.wellspring?.masterRecordHash ?? "",
    wellspringBosses: collectionFile.wellspring?.bosses ?? [],
    campaignLegendaryRecordHash:
      collectionFile.campaign?.legendaryRecordHash ?? "",
    campaignMissions: collectionFile.campaign?.missions ?? [],
    lootItemCount: lootHashes.size,
    lootItemHashes: [...lootHashes],
    collectionHashes,
  };
}
