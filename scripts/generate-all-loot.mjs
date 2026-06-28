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
  buildDebutSeasonByName,
  buildManifestItemsByGroupKey,
  buildSeasonIndexAnchors,
  buildSeasonPassItemSeasonMap,
  buildWatermarkIndexAnchors,
  buildWatermarkLabelMap,
  buildSalvationsEdgeS29ReissueMinIndex,
  buildSeasonDisplayIconLookup,
  catalogGroupKey,
  displayNumberFromLabel,
  isActiveSeasonalArtifact,
  isDebutRelevantVariant,
  isSourceObtainable,
  normalizeItemName,
  orderFacetValues,
  resolveCollectibleForVariant,
  resolveEventLabel,
  catalogVersionsEquivalent,
  preferCatalogVersion,
  resolveSeasonDisplayIconPath,
  resolveSeasonDisplayIconWatermark,
  resolveVersionSeasonLabel,
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

const WEAPON_STAT_HASHES = {
  Accuracy: 1591432999,
  BlastRadius: 3614673599,
  ChargeTime: 2961396640,
  Impact: 4043523819,
  DrawTime: 447667954,
  Handling: 943549884,
  CoolingEfficiency: 3361094766,
  Persistence: 3863609976,
  Range: 1240592695,
  ReloadSpeed: 4188031367,
  Stability: 155624089,
  Velocity: 2523465841,
  VentSpeed: 2591150011,
  ShieldDuration: 1842278586,
};

const WEAPON_MASTERWORK_PLUG_CATEGORY = {
  [WEAPON_STAT_HASHES.Accuracy]: 1238043140,
  [WEAPON_STAT_HASHES.BlastRadius]: 1847616696,
  [WEAPON_STAT_HASHES.ChargeTime]: 2827428737,
  [WEAPON_STAT_HASHES.Impact]: 2458812152,
  [WEAPON_STAT_HASHES.DrawTime]: 482070447,
  [WEAPON_STAT_HASHES.Handling]: 199786516,
  [WEAPON_STAT_HASHES.CoolingEfficiency]: 2437126983,
  [WEAPON_STAT_HASHES.Persistence]: 854547368,
  [WEAPON_STAT_HASHES.Range]: 1392237582,
  [WEAPON_STAT_HASHES.ReloadSpeed]: 717646604,
  [WEAPON_STAT_HASHES.Stability]: 1762223024,
  [WEAPON_STAT_HASHES.Velocity]: 2321551094,
  [WEAPON_STAT_HASHES.VentSpeed]: 2876802050,
  [WEAPON_STAT_HASHES.ShieldDuration]: 1210640601,
};

