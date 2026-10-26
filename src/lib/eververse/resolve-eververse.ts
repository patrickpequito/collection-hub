import { buildPartialArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import type { ExpansionHub } from "@/data/expansions/types";
import type { SeasonHub } from "@/data/seasons/types";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";

const EVERVERSE_SOURCE = /eververse|bright engram/i;

/**
 * Cosmetic types sold in the Eververse. Emotes and Ghost Projections often have
 * no source string in the manifest, so they count as Eververse when sourceless.
 */
const EVERVERSE_TYPE_SECTIONS = [
  { type: "Ghost Shell", title: "Ghost Shells" },
  { type: "Sparrow", title: "Sparrows" },
  { type: "Ship", title: "Ships" },
  { type: "Shader", title: "Shaders" },
  { type: "Emote", title: "Emotes" },
  { type: "Ghost Projection", title: "Ghost Projections" },
  { type: "Transmat Effect", title: "Transmat Effects" },
  { type: "Emblem", title: "Emblems" },
] as const;

const SOURCELESS_EVERVERSE_TYPES = new Set(["Emote", "Ghost Projection"]);

const GUARDIAN_CLASS_ORDER = ["Hunter", "Titan", "Warlock"] as const;

/** Ornament sets sold as three per-class names under one shared theme. */
const COMBINED_ORNAMENT_SET_NAMES: { names: string[]; displayName: string }[] = [
  { names: ["Dynamo Current", "Thunderous Impact", "Arclight"], displayName: "Arc 3.0" },
  { names: ["Misthios", "Wolf-Kissed", "Eagle's"], displayName: "Assassin's Creed" },
  { names: ["Sun's Apex", "Radiant Breaker", "Dawn Singer"], displayName: "Solar 3.0" },
  { names: ["Abyss Walker", "Desolation Diver", "Elect of the Empty"], displayName: "Void 3.0" },
];

function ornamentDisplayName(setName: string): string {
  const parts = setName.split(" / ").map((part) => part.trim().toLowerCase());
  const match = COMBINED_ORNAMENT_SET_NAMES.find(
    (entry) =>
      entry.names.length === parts.length &&
      entry.names.every((name) => parts.includes(name.toLowerCase())),
  );
  return `${match?.displayName ?? setName} ornaments`;
}

/** Last word of an armor ornament name is the slot piece ("Abyss Walker Grips"). */
function ornamentSetName(name: string): string {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? words.slice(0, -1).join(" ") : name;
}

export type EververseClassGroup = {
  guardianClass: (typeof GUARDIAN_CLASS_ORDER)[number];
  items: LootItem[];
};

export type EververseSection = {
  title: string;
  items: LootItem[];
};

export type EververseLoot = {
  /** Legendary armor ornament sets, one row per class. */
  ornamentSets: LegacyArmorSetGroup[];
  /** Single legendary armor ornaments outside a set, split by class. */
  otherArmorOrnaments: EververseClassGroup[];
  /** Exotic armor ornaments split by class. */
  exoticArmorOrnaments: EververseClassGroup[];
  weaponOrnaments: LootItem[];
  sections: EververseSection[];
  /** Separate counter — never part of the season / expansion progress. */
  ownershipGroups: string[][];
  total: number;
};

/**
 * The season's own watermark, taken from its Season Pass cosmetics. Items with
 * the same season number but the expansion watermark (e.g. The Witch Queen)
 * belong on the expansion page instead.
 */
function resolveSeasonWatermark(
  catalogItems: AllLootItem[],
  hub: SeasonHub,
): string | null {
  const passNames = new Set(hub.cosmeticRewards ?? []);
  const counts = new Map<string, number>();
  for (const item of catalogItems) {
    if (item.seasonNumber !== hub.seasonNumber || !item.seasonIconPath) continue;
    if (!passNames.has(item.name) && !/season pass/i.test(item.source ?? "")) {
      continue;
    }
    counts.set(item.seasonIconPath, (counts.get(item.seasonIconPath) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [path, count] of counts) {
    if (count > bestCount) {
      best = path;
      bestCount = count;
    }
  }
  return best;
}

function isEververseCosmetic(item: AllLootItem): boolean {
  const source = item.source ?? "";
  if (EVERVERSE_SOURCE.test(source)) {
    return (
      item.type === "Ornament" ||
      EVERVERSE_TYPE_SECTIONS.some((section) => section.type === item.type)
    );
  }
  return !source && SOURCELESS_EVERVERSE_TYPES.has(item.type);
}

function sortByRarityThenName(a: LootItem, b: LootItem): number {
  const rank = (item: LootItem) => (item.rarity === "Exotic" ? 0 : 1);
  return rank(a) - rank(b) || a.name.localeCompare(b.name);
}

function enrichOrnamentRows(setItems: AllLootItem[], setName: string) {
  const byHash = new Map(setItems.map((item) => [item.itemHash, item]));
  return buildPartialArmorRowsFromCatalogItems(setItems, setName).map((row) => {
    const pieces = { ...row.pieces };
    for (const slot of Object.keys(pieces) as Array<keyof typeof pieces>) {
      const piece = pieces[slot];
      const catalogItem = piece ? byHash.get(piece.itemHash) : undefined;
      if (!piece || !catalogItem) continue;
      pieces[slot] = {
        ...piece,
        seasonIconPath: catalogItem.seasonIconPath,
        ownershipHashes: collectAllLootItemHashes(catalogItem),
      };
    }
    return { ...row, pieces };
  });
}

function classOfSet(setItems: AllLootItem[]): string | null {
  const classes = new Set(setItems.map((item) => item.classOrWeaponType));
  return classes.size === 1 ? [...classes][0] : null;
}

/**
 * Eververse sells one universal ornament set per class under different names
 * (Abyss Walker / Desolation Diver / Elect of the Empty). When the season has
 * exactly one single-class set per class, show them as one block that shares
 * a preview. Otherwise each named set gets its own block.
 */
function buildOrnamentSetGroups(
  legendarySets: Map<string, AllLootItem[]>,
  mergedPreviewFile: string,
  manualGroups: readonly (readonly string[])[] = [],
): LegacyArmorSetGroup[] {
  // Hub-configured pairings first (seasons with several sets per class).
  const manual: LegacyArmorSetGroup[] = [];
  for (const names of manualGroups) {
    const present = names.filter((name) => legendarySets.has(name));
    if (present.length === 0) continue;
    const setName = present.join(" / ");
    const rows = enrichOrnamentRows(
      present.flatMap((name) => legendarySets.get(name) ?? []),
      setName,
    );
    for (const name of present) legendarySets.delete(name);
    if (rows.length === 0) continue;
    manual.push({
      setName,
      displayName: ornamentDisplayName(setName),
      kind: "ornament",
      previewFile: resolveArmorSetPreviewFile(setName),
      rows,
    });
  }
  if (legendarySets.size === 0) return manual;
  return [...manual, ...buildAutoOrnamentSetGroups(legendarySets, mergedPreviewFile)];
}

function buildAutoOrnamentSetGroups(
  legendarySets: Map<string, AllLootItem[]>,
  mergedPreviewFile: string,
): LegacyArmorSetGroup[] {
  const entries = [...legendarySets.entries()];
  const setClasses = entries.map(([, setItems]) => classOfSet(setItems));
  const isOnePerClass =
    entries.length === GUARDIAN_CLASS_ORDER.length &&
    GUARDIAN_CLASS_ORDER.every(
      (label) => setClasses.filter((value) => value === label).length === 1,
    );

  if (isOnePerClass) {
    const ordered = GUARDIAN_CLASS_ORDER.map(
      (label) => entries[setClasses.indexOf(label)],
    );
    const setName = ordered.map(([name]) => name).join(" / ");
    const rows = enrichOrnamentRows(
      ordered.flatMap(([, setItems]) => setItems),
      setName,
    );
    if (rows.length === 0) return [];
    return [
      {
        setName,
        displayName: ornamentDisplayName(setName),
        kind: "ornament",
        previewFile: mergedPreviewFile,
        rows,
      },
    ];
  }

  const groups: LegacyArmorSetGroup[] = [];
  for (const [setName, setItems] of entries) {
    const rows = enrichOrnamentRows(setItems, setName);
    if (rows.length === 0) continue;
    groups.push({
      setName,
      displayName: ornamentDisplayName(setName),
      kind: "ornament",
      previewFile: resolveArmorSetPreviewFile(setName),
      rows,
    });
  }
  // Hunter → Titan → Warlock, then by name.
  const classIndex = (group: LegacyArmorSetGroup) => {
    const first = group.rows[0]?.guardianClass ?? "";
    const index = GUARDIAN_CLASS_ORDER.findIndex(
      (label) => label.toLowerCase() === first,
    );
    return index === -1 ? GUARDIAN_CLASS_ORDER.length : index;
  };
  return groups.sort(
    (a, b) => classIndex(a) - classIndex(b) || a.setName.localeCompare(b.setName),
  );
}

function collectEververseItems(
  catalogItems: AllLootItem[],
  isInScope: (item: AllLootItem) => boolean,
  excludedNames: Set<string>,
): AllLootItem[] {
  const seen = new Set<string>();
  return catalogItems.filter((item) => {
    if (!isInScope(item) || excludedNames.has(item.name)) return false;
    if (!isEververseCosmetic(item)) return false;
    if (seen.has(item.itemHash)) return false;
    seen.add(item.itemHash);
    return true;
  });
}

export function resolveSeasonEververse(
  catalogItems: AllLootItem[],
  hub: SeasonHub,
): EververseLoot | null {
  if (!hub.showEververseCosmetics) return null;

  // Items already shown elsewhere on the page (Season Pass, exotics) stay out.
  const excludedNames = new Set([
    ...(hub.cosmeticRewards ?? []),
    ...hub.exoticItemNames,
    ...(hub.excludedEververseNames ?? []),
  ]);
  const watermark = resolveSeasonWatermark(catalogItems, hub);
  const items = collectEververseItems(
    catalogItems,
    (item) =>
      item.seasonNumber === hub.seasonNumber &&
      (!watermark || item.seasonIconPath === watermark),
    excludedNames,
  );
  return buildEververseLoot(
    items,
    `${hub.slug}-eververse.webp`,
    hub.eververseOrnamentSetGroups,
  );
}

/** Expansion-watermarked Eververse cosmetics (catalog season label). */
export function resolveExpansionEververse(
  catalogItems: AllLootItem[],
  hub: ExpansionHub,
): EververseLoot | null {
  if (!hub.showEververseCosmetics) return null;

  const labels = new Set(hub.seasonLabels);
  const items = collectEververseItems(
    catalogItems,
    (item) => Boolean(item.seasonLabel && labels.has(item.seasonLabel)),
    new Set(hub.excludedEververseNames ?? []),
  );
  return buildEververseLoot(items, `${hub.slug}-eververse.webp`);
}

function buildEververseLoot(
  items: AllLootItem[],
  mergedPreviewFile: string,
  ornamentSetGroups?: readonly (readonly string[])[],
): EververseLoot {
  const isClassItem = (item: AllLootItem) =>
    GUARDIAN_CLASS_ORDER.some((label) => label === item.classOrWeaponType);

  const armorOrnaments = items.filter(
    (item) => item.type === "Ornament" && isClassItem(item) && item.slot,
  );
  const weaponOrnaments = items
    .filter((item) => item.type === "Ornament" && !isClassItem(item))
    .map((item) => toLootItemFromCatalog(item))
    .sort(sortByRarityThenName);

  const legendarySets = new Map<string, AllLootItem[]>();
  for (const item of armorOrnaments) {
    if (item.rarity !== "Legendary") continue;
    const setName = ornamentSetName(item.name);
    const bucket = legendarySets.get(setName) ?? [];
    bucket.push(item);
    legendarySets.set(setName, bucket);
  }
  // A lone piece (e.g. "Cloak of Bakris") is a standalone ornament, not a set.
  const standaloneOrnaments: AllLootItem[] = [];
  for (const [setName, setItems] of legendarySets) {
    if (setItems.length > 1) continue;
    standaloneOrnaments.push(...setItems);
    legendarySets.delete(setName);
  }

  const ornamentSets = buildOrnamentSetGroups(
    legendarySets,
    mergedPreviewFile,
    ornamentSetGroups,
  );

  const groupByClass = (pieces: AllLootItem[]): EververseClassGroup[] =>
    GUARDIAN_CLASS_ORDER.map((guardianClass) => ({
      guardianClass,
      items: pieces
        .filter((item) => item.classOrWeaponType === guardianClass)
        .map((item) => toLootItemFromCatalog(item))
        .sort(sortByRarityThenName),
    })).filter((group) => group.items.length > 0);

  const otherArmorOrnaments = groupByClass(standaloneOrnaments);

  const exoticArmorOrnaments = groupByClass(
    armorOrnaments.filter((item) => item.rarity !== "Legendary"),
  );

  const sections: EververseSection[] = EVERVERSE_TYPE_SECTIONS.map(
    ({ type, title }) => ({
      title,
      items: items
        .filter((item) => item.type === type)
        .map((item) => toLootItemFromCatalog(item))
        .sort(sortByRarityThenName),
    }),
  ).filter((section) => section.items.length > 0);

  const ownershipGroups = items.map((item) => collectAllLootItemHashes(item));

  return {
    ornamentSets,
    otherArmorOrnaments,
    exoticArmorOrnaments,
    weaponOrnaments,
    sections,
    ownershipGroups,
    total: ownershipGroups.length,
  };
}

/**
 * Every Eververse legendary armor ornament set in the catalog, one group per
 * named set, tagged with its season (Armor sets page).
 */
export function resolveAllEververseOrnamentSets(
  catalogItems: AllLootItem[],
): LegacyArmorSetGroup[] {
  const isClassItem = (item: AllLootItem) =>
    GUARDIAN_CLASS_ORDER.some((label) => label === item.classOrWeaponType);
  const bySet = new Map<string, AllLootItem[]>();
  const seen = new Set<string>();
  for (const item of catalogItems) {
    if (item.type !== "Ornament" || !isClassItem(item) || !item.slot) continue;
    if (item.rarity !== "Legendary" || !isEververseCosmetic(item)) continue;
    if (seen.has(item.itemHash)) continue;
    seen.add(item.itemHash);
    const key = `${item.seasonLabel}::${ornamentSetName(item.name)}`;
    bySet.set(key, [...(bySet.get(key) ?? []), item]);
  }

  const groups: LegacyArmorSetGroup[] = [];
  for (const [key, setItems] of bySet) {
    if (setItems.length < 2) continue; // a lone piece isn't a set
    const setName = key.split("::")[1];
    const rows = enrichOrnamentRows(setItems, setName);
    if (rows.length === 0) continue;
    groups.push({
      setName,
      displayName: ornamentDisplayName(setName),
      kind: "ornament",
      previewFile: resolveArmorSetPreviewFile(setName),
      seasonLabel: setItems[0].seasonLabel,
      seasonNumber: setItems[0].seasonNumber ?? undefined,
      rows,
    });
  }
  return groups;
}
