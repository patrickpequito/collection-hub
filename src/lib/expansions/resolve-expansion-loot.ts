import { readFile } from "node:fs/promises";
import path from "node:path";
import {
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
import {
  findTriumphRecordByHash,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import type { TriumphCatalog } from "@/types/triumph";

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

/** Rotating public-event bosses (e.g. Altars of Sorrow). */
export type ExpansionRotatingBoss = {
  name: string;
  /** Owning this item counts as having cleared this boss. */
  completionItemHash?: string;
  completionItemHashes?: string[];
  /** Optional short reward hint shown beside the name. */
  rewardNote?: string;
};

export type ExpansionRotatingBossActivity = {
  title: string;
  description?: string;
  bosses: ExpansionRotatingBoss[];
};

export type ExpansionCampaignMission = {
  name: string;
  normalRecordHash: string | null;
  legendObjectiveHash: string;
};

export type ExpansionCampaignQuest = {
  name: string;
  /** Triumph record when Bungie tracks completion as a record. */
  recordHash?: string;
  /** Single objective on recordHash that marks this quest done (interval milestones). */
  recordObjectiveHash?: string;
  /** All listed records must be complete (e.g. legacy campaign missions). */
  fallbackRecordHashes?: string[];
  /** When "any", one complete fallback record is enough (class-specific exotics). Default: all. */
  fallbackRecordMatch?: "all" | "any";
  /** Owning this item counts as quest complete (e.g. exotic reward). */
  completionItemHash?: string;
  /** Any owned hash counts as complete (exotic weapon variants). */
  completionItemHashes?: string[];
  /** Root quest item hash for profile quest completion. */
  questHash?: string;
  /** Final quest step hash — used when completed quests leave the active list. */
  completionStepHash?: string;
  /** All quest step hashes that may appear in profile quest progress. */
  questStepHashes?: string[];
  /** Final step objective — persists in uninstancedItemObjectives after completion. */
  completionObjectiveHash?: string;
  /** Every step objective — all must be complete in profile progress. */
  stepObjectiveHashes?: string[];
  iconPath?: string;
};

/** Playlist activity with difficulty tiers (Empire / Nightmare Hunts: 3 in-game). */
export type ExpansionDifficultyHunt = {
  name: string;
  /** Optional triumph that also counts as Hero+ (e.g. Empire Hunt higher-difficulty). */
  higherRecordHash?: string;
  adeptActivityHashes: string[];
  heroActivityHashes: string[];
  legendActivityHashes: string[];
  masterActivityHashes: string[];
  /** When set, UI/progress use these tiers instead of the four legacy buckets. */
  difficultyTiers?: ExpansionHuntDifficultyTier[];
};

export type ExpansionHuntDifficultyTier = {
  label: string;
  activityHashes: string[];
  higherRecordHash?: string;
};

/** @deprecated Use ExpansionDifficultyHunt */
export type ExpansionEmpireHunt = ExpansionDifficultyHunt;

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
    quests?: ExpansionCampaignQuest[];
    /** Empire Hunts, Nightmare Hunts, etc. */
    difficultyHunts?: ExpansionDifficultyHunt[];
    /** Section heading for difficultyHunts (default: "Difficulty activities"). */
    difficultyHuntsTitle?: string;
    /** Override for the panel heading (e.g. "Campaign & Activities"). */
    sectionTitle?: string;
    /** Rotating public-event bosses nested under the campaign panel. */
    rotatingBossActivity?: ExpansionRotatingBossActivity;
    /** @deprecated Prefer difficultyHunts */
    empireHunts?: ExpansionDifficultyHunt[];
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
  campaignQuests: ExpansionCampaignQuest[];
  difficultyHunts: ExpansionDifficultyHunt[];
  difficultyHuntsTitle: string;
  /** Optional override for the Campaign panel heading. */
  campaignSectionTitle: string;
  rotatingBossActivity: ExpansionRotatingBossActivity | null;
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
  if (hub.excludedSeasonLabels?.includes(item.seasonLabel ?? "")) {
    return false;
  }
  // Season icons alone are unreliable for exotics remastered into later pools
  // (e.g. Lightfall "Exotic Armor Focusing" entries keep a Beyond Light watermark).
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
    campaign: {
      legendaryRecordHash: "",
      missions: [],
      quests: [],
      difficultyHunts: [],
      difficultyHuntsTitle: "",
    },
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
  if (item.rarity === "Exotic") return false;
  if (ADEPT.test(item.name)) return false;
  // Curated destination names (remasters may no longer carry the expansion label).
  if ((hub.destinationWeaponExtraNames ?? []).includes(item.name)) {
    return true;
  }
  if (!isHubChapterItem(item, hub)) return false;
  return hub.destinationWeaponSourcePattern.test(item.source ?? "");
}

function buildThreeTierHuntDifficulty(
  hunt: ExpansionDifficultyHunt,
): ExpansionHuntDifficultyTier[] {
  // In-game selectable tiers are Advanced / Expert / Master. Manifest still
  // stores legacy Adept+Hero+Legend buckets; Adept PGCR hashes map to Expert
  // (Spanish UI labels them "Experto"), while Hero holds the Advanced variant.
  return [
    {
      label: "Advanced",
      activityHashes: hunt.heroActivityHashes,
    },
    {
      label: "Expert",
      activityHashes: [
        ...new Set([
          ...hunt.adeptActivityHashes,
          ...hunt.legendActivityHashes,
        ]),
      ],
      higherRecordHash: hunt.higherRecordHash,
    },
    {
      label: "Master",
      activityHashes: hunt.masterActivityHashes,
    },
  ];
}

function enrichDifficultyHunts(
  hunts: ExpansionDifficultyHunt[],
  title: string,
): ExpansionDifficultyHunt[] {
  if (title !== "Nightmare Hunts" && title !== "Empire Hunts") return hunts;

  return hunts.map((hunt) => ({
    ...hunt,
    difficultyTiers: buildThreeTierHuntDifficulty(hunt),
  }));
}

function enrichCampaignQuests(
  quests: ExpansionCampaignQuest[],
  triumphCatalog: TriumphCatalog,
): ExpansionCampaignQuest[] {
  return quests.map((quest) => {
    if (quest.iconPath) return quest;
    if (!quest.recordHash) return quest;
    const record = findTriumphRecordByHash(triumphCatalog, quest.recordHash);
    return record?.iconPath ? { ...quest, iconPath: record.iconPath } : quest;
  });
}

export async function resolveExpansionLoot(
  hub: ExpansionHub,
): Promise<ExpansionLoot> {
  const [catalog, armorCatalog, collectionFile, triumphCatalog] =
    await Promise.all([
      loadAllLootCatalog(),
      loadArmorSetCatalog(),
      loadCollectionFile(hub.slug),
      loadTriumphCatalog(),
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
    // Prefer all-loot over armor-sets.json — equipable-set catalogs are often
    // missing class items / chests for older destination sets (e.g. Dreambane).
    const matching = items.filter(
      (item) =>
        item.type === "Armor" &&
        item.rarity === "Legendary" &&
        itemNameBelongsToArmorSet(item.name, setName),
    );
    const fromCatalog = enrichArmorRowsWithOwnership(
      buildPartialArmorRowsFromCatalogItems(matching, setName),
      catalogByHash,
    );
    if (fromCatalog.length > 0) {
      destinationArmorRows.push(...fromCatalog);
      continue;
    }

    const set = findArmorSet(armorCatalog.sets, setName);
    if (set) {
      destinationArmorRows.push(
        ...enrichArmorRowsWithOwnership(
          buildArmorRowsFromSet(set),
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
    campaignQuests: enrichCampaignQuests(
      collectionFile.campaign?.quests ?? [],
      triumphCatalog,
    ),
    difficultyHunts: enrichDifficultyHunts(
      collectionFile.campaign?.difficultyHunts ??
        collectionFile.campaign?.empireHunts ??
        [],
      collectionFile.campaign?.difficultyHuntsTitle ??
        (collectionFile.campaign?.empireHunts?.length
          ? "Empire Hunts"
          : "Difficulty activities"),
    ),
    difficultyHuntsTitle:
      collectionFile.campaign?.difficultyHuntsTitle ??
      (collectionFile.campaign?.empireHunts?.length
        ? "Empire Hunts"
        : "Difficulty activities"),
    campaignSectionTitle: collectionFile.campaign?.sectionTitle ?? "",
    rotatingBossActivity: collectionFile.campaign?.rotatingBossActivity ?? null,
    lootItemCount: lootHashes.size,
    lootItemHashes: [...lootHashes],
    collectionHashes,
  };
}