const ITEM_CATEGORY_HASHES = {
  Bows: 3317537436,
  Sword: 3954685534,
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

const EXCLUDED_WEAPON_STAT_HASHES = new Set([
  1480404414, // Power
  1935470627, // Attack
  1931675084, // Ammo Generation
]);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const DIM_SEASONS_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/output/seasons.json";
const DIM_WATERMARK_TO_SEASON_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/output/watermark-to-season.json";

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const headers = path.startsWith("http") ? {} : { "X-API-Key": API_KEY };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

async function loadDimSeasonData() {
  const [dimSeasons, watermarkToSeason] = await Promise.all([
    fetchJson(DIM_SEASONS_URL),
    fetchJson(DIM_WATERMARK_TO_SEASON_URL),
  ]);
  return { dimSeasons, watermarkToSeason };
}

async function loadManifestTables() {
  const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
  const paths = manifest.jsonWorldComponentContentPaths.en;

  const [
    items,
    collectibles,
    seasons,
    seasonPasses,
    progressions,
    statDefs,
    presentationNodes,
    plugSets,
    socketTypes,
    socketCategories,
    statGroups,
  ] = await Promise.all([
    fetchJson(paths.DestinyInventoryItemDefinition),
    fetchJson(paths.DestinyCollectibleDefinition),
    fetchJson(paths.DestinySeasonDefinition),
    fetchJson(paths.DestinySeasonPassDefinition),
    fetchJson(paths.DestinyProgressionDefinition),
    fetchJson(paths.DestinyStatDefinition),
    fetchJson(paths.DestinyPresentationNodeDefinition),
    fetchJson(paths.DestinyPlugSetDefinition),
    fetchJson(paths.DestinySocketTypeDefinition),
    fetchJson(paths.DestinySocketCategoryDefinition),
    fetchJson(paths.DestinyStatGroupDefinition),
  ]);

  return {
    items,
    collectibles,
    seasons,
    seasonPasses,
    progressions,
    statDefs,
    presentationNodes,
    plugSets,
    socketTypes,
    socketCategories,
    statGroups,
  };
}


function catalogItemGroupKey(item) {
  const name = item.displayProperties?.name;
  const type = resolveTypeLabel(item);
  if (!name?.trim() || !type) return null;
  return catalogGroupKey(name, type);
}

function buildItemsByName(items) {
  return buildManifestItemsByGroupKey(items, catalogItemGroupKey);
}

function isDisplayVariant(item) {
  if (!item?.hash) return false;
  if (item.itemType === 0) return false;
  if (!item.displayProperties?.name?.trim()) return false;
  return true;
}

function pickNewestItemVariant(item, itemsByName) {
  const key = catalogItemGroupKey(item);
  const group = key ? (itemsByName.get(key) ?? [item]) : [item];
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
  const key = catalogItemGroupKey(item);
  const group = key ? (itemsByName.get(key) ?? []) : [];
  return group
    .map((entry) => String(entry.hash))
    .filter((hash) => hash !== primaryHash);
}

function dedupeScore(entry) {
  return (
    (entry.source ? 1_000_000_000_000 : 0) + (entry._manifestIndex ?? 0)
  );
}

function toCatalogItem(entry) {
  const { _manifestIndex, ...catalogItem } = entry;
  return catalogItem;
}

function resolveWeaponStats(item, statDefs) {
  const statsBlock = item.stats?.stats;
  if (!statsBlock) return undefined;

  const resolved = Object.values(statsBlock)
    .map((entry) => {
      const def = statDefs[String(entry.statHash)];
      if (!def?.displayProperties?.name) return null;
      if (EXCLUDED_WEAPON_STAT_HASHES.has(entry.statHash)) return null;
      if (def.statCategory !== 1) return null;

      return {
        name: def.displayProperties.name,
        value: entry.value,
        max: entry.displayMaximum || 100,
        sort: def.index ?? 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sort - b.sort)
    .map(({ name, value, max }) => ({ name, value, max }));

  return resolved.length ? resolved : undefined;
}

function resolveWeaponDetailFields(displayItem, statDefs) {
  const description =
    displayItem.flavorText?.trim() ||
    displayItem.displayProperties?.description?.trim() ||
    undefined;
  const screenshotPath = displayItem.screenshot || undefined;
  const stats = resolveWeaponStats(displayItem, statDefs);

  return {
    description,
    screenshotPath,
    stats,
  };
}

function collectSocketPlugHashes(socket, plugSets) {
  const hashes = new Set();
  for (const plug of socket.reusablePlugItems ?? []) {
    hashes.add(plug.plugItemHash);
  }
  for (const setHash of [
    socket.randomizedPlugSetHash,
    socket.reusablePlugSetHash,
  ]) {
    if (!setHash) continue;
    const set = plugSets[String(setHash)];
    for (const plug of set?.reusablePlugItems ?? []) {
      hashes.add(plug.plugItemHash);
    }
  }
  return hashes;
}

function plugCategoryId(plug) {
  return plug?.plug?.plugCategoryIdentifier ?? "";
}

function isMasterworkStatPlug(plug) {
  return plugCategoryId(plug).includes("masterworks.stat");
}

function shouldSkipWeaponPlug(plug) {
  const category = plugCategoryId(plug);
  const name = plug?.displayProperties?.name ?? "";
  if (!plug?.displayProperties?.icon) return true;
  if (plug.redacted || plug.blacklisted) return true;
  if (name.startsWith("Empty ") || name === "Default Ornament") return true;
  if (name === "Default Combat Flair") return true;
  if (category.includes("shader")) return true;
  if (category.includes("skins")) return true;
  if (category.includes("kill_vfx")) return true;
  if (category.includes("confetti")) return true;
  if (category.includes("enhancers")) return true;
  if (category.includes("mod_empty")) return true;
  if (category.includes("weapon.mod_empty")) return true;
  if (category.includes("masterworks.trackers")) return true;
  if (category.includes("mod_guns")) return true;
  if (category.includes("mod_magazine")) return true;
  if (category.includes("mod_damage")) return true;
  if (category.includes("mod_mag_adjusting")) return true;
  return false;
}

function dedupeWeaponPlugs(plugs) {
  const seen = new Set();
  const result = [];
  for (const plug of plugs) {
    if (shouldSkipWeaponPlug(plug)) continue;
    const hash = String(plug.hash);
    if (seen.has(hash)) continue;
    seen.add(hash);
    result.push(plug);
  }
  return result;
}

function dedupeWeaponPlugsByName(plugs) {
  const seen = new Set();
  const result = [];
  for (const plug of plugs) {
    const name = plug.displayProperties?.name ?? "";
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(plug);
  }
  return result;
}

function isValidWeaponMasterworkStat(item, statHash, statGroups) {
  if (
    statHash === WEAPON_STAT_HASHES.ChargeTime &&
    item.itemCategoryHashes?.includes(ITEM_CATEGORY_HASHES.Bows)
  ) {
    return false;
  }
  if (
    statHash === WEAPON_STAT_HASHES.Impact &&
    !item.itemCategoryHashes?.includes(ITEM_CATEGORY_HASHES.Sword)
  ) {
    return false;
  }
  const statGroupHash = item.stats?.statGroupHash;
  if (!statGroupHash) return false;
  const statGroupDef = statGroups[String(statGroupHash)];
  return statGroupDef?.scaledStats?.some((entry) => entry.statHash === statHash) ?? false;
}

function resolveMasterworkPlugsForWeapon(item, masterworkPlugs, statGroups, statDefs) {
  const resolved = [];
  for (const [statHash, plugCategoryHash] of Object.entries(
    WEAPON_MASTERWORK_PLUG_CATEGORY,
  )) {
    const numericStatHash = Number(statHash);
    if (!isValidWeaponMasterworkStat(item, numericStatHash, statGroups)) continue;

    const plugsForStat = masterworkPlugs.filter(
      (plug) => plug.plug?.plugCategoryHash === plugCategoryHash,
    );
    if (!plugsForStat.length) continue;

    const best = plugsForStat.sort((a, b) => {
      const tierA = Number(a.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 0);
      const tierB = Number(b.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 0);
      return tierB - tierA;
    })[0];
    const tier = Number(best.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 10);
    const statName =
      statDefs[String(numericStatHash)]?.displayProperties?.name ??
      best.displayProperties?.name?.replace(/^Tier \d+: /, "") ??
      "Stat";

    resolved.push({ plug: best, statName, tier });
  }

  return resolved.sort((a, b) => a.statName.localeCompare(b.statName));
}

function masterworkPlugCatalogEntry({ plug, statName, tier }) {
  return {
    name: `Masterworked: ${statName}`,
    description: `+${tier} ${statName}`,
    iconPath: plug.displayProperties.icon,
  };
}

function isWeaponPerkSocket(categoryName, plugs) {
  if (categoryName !== "WEAPON PERKS") return false;
  return !plugs.every((plug) =>
    plugCategoryId(plug).includes("masterworks.trackers"),
  );
}

function isMasterworkSocket(categoryName, plugs) {
  if (categoryName !== "WEAPON MODS") return false;
  return plugs.some(isMasterworkStatPlug);
}

function resolveWeaponPerkColumns(
  item,
  items,
  plugSets,
  socketTypes,
  socketCategories,
  statGroups,
  statDefs,
  plugIndex,
) {
  const masterworkPlugs = [];
  const perkColumns = [];

  for (const socket of item.sockets?.socketEntries ?? []) {
    const socketType = socketTypes[String(socket.socketTypeHash)];
    const categoryHash = socketType?.socketCategoryHash;
    const categoryName =
      socketCategories[String(categoryHash)]?.displayProperties?.name ?? "";
    const plugs = dedupeWeaponPlugs(
      [...collectSocketPlugHashes(socket, plugSets)]
        .map((hash) => items[String(hash)])
        .filter(Boolean),
    );
    if (!plugs.length) continue;

    if (isMasterworkSocket(categoryName, plugs)) {
      masterworkPlugs.push(...plugs.filter(isMasterworkStatPlug));
      continue;
    }

    if (isWeaponPerkSocket(categoryName, plugs)) {
      perkColumns.push(dedupeWeaponPlugsByName(plugs));
    }
  }

  const columns = [];
  const masterworks = resolveMasterworkPlugsForWeapon(
    item,
    masterworkPlugs,
    statGroups,
    statDefs,
  );
  if (masterworks.length) {
    columns.push({
      type: "masterwork",
      plugHashes: masterworks.map(({ plug, statName, tier }) => {
        const hash = String(plug.hash);
        plugIndex.set(hash, masterworkPlugCatalogEntry({ plug, statName, tier }));
        return hash;
      }),
    });
  }

  for (const plugs of perkColumns) {
    columns.push({
      type: "perk",
      plugHashes: plugs.map((plug) => {
        const hash = String(plug.hash);
        plugIndex.set(hash, {
          name: plug.displayProperties.name,
          description: plug.displayProperties.description ?? "",
          iconPath: plug.displayProperties.icon,
        });
        return hash;
      }),
    });
  }

  return columns.length ? columns : undefined;
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
  const versionText = (entry.versions ?? []).flatMap((version) => [
    version.name,
    version.seasonLabel,
    version.eventLabel,
  ]);

  return [
    entry.name,
    entry.seasonLabel,
    entry.eventLabel,
    ...versionText,
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

function isCatalogVersionCandidate(item, group) {
  if (!isDisplayVariant(item)) return false;
  if (!isDebutRelevantVariant(item, group)) return false;

  const name = item.displayProperties?.name?.trim();
  const icon = item.displayProperties?.icon;
  if (!name || !icon) return false;

  const type = resolveTypeLabel(item);
  if (!type) return false;

  const rarity = item.inventory?.tierTypeName ?? "";
  if (!rarity || rarity === "Unknown") return false;

  return true;
}

function resolveSeasonIconPath(item) {
  return item?.iconWatermark || undefined;
}

function buildVersionsForNameGroup(
  group,
  collectibles,
  seasons,
  seasonPassItemSeason,
  seasonIndexAnchors,
  dimSeasonData,
  indexCohortAnchors,
  watermarkLabelMap,
  salvationsEdgeS29MinIndex,
  seasonDisplayIconLookup,
  items,
  plugSets,
  socketTypes,
  socketCategories,
  statGroups,
  statDefs,
  plugIndex,
) {
  const candidates = group
    .filter((item) => isCatalogVersionCandidate(item, group))
    .sort((a, b) => (b.index ?? 0) - (a.index ?? 0));

  const bySeason = new Map();
  const perkColumnsByHash = new Map();

  for (const item of candidates) {
    const collectible = item.collectibleHash
      ? collectibles[String(item.collectibleHash)] ?? null
      : null;
    const seasonLabel = resolveVersionSeasonLabel(
      item,
      collectible,
      seasons,
      seasonPassItemSeason,
      seasonIndexAnchors,
      dimSeasonData,
      { peerItems: group, indexCohortAnchors, watermarkLabelMap, salvationsEdgeS29MinIndex },
    );
    const seasonIconPath = resolveSeasonIconPath(item);
    const source = collectible?.sourceString ?? "";
    const eventLabel = resolveEventLabel(source, seasonIconPath, seasonLabel);
    const perkColumns = resolveWeaponPerkColumns(
      item,
      items,
      plugSets,
      socketTypes,
      socketCategories,
      statGroups,
      statDefs,
      plugIndex,
    );
    perkColumnsByHash.set(String(item.hash), perkColumns);

    const candidate = {
      itemHash: String(item.hash),
      name: item.displayProperties.name.trim(),
      iconPath: item.displayProperties.icon,
      seasonIconPath,
      seasonDisplayIconPath: resolveSeasonDisplayIconPath(
        seasonLabel,
        seasonIconPath,
        seasonDisplayIconLookup,
      ),
      seasonDisplayIconWatermark: resolveSeasonDisplayIconWatermark(
        seasonLabel,
        seasonDisplayIconLookup,
      ),
      seasonLabel,
      seasonNumber: displayNumberFromLabel(seasonLabel),
      ...(eventLabel ? { eventLabel } : {}),
      perkColumns,
      _manifestIndex: item.index ?? 0,
    };

    const compareContext = {
      perkColumnsForHash: (hash) => perkColumnsByHash.get(hash),
    };

    const mergeKey = [...bySeason.keys()].find((key) =>
      catalogVersionsEquivalent(bySeason.get(key), candidate, compareContext),
    );

    if (!mergeKey) {
      let key = seasonLabel;
      if (bySeason.has(key)) {
        key = `${seasonLabel}\0${candidate.itemHash}`;
      }
      bySeason.set(key, candidate);
      continue;
    }

    bySeason.set(
      mergeKey,
      preferCatalogVersion(bySeason.get(mergeKey), candidate),
    );
  }

  return [...bySeason.values()]
    .sort(
      (a, b) =>
        b.seasonNumber - a.seasonNumber || b._manifestIndex - a._manifestIndex,
    )
    .map(({ _manifestIndex, ...version }) => version);
}

function applyLatestVersionToEntry(entry, versions) {
  const latest = versions[0];
  if (!latest) return entry;

  entry.itemHash = latest.itemHash;
  entry.name = latest.name;
  entry.iconPath = latest.iconPath;
  entry.seasonIconPath = latest.seasonIconPath;
  entry.seasonDisplayIconPath = latest.seasonDisplayIconPath;
  entry.seasonDisplayIconWatermark = latest.seasonDisplayIconWatermark;
  entry.seasonLabel = latest.seasonLabel;
  entry.seasonNumber = latest.seasonNumber;
  if (latest.eventLabel) {
    entry.eventLabel = latest.eventLabel;
  } else {
    delete entry.eventLabel;
  }
  entry.versions = versions.length > 1 ? versions : undefined;
  entry.searchText = buildSearchText(entry);
  return entry;
}

function buildCatalog(
  items,
  collectibles,
  seasons,
  seasonPasses,
  progressions,
  dimSeasonData,
  statDefs,
  presentationNodes,
  plugSets,
  socketTypes,
  socketCategories,
  statGroups,
) {
  const byName = new Map();
  const plugIndex = new Map();
  const itemsByName = buildItemsByName(items);
  const seasonDisplayIconLookup = buildSeasonDisplayIconLookup(
    seasons,
    presentationNodes,
    items,
    collectibles,
  );
  const seasonPassItemSeason = buildSeasonPassItemSeasonMap(
    seasons,
    seasonPasses,
    progressions,
  );
  const seasonIndexAnchorOptions = { itemGroupKeyFn: catalogItemGroupKey };
  const initialAnchors = buildSeasonIndexAnchors(
    items,
    collectibles,
    seasons,
    seasonPassItemSeason,
    itemsByName,
    null,
    dimSeasonData,
    seasonIndexAnchorOptions,
  );
  let debutSeasonByName = buildDebutSeasonByName(
    itemsByName,
    collectibles,
    seasons,
    seasonPassItemSeason,
    initialAnchors,
    dimSeasonData,
  );
  const seasonIndexAnchors = buildSeasonIndexAnchors(
    items,
    collectibles,
    seasons,
    seasonPassItemSeason,
    itemsByName,
    debutSeasonByName,
    dimSeasonData,
    seasonIndexAnchorOptions,
  );
  debutSeasonByName = buildDebutSeasonByName(
    itemsByName,
    collectibles,
    seasons,
    seasonPassItemSeason,
    seasonIndexAnchors,
    dimSeasonData,
  );
  const indexCohortAnchors = buildWatermarkIndexAnchors(items, dimSeasonData);
  const watermarkLabelMap = buildWatermarkLabelMap(items, collectibles, seasons);
  const salvationsEdgeS29MinIndex = buildSalvationsEdgeS29ReissueMinIndex(
    items,
    dimSeasonData,
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
    const nameGroup = itemsByName.get(catalogGroupKey(name, type)) ?? [item];

    const displayCollectible = resolveCollectibleForVariant(
      displayItem,
      nameGroup,
      collectibles,
    );
    const source = displayCollectible?.sourceString ?? "";
    const seasonLabel = resolveVersionSeasonLabel(
      displayItem,
      displayCollectible,
      seasons,
      seasonPassItemSeason,
      seasonIndexAnchors,
      dimSeasonData,
      { peerItems: nameGroup, indexCohortAnchors, watermarkLabelMap, salvationsEdgeS29MinIndex },
    );
    const seasonNumber = displayNumberFromLabel(seasonLabel);
    const classOrWeaponType = resolveClassOrWeaponType(displayItem, type);
    const damageType =
      displayItem.itemType === 3 ? resolveDamageType(displayItem) : null;
    const slot = resolveSlotLabel(displayItem, type);
    const ammoType = resolveAmmoType(displayItem);
    const obtainable = displayCollectible
      ? isObtainable(
          displayItem,
          displayCollectible,
          seasonNumber,
          recentSeasonPassHashes,
          seasons,
          activeArtifactSeasonNumbers,
        )
      : false;

    const seasonIconPath = resolveSeasonIconPath(displayItem);
    const eventLabel = resolveEventLabel(source, seasonIconPath, seasonLabel);
    const entry = {
      itemHash: displayHash,
      alternateItemHashes: alternates.length ? alternates : undefined,
      name,
      iconPath: displayItem.displayProperties?.icon ?? "",
      seasonIconPath,
      seasonDisplayIconPath: resolveSeasonDisplayIconPath(
        seasonLabel,
        seasonIconPath,
        seasonDisplayIconLookup,
      ),
      seasonDisplayIconWatermark: resolveSeasonDisplayIconWatermark(
        seasonLabel,
        seasonDisplayIconLookup,
      ),
      seasonLabel,
      seasonNumber,
      ...(eventLabel ? { eventLabel } : {}),
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

    if (type === "Weapon") {
      const weaponDetail = resolveWeaponDetailFields(displayItem, statDefs);
      entry.slug = slugify(name);
      entry.description = weaponDetail.description;
      entry.screenshotPath = weaponDetail.screenshotPath;
      entry.stats = weaponDetail.stats;
      entry.perkColumns = resolveWeaponPerkColumns(
        displayItem,
        items,
        plugSets,
        socketTypes,
        socketCategories,
        statGroups,
        statDefs,
        plugIndex,
      );
    }

    entry.searchText = buildSearchText(entry);

    const key = catalogGroupKey(name, type);
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

  const usedSlugs = new Set();
  for (const entry of catalog) {
    if (entry.type !== "Weapon" || !entry.slug) continue;
    let slug = entry.slug;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${entry.itemHash}`;
    }
    usedSlugs.add(slug);
    entry.slug = slug;
  }

  for (const entry of catalog) {
    const nameKey = catalogGroupKey(entry.name, entry.type);
    const group = itemsByName.get(nameKey) ?? [];
    const versions = buildVersionsForNameGroup(
      group,
      collectibles,
      seasons,
      seasonPassItemSeason,
      seasonIndexAnchors,
      dimSeasonData,
      indexCohortAnchors,
      watermarkLabelMap,
      salvationsEdgeS29MinIndex,
      seasonDisplayIconLookup,
      items,
      plugSets,
      socketTypes,
      socketCategories,
      statGroups,
      statDefs,
      plugIndex,
    );
    applyLatestVersionToEntry(entry, versions);

    if (entry.type === "Weapon" && versions.length) {
      const groupByHash = new Map(
        group.map((item) => [String(item.hash), item]),
      );
      for (const version of versions) {
        const manifestItem = groupByHash.get(version.itemHash);
        if (manifestItem) {
          version.perkColumns = resolveWeaponPerkColumns(
            manifestItem,
            items,
            plugSets,
            socketTypes,
            socketCategories,
            statGroups,
            statDefs,
            plugIndex,
          );
        }
      }
      if (versions[0]?.perkColumns?.length) {
        entry.perkColumns = versions[0].perkColumns;
      }
      if (versions.length > 1) {
        entry.versions = versions;
      }
    }

    entry.searchText = buildSearchText(entry);
    const alternates = group
      .map((item) => String(item.hash))
      .filter((hash) => hash !== entry.itemHash);
    entry.alternateItemHashes = alternates.length ? alternates : undefined;
  }

  const seasonSet = new Set();
  for (const item of catalog) {
    if (item.versions?.length) {
      for (const version of item.versions) {
        seasonSet.add(version.seasonLabel);
      }
    } else {
      seasonSet.add(item.seasonLabel);
    }
  }
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

  return { catalog, facets, plugIndex: Object.fromEntries(plugIndex) };
}

function isClassLabel(value) {
  return value === "Titan" || value === "Hunter" || value === "Warlock";
}

async function main() {
  console.log("Loading Bungie manifest…");
  const [
    {
      items,
      collectibles,
      seasons,
      seasonPasses,
      progressions,
      statDefs,
      presentationNodes,
      plugSets,
      socketTypes,
      socketCategories,
      statGroups,
    },
    dimSeasonData,
  ] = await Promise.all([loadManifestTables(), loadDimSeasonData()]);
  const { catalog, facets, plugIndex } = buildCatalog(
    items,
    collectibles,
    seasons,
    seasonPasses,
    progressions,
    dimSeasonData,
    statDefs,
    presentationNodes,
    plugSets,
    socketTypes,
    socketCategories,
    statGroups,
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
        plugIndex,
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
