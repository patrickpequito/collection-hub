/**
 * Builds public/data/all-loot.json — deduplicated collectible catalog for All Loot.
 *
 * Usage: node scripts/generate-all-loot.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SEASON_ORDER,
  EMOTE_ITEM_CATEGORY_HASH,
  FINISHER_ITEM_CATEGORY_HASH,
  GEAR_SLOT_ORDER,
  TYPE_ORDER,
  WEAPON_SLOT_ORDER,
  buildActiveArtifactSeasonNumbers,
  buildSeasonIndexAnchors,
  buildSeasonPassItemSeasonMap,
  displayNumberFromLabel,
  inferSeasonLabelFromIndex,
  isActiveSeasonalArtifact,
  isSourceObtainable,
  orderFacetValues,
  resolveItemSeasonLabel,
} from "./all-loot-mappings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnv();

const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error("Missing BUNGIE_API_KEY in .env.local");
  process.exit(1);
}

const WEAPON_BUCKET_TO_SLOT = {
  1498876634: "Primary",
  2465295065: "Energy",
  953998645: "Heavy",
};

const ARMOR_BUCKET_TO_SLOT = {
  3448274439: "Helmet",
  3551918588: "Gauntlets",
  14239492: "Chest Armor",
  20886954: "Leg Armor",
  1585787867: "Class Item",
  158374255: "Class Item",
  2422292813: "Class Item",
};

const CLASS_LABEL = {
  0: "Titan",
  1: "Hunter",
  2: "Warlock",
};

const DAMAGE_TYPE_LABEL = {
  1: "Kinetic",
  2: "Arc",
  3: "Solar",
  4: "Void",
  6: "Stasis",
  7: "Strand",
};

const AMMO_TYPE_LABEL = {
  1: "Primary",
  2: "Special",
  3: "Heavy",
};

const ITEM_TYPE_LABEL = {
  2: "Armor",
  3: "Weapon",
  12: "Emblem",
  13: "Shader",
  17: "Ghost",
  18: "Ship",
  24: "Ghost Shell",
  26: "Vehicle Mod",
  27: "Ship Mod",
  30: "Finisher",
};

const WEAPON_ORNAMENT_PLUG_PATTERNS = [
  [/sidearm/, "Sidearm"],
  [/handcannon|hand_cannon/, "Hand Cannon"],
  [/pulse_rifle/, "Pulse Rifle"],
  [/scout_rifle/, "Scout Rifle"],
  [/auto_rifle|assault_rifle/, "Auto Rifle"],
  [/sniper_rifle/, "Sniper Rifle"],
  [/fusion_rifle/, "Fusion Rifle"],
  [/shotgun/, "Shotgun"],
  [/machinegun|machine_gun/, "Machine Gun"],
  [/rocket_launcher/, "Rocket Launcher"],
  [/grenade_launcher/, "Grenade Launcher"],
  [/linear_fusion|linear_funsion/, "Linear Fusion Rifle"],
  [/trace_rifle/, "Trace Rifle"],
  [/submachine|_smg/, "Submachine Gun"],
  [/bow/, "Bow"],
  [/glaive/, "Glaive"],
  [/sword/, "Sword"],
];

const EXCLUDED_ITEM_TYPES = new Set([0, 1, 4, 5, 7, 8, 9, 10, 14, 15, 16, 20, 23]);

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

async function loadManifestTables() {
  const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
  const paths = manifest.jsonWorldComponentContentPaths.en;

  const [items, collectibles, seasons, seasonPasses, progressions] =
    await Promise.all([
      fetchJson(paths.DestinyInventoryItemDefinition),
      fetchJson(paths.DestinyCollectibleDefinition),
      fetchJson(paths.DestinySeasonDefinition),
      fetchJson(paths.DestinySeasonPassDefinition),
      fetchJson(paths.DestinyProgressionDefinition),
    ]);

  return { items, collectibles, seasons, seasonPasses, progressions };
}


function resolveSeasonLabel(
  item,
  collectible,
  seasons,
  seasonIndexAnchors,
  seasonPassItemSeason,
) {
  const label = resolveItemSeasonLabel(
    item,
    collectible,
    seasons,
    seasonPassItemSeason,
  );
  if (label) return label;

  return inferSeasonLabelFromIndex(item.index ?? 0, seasonIndexAnchors);
}

function buildItemsByName(items) {
  const itemsByName = new Map();
  for (const item of Object.values(items)) {
    const name = item.displayProperties?.name?.trim()?.toLowerCase();
    if (!name) continue;
    if (!itemsByName.has(name)) itemsByName.set(name, []);
    itemsByName.get(name).push(item);
  }
  return itemsByName;
}

function isDisplayVariant(item) {
  if (!item?.hash) return false;
  if (item.itemType === 0) return false;
  if (!item.displayProperties?.name?.trim()) return false;
  return true;
}

function pickNewestItemVariant(item, itemsByName) {
  const name = item.displayProperties?.name?.trim()?.toLowerCase();
  const group = itemsByName.get(name) ?? [item];
  const tier = item.inventory?.tierTypeName ?? "";
  const tierPeers = group.filter((candidate) => {
    if (!isDisplayVariant(candidate)) return false;
    if (!tier) return true;
    return candidate.inventory?.tierTypeName === tier;
  });
  const pool = tierPeers.length ? tierPeers : group.filter(isDisplayVariant);
  if (!pool.length) return item;
  return pool.sort(
    (a, b) =>
      (b.collectibleHash ? 1_000_000_000_000 : 0) +
      (b.index ?? 0) -
      ((a.collectibleHash ? 1_000_000_000_000 : 0) + (a.index ?? 0)),
  )[0];
}

function relatedItemHashes(primaryHash, item, itemsByName) {
  const name = item.displayProperties?.name?.trim()?.toLowerCase();
  const group = itemsByName.get(name) ?? [];
  return group
    .map((entry) => String(entry.hash))
    .filter((hash) => hash !== primaryHash);
}

function dedupeScore(entry) {
  return (
    (entry.source ? 1_000_000_000_000 : 0) +
    entry.seasonNumber * 1_000_000_000 +
    (entry._manifestIndex ?? 0)
  );
}

function toCatalogItem(entry) {
  const { _manifestIndex, ...catalogItem } = entry;
  return catalogItem;
}

function resolveAmmoType(item) {
  if (item.itemType !== 3) return null;
  const ammoType = item.equippingBlock?.ammoType;
  return AMMO_TYPE_LABEL[ammoType] ?? null;
}

function resolveDamageType(item) {
  if (typeof item.defaultDamageType === "number") {
    return DAMAGE_TYPE_LABEL[item.defaultDamageType] ?? null;
  }
  const damageTypes = item.damageTypeHashes ?? [];
  if (damageTypes.length === 1) {
    const byHash = {
      3373582085: "Kinetic",
      2303181850: "Arc",
      1847026933: "Solar",
      3454344768: "Void",
      151347233: "Stasis",
      3949783978: "Strand",
    };
    return byHash[damageTypes[0]] ?? null;
  }
  return null;
}

function isFinisherItem(item) {
  const categories = item.itemCategoryHashes ?? [];
  if (categories.includes(FINISHER_ITEM_CATEGORY_HASH)) return true;
  return /finisher$/i.test(item.itemTypeDisplayName ?? "");
}

function isEmoteTypeItem(item) {
  if (!item?.hash || item.redacted || item.blacklisted) return false;

  const name = item.displayProperties?.name?.trim() ?? "";
  if (name === "Finishers") return false;

  const displayType = item.itemTypeDisplayName ?? "";
  if (displayType === "Finisher Collection") return false;
  if (
    displayType === "Emote" ||
    displayType === "Combat Flair" ||
    displayType === "Multiplayer Emote"
  ) {
    return true;
  }
  if (/^(Hunter|Titan|Warlock) Emote$/.test(displayType)) return true;
  if (item.itemType === 23 && displayType === "Emote") return true;
  if (isFinisherItem(item)) return true;

  return (item.itemCategoryHashes ?? []).includes(EMOTE_ITEM_CATEGORY_HASH);
}

function isExcludedItemType(item) {
  if (!EXCLUDED_ITEM_TYPES.has(item.itemType)) return false;
  if (isEmoteTypeItem(item)) return false;
  if (item.itemType === 14 && item.itemTypeDisplayName === "Emblem") return false;
  return true;
}

function qualifiesForCatalog(item) {
  if (item.collectibleHash) return true;
  return isEmoteTypeItem(item);
}

function classFromFinisherDisplayName(displayType = "") {
  if (displayType.startsWith("Hunter")) return "Hunter";
  if (displayType.startsWith("Titan")) return "Titan";
  if (displayType.startsWith("Warlock")) return "Warlock";
  return null;
}

function isArmorOrnamentDisplayName(displayType = "") {
  return (
    displayType.includes("Ornament") && displayType !== "Weapon Ornament"
  );
}

function resolveTypeLabel(item) {
  if (isEmoteTypeItem(item)) return "Emote";

  const displayType = item.itemTypeDisplayName ?? "";
  if (displayType === "Ship") return "Ship";
  if (displayType === "Vehicle") return "Sparrow";
  if (displayType === "Shader") return "Shader";
  if (displayType === "Emblem") return "Emblem";
  if (displayType === "Ghost Projection") return "Ghost Projection";
  if (displayType === "Transmat Effect") return "Transmat Effect";
  if (isArmorOrnamentDisplayName(displayType) || displayType === "Weapon Ornament") {
    return "Ornament";
  }
  if (item.itemType === 28 || /artifact/i.test(displayType)) return "Artifact";
  if (displayType.includes("Mod")) return "Mod";

  if (ITEM_TYPE_LABEL[item.itemType]) return ITEM_TYPE_LABEL[item.itemType];

  if (displayType) return displayType;
  return null;
}

function slotFromPlugCategoryIdentifier(plugCategoryIdentifier) {
  const lower = (plugCategoryIdentifier ?? "").toLowerCase();
  if (!lower) return null;
  if (/_head|_helmet|_mask|_hood|_hat|_face|_skull|shared_head/.test(lower)) {
    return "Helmet";
  }
  if (/_arms|_gauntlet|_glove|_hand/.test(lower)) return "Gauntlets";
  if (/_chest|_robe|_vest|_plate|_mail/.test(lower)) return "Chest Armor";
  if (/_legs|_leg[^a-z]|_boot|_greave|_stride|_pant/.test(lower)) {
    return "Leg Armor";
  }
  if (/_class|_bond|_mark|_cloak|_sash|_cape/.test(lower)) {
    return "Class Item";
  }
  return null;
}

function slotFromOrnamentName(name = "") {
  const normalized = name.toLowerCase();
  if (/\b(head|helm|mask|hood|cowl|hat|cap|visor|face|skull)\b/.test(normalized)) {
    return "Helmet";
  }
  if (/\b(arms|arm\b|gauntlet|grip|glove|hand)\b/.test(normalized)) {
    return "Gauntlets";
  }
  if (/\b(chest|plate|vest|robe|cuirass|mail|tunic)\b/.test(normalized)) {
    return "Chest Armor";
  }
  if (/\b(leg\b|legs|stride|boot|greave|pant|trouser|gaiter)\b/.test(normalized)) {
    return "Leg Armor";
  }
  if (/\b(cloak|bond|mark|class item|sash|wrap\b|mantle|tabard)\b/.test(normalized)) {
    return "Class Item";
  }
  return null;
}

function classFromPlugCategoryIdentifier(plugCategoryIdentifier) {
  const lower = (plugCategoryIdentifier ?? "").toLowerCase();
  if (/_hunter|hunter_/.test(lower)) return "Hunter";
  if (/_titan|titan_/.test(lower)) return "Titan";
  if (/_warlock|warlock_/.test(lower)) return "Warlock";
  return null;
}

function classFromOrnamentDisplayName(displayType = "", classType) {
  if (displayType.startsWith("Hunter")) return "Hunter";
  if (displayType.startsWith("Titan")) return "Titan";
  if (displayType.startsWith("Warlock")) return "Warlock";
  if (classType === 0) return "Titan";
  if (classType === 1) return "Hunter";
  if (classType === 2) return "Warlock";
  return null;
}

function weaponTypeFromOrnamentPlug(plugCategoryIdentifier) {
  const lower = (plugCategoryIdentifier ?? "").toLowerCase();
  for (const [pattern, label] of WEAPON_ORNAMENT_PLUG_PATTERNS) {
    if (pattern.test(lower)) return label;
  }
  return null;
}

function resolveArmorOrnamentSlot(item) {
  const displayType = item.itemTypeDisplayName ?? "";
  if (!isArmorOrnamentDisplayName(displayType)) return null;

  return (
    slotFromPlugCategoryIdentifier(item.plug?.plugCategoryIdentifier) ??
    slotFromOrnamentName(item.displayProperties?.name ?? "")
  );
}

function resolveArmorOrnamentClass(item) {
  const displayType = item.itemTypeDisplayName ?? "";
  if (!isArmorOrnamentDisplayName(displayType)) return null;

  return (
    classFromPlugCategoryIdentifier(item.plug?.plugCategoryIdentifier) ??
    classFromOrnamentDisplayName(displayType, item.classType)
  );
}

function resolveWeaponOrnamentType(item) {
  if (item.itemTypeDisplayName !== "Weapon Ornament") return null;
  return weaponTypeFromOrnamentPlug(item.plug?.plugCategoryIdentifier);
}

function resolveWeaponType(item) {
  if (item.itemType !== 3) return null;
  return item.itemTypeDisplayName || null;
}

function resolveSlotLabel(item, typeLabel) {
  const bucket = item.inventory?.bucketTypeHash;
  if (item.itemType === 3) return WEAPON_BUCKET_TO_SLOT[bucket] ?? null;
  if (item.itemType === 2) return ARMOR_BUCKET_TO_SLOT[bucket] ?? null;
  if (typeLabel === "Ornament") return resolveArmorOrnamentSlot(item);
  return null;
}

function resolveClassOrWeaponType(item, typeLabel) {
  if (item.itemType === 3) return resolveWeaponType(item);
  if (item.itemType === 2) return CLASS_LABEL[item.classType] ?? null;
  if (typeLabel === "Emote") {
    const displayType = item.itemTypeDisplayName ?? "";
    return (
      classFromFinisherDisplayName(displayType) ??
      classFromOrnamentDisplayName(displayType, item.classType) ??
      CLASS_LABEL[item.classType] ??
      null
    );
  }
  if (typeLabel === "Ornament") {
    return (
      resolveWeaponOrnamentType(item) ?? resolveArmorOrnamentClass(item)
    );
  }
  return null;
}

function isSeasonPassSource(source = "") {
  return /season pass reward|rewards pass|upgraded event card reward/i.test(
    source,
  );
}

function buildRecentSeasonPassHashes(items, collectibles) {
  const seasonPassItems = [];
  for (const item of Object.values(items)) {
    if (!item?.collectibleHash) continue;
    const collectible = collectibles[String(item.collectibleHash)];
    if (!collectible || !isSeasonPassSource(collectible.sourceString ?? "")) {
      continue;
    }
    seasonPassItems.push(item);
  }

  seasonPassItems.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const recentCount = 24;
  return new Set(
    seasonPassItems
      .slice(-recentCount)
      .map((item) => String(item.hash)),
  );
}

function isObtainable(
  item,
  collectible,
  seasonNumber,
  recentSeasonPassHashes,
  seasons,
  activeArtifactSeasonNumbers,
) {
  if (item.redacted || collectible?.redacted || collectible?.blacklisted) {
    return false;
  }
  if (item.doesNotExistInGame) return false;
  if (collectible?.isNegative) return false;

  if (
    item.itemType === 28 &&
    !isActiveSeasonalArtifact(item, seasons, activeArtifactSeasonNumbers)
  ) {
    return false;
  }

  return isSourceObtainable(
    collectible?.sourceString ?? "",
    collectible,
    seasonNumber,
    {
      recentSeasonPass: recentSeasonPassHashes.has(String(item.hash)),
    },
  );
}

function buildSearchText(entry) {
  return [
    entry.name,
    entry.seasonLabel,
    entry.type,
    entry.rarity,
    entry.classOrWeaponType,
    entry.damageType,
    entry.slot,
    entry.ammoType,
    entry.source,
    entry.obtainable ? "obtainable yes" : "obtainable no",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildCatalog(items, collectibles, seasons, seasonPasses, progressions) {
  const byName = new Map();
  const itemsByName = buildItemsByName(items);
  const seasonPassItemSeason = buildSeasonPassItemSeasonMap(
    seasons,
    seasonPasses,
    progressions,
  );
  const seasonIndexAnchors = buildSeasonIndexAnchors(
    items,
    collectibles,
    seasons,
    seasonPassItemSeason,
  );
  const recentSeasonPassHashes = buildRecentSeasonPassHashes(items, collectibles);
  const activeArtifactSeasonNumbers =
    buildActiveArtifactSeasonNumbers(seasons);

  for (const item of Object.values(items)) {
    if (!item?.hash || isExcludedItemType(item)) continue;
    if (item.itemType === 29 && !isFinisherItem(item)) continue;
    if (!qualifiesForCatalog(item)) continue;

    const collectible = item.collectibleHash
      ? collectibles[String(item.collectibleHash)]
      : null;
    if (item.collectibleHash && !collectible) continue;

    const name = item.displayProperties?.name?.trim();
    if (!name || name === "Unknown") continue;

    const type = resolveTypeLabel(item);
    if (!type) continue;

    const rarity = item.inventory?.tierTypeName ?? "";
    if (!rarity || rarity === "Unknown") continue;

    const displayItem = pickNewestItemVariant(item, itemsByName);
    const displayHash = String(displayItem.hash);
    const alternates = relatedItemHashes(displayHash, item, itemsByName);

    const source = collectible?.sourceString ?? "";
    const seasonLabel = collectible
      ? resolveSeasonLabel(
          item,
          collectible,
          seasons,
          seasonIndexAnchors,
          seasonPassItemSeason,
        )
      : inferSeasonLabelFromIndex(item.index ?? 0, seasonIndexAnchors);
    const seasonNumber = displayNumberFromLabel(seasonLabel);
    const classOrWeaponType = resolveClassOrWeaponType(displayItem, type);
    const damageType =
      displayItem.itemType === 3 ? resolveDamageType(displayItem) : null;
    const slot = resolveSlotLabel(displayItem, type);
    const ammoType = resolveAmmoType(displayItem);
    const obtainable = collectible
      ? isObtainable(
          item,
          collectible,
          seasonNumber,
          recentSeasonPassHashes,
          seasons,
          activeArtifactSeasonNumbers,
        )
      : false;

    const entry = {
      itemHash: displayHash,
      alternateItemHashes: alternates.length ? alternates : undefined,
      name,
      iconPath: displayItem.displayProperties?.icon ?? "",
      seasonLabel,
      seasonNumber,
      type,
      rarity,
      classOrWeaponType,
      damageType,
      slot,
      ammoType,
      source,
      obtainable,
      _manifestIndex: item.index ?? 0,
    };

    entry.searchText = buildSearchText(entry);

    const key = name.toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, entry);
      continue;
    }

    if (dedupeScore(entry) > dedupeScore(existing)) {
      byName.set(key, entry);
    }
  }

  const catalog = [...byName.values()].map(toCatalogItem).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const seasonSet = new Set(catalog.map((item) => item.seasonLabel));
  const facets = {
    types: orderFacetValues(
      catalog.map((item) => item.type),
      TYPE_ORDER,
    ),
    seasons: CANONICAL_SEASON_ORDER.concat(
      [...seasonSet]
        .filter((label) => !CANONICAL_SEASON_ORDER.includes(label))
        .sort((a, b) => a.localeCompare(b)),
    ),
    rarities: orderFacetValues(
      catalog.map((item) => item.rarity),
      ["Exotic", "Legendary", "Rare", "Uncommon", "Common"],
    ),
    classes: orderFacetValues(
      catalog
        .filter(
          (item) =>
            item.type === "Armor" ||
            item.type === "Ornament" ||
            item.type === "Emote",
        )
        .map((item) => item.classOrWeaponType)
        .filter(isClassLabel),
      ["Titan", "Hunter", "Warlock"],
    ),
    weaponTypes: orderFacetValues(
      catalog
        .filter((item) => item.type === "Weapon" || item.type === "Ornament")
        .map((item) => item.classOrWeaponType)
        .filter((value) => Boolean(value) && !isClassLabel(value)),
      [],
    ),
    damageTypes: orderFacetValues(
      catalog.map((item) => item.damageType).filter(Boolean),
      ["Kinetic", "Arc", "Solar", "Void", "Strand", "Stasis"],
    ),
    weaponSlots: orderFacetValues(
      catalog
        .filter((item) => item.type === "Weapon")
        .map((item) => item.slot)
        .filter(Boolean),
      WEAPON_SLOT_ORDER,
    ),
    gearSlots: orderFacetValues(
      catalog
        .filter((item) => item.type === "Armor" || item.type === "Ornament")
        .map((item) => item.slot)
        .filter(Boolean),
      GEAR_SLOT_ORDER,
    ),
  };

  return { catalog, facets };
}

function isClassLabel(value) {
  return value === "Titan" || value === "Hunter" || value === "Warlock";
}

async function main() {
  console.log("Loading Bungie manifest…");
  const { items, collectibles, seasons, seasonPasses, progressions } =
    await loadManifestTables();
  const { catalog, facets } = buildCatalog(
    items,
    collectibles,
    seasons,
    seasonPasses,
    progressions,
  );

  const obtainableCount = catalog.filter((item) => item.obtainable).length;

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "all-loot.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        itemCount: catalog.length,
        obtainableCount,
        facets,
        items: catalog,
      },
      null,
      2,
    ),
  );

  console.log(`Wrote ${catalog.length} items to public/data/all-loot.json`);
  console.log(`Obtainable: ${obtainableCount} / ${catalog.length}`);
  console.log(
    "Facets:",
    Object.fromEntries(
      Object.entries(facets).map(([key, value]) => [key, value.length]),
    ),
  );
  console.log(
    "Types:",
    Object.fromEntries(
      Object.entries(
        catalog.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] ?? 0) + 1;
          return acc;
        }, {}),
      ),
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
