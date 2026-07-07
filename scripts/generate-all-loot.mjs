/**
 * Builds data/all-loot.json — deduplicated collectible catalog for All Loot.
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
  catalogArmorGroupName,
  catalogArmorPieceGroupKey,
  catalogEntryGroupKey,
  displayNumberFromLabel,
  isActiveSeasonalArtifact,
  isDebutRelevantVariant,
  isMonumentWeaponReissue,
  isSourceObtainable,
  normalizeItemName,
  orderFacetValues,
  resolveCollectibleForVariant,
  resolveCollectibleSourceString,
  resolveEventLabel,
  catalogVersionsEquivalent,
  preferCatalogVersion,
  resolveSeasonDisplayIconPath,
  resolveSeasonDisplayIconWatermark,
  resolveArmor30SeasonLabel,
  resolveVersionSeasonLabel,
  resolveWatermarkSeasonNumber,
  seasonLabelFromManifestNumber,
  MONUMENT_OF_TRIUMPH_LABEL,
  inferSeasonLabelFromIndex,
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

const ARMOR_30_ARCHETYPE_PLUG_SET_HASH = 1315181101;

const YEAR8_ARMOR_CHAPTER_LABELS = new Set([
  MONUMENT_OF_TRIUMPH_LABEL,
  "The Edge of Fate",
  "Renegades",
  "S26 Episode: Heresy",
]);

function hasArtificeArmorSocket(item, items) {
  for (const entry of item.sockets?.socketEntries ?? []) {
    const plugHash = entry.singleInitialItemHash;
    if (!plugHash) continue;
    const plug = items[String(plugHash)];
    const name = plug?.displayProperties?.name ?? "";
    if (/artifice/i.test(name)) return true;
  }
  return false;
}

function inferYear8ArmorChapterLabel(index, seasonIndexAnchors) {
  const anchors = seasonIndexAnchors.filter(
    (anchor) =>
      YEAR8_ARMOR_CHAPTER_LABELS.has(anchor.seasonLabel) &&
      anchor.index >= 32000,
  );
  if (!anchors.length) return MONUMENT_OF_TRIUMPH_LABEL;
  return inferSeasonLabelFromIndex(index, anchors);
}

function resolveExoticIntrinsic(item, items) {
  for (const entry of item.sockets?.socketEntries ?? []) {
    const plugHash = entry.singleInitialItemHash;
    if (!plugHash) continue;
    const plug = items[String(plugHash)];
    if (!plug) continue;
    const category = plugCategoryId(plug);
    const name = plug.displayProperties?.name?.trim() ?? "";
    const description = plug.displayProperties?.description?.trim() ?? "";
    if (!name || !description) continue;
    if (!category.includes("intrinsics")) continue;
    if (/empty|default shader|default ornament|upgrade armor/i.test(name)) {
      continue;
    }
    return {
      name,
      description,
      iconPath: plug.displayProperties?.icon || undefined,
    };
  }
  return undefined;
}

function isCodaLegacyRedWarArmor(item, peerItems) {
  const name = item.displayProperties?.name?.trim() ?? "";
  if (!name || /\(CODA\)/i.test(name)) return false;
  if (item.inventory?.tierTypeName !== "Legendary") return false;
  if (
    !peerItems.some((peer) =>
      /\(CODA\)/i.test(peer.displayProperties?.name ?? ""),
    )
  ) {
    return false;
  }

  const legacyPeers = peerItems.filter(
    (peer) => !/\(CODA\)/i.test(peer.displayProperties?.name ?? ""),
  );
  if (!legacyPeers.length) return false;

  const oldestLegacy = [...legacyPeers].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  )[0];
  return String(oldestLegacy?.hash) === String(item.hash);
}

function resolveArmorVersionSeasonLabel(
  item,
  collectible,
  seasons,
  seasonPassItemSeason,
  seasonIndexAnchors,
  dimSeasonData,
  context,
) {
  const { peerItems = [], items = {} } = context;
  const sortedPeers = [...peerItems].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );
  const isOldestPeer =
    sortedPeers.length > 1 &&
    String(sortedPeers[0]?.hash) === String(item.hash);

  if (isCodaLegacyRedWarArmor(item, peerItems)) {
    return "Red War";
  }

  if (isArmor30Item(item)) {
    const source = resolveCollectibleSourceString(collectible);
    const armorLabel = resolveArmor30SeasonLabel(
      item,
      source,
      seasons,
      dimSeasonData,
    );
    if (armorLabel) return armorLabel;
    return inferYear8ArmorChapterLabel(item.index ?? 0, seasonIndexAnchors);
  }

  if (isOldestPeer && item.inventory?.tierTypeName === "Exotic") {
    const hasCollectible = Boolean(collectible?.sourceString);
    if (hasCollectible) {
      return "Red War";
    }
  }

  if (hasArtificeArmorSocket(item, items)) {
    const watermarkLabel = resolveVersionSeasonLabel(
      item,
      collectible,
      seasons,
      seasonPassItemSeason,
      seasonIndexAnchors,
      dimSeasonData,
      context,
    );
    if (watermarkLabel && watermarkLabel !== "Shadowkeep") {
      return watermarkLabel;
    }
    return "Shadowkeep";
  }

  return resolveVersionSeasonLabel(
    item,
    collectible,
    seasons,
    seasonPassItemSeason,
    seasonIndexAnchors,
    dimSeasonData,
    context,
  );
}

const ARMOR_STAT_ORDER = [
  { hash: 392767087, name: "Health" },
  { hash: 3493869314, name: "Melee" },
  { hash: 1735777505, name: "Grenade" },
  { hash: 144602215, name: "Super" },
  { hash: 1943323491, name: "Class" },
  { hash: 2996146975, name: "Weapons" },
];

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


function resolveCatalogTypeLabel(item) {
  const type = resolveTypeLabel(item);
  if (type) return type;
  if (isMonumentWeaponReissue(item)) return "Weapon";
  return null;
}

function catalogItemGroupKey(item) {
  const name = item.displayProperties?.name;
  const type = resolveCatalogTypeLabel(item);
  if (!name?.trim() || !type) return null;
  if (type === "Armor") {
    const slot = resolveSlotLabel(item, type);
    const guardianClass = resolveClassOrWeaponType(item, type);
    if (slot && guardianClass) {
      return catalogArmorPieceGroupKey(name, guardianClass, slot);
    }
  }
  return catalogEntryGroupKey(name, type);
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

function resolveArmorStats(displayItem, statDefs, rarity) {
  const statsBlock = displayItem.stats?.stats ?? {};
  const byHash = new Map(
    Object.values(statsBlock).map((entry) => [String(entry.statHash), entry]),
  );

  if (rarity !== "Exotic") {
    return ARMOR_STAT_ORDER.map(({ hash, name }) => ({
      name,
      value: 0,
      max: statDefs[String(hash)]?.displayMaximum || 100,
    }));
  }

  const investmentByName = new Map();
  for (const investment of mapManifestInvestmentStats(displayItem)) {
    const statName = ARMOR_STAT_ORDER.find(
      ({ hash }) => String(hash) === investment.statHash,
    )?.name;
    if (statName) {
      investmentByName.set(statName, investment.value);
    }
  }

  return ARMOR_STAT_ORDER.map(({ hash, name }) => {
    const entry = byHash.get(String(hash));
    return {
      name,
      value: investmentByName.get(name) ?? entry?.value ?? 0,
      max:
        entry?.displayMaximum ||
        statDefs[String(hash)]?.displayMaximum ||
        100,
    };
  });
}

function resolveArmorDetailFields(displayItem, statDefs, rarity, items) {
  const description =
    displayItem.flavorText?.trim() ||
    displayItem.displayProperties?.description?.trim() ||
    undefined;
  const screenshotPath = displayItem.screenshot || undefined;
  const stats = resolveArmorStats(displayItem, statDefs, rarity);
  const equipableItemSetHash =
    displayItem.equippingBlock?.equipableItemSetHash || undefined;
  const exoticPerk =
    rarity === "Exotic"
      ? resolveExoticIntrinsic(displayItem, items)
      : undefined;

  return {
    description,
    screenshotPath,
    stats,
    equipableItemSetHash,
    exoticPerk,
  };
}

function resolveEquipableItemSetHashFromGroup(group) {
  let bestHash = null;
  let bestIndex = -1;

  for (const item of group) {
    const setHash = item.equippingBlock?.equipableItemSetHash;
    if (!setHash) continue;
    const index = item.index ?? 0;
    if (index >= bestIndex) {
      bestIndex = index;
      bestHash = String(setHash);
    }
  }

  return bestHash;
}

function isArmor30Item(item) {
  return (item.sockets?.socketEntries ?? []).some(
    (entry) =>
      entry.randomizedPlugSetHash === ARMOR_30_ARCHETYPE_PLUG_SET_HASH,
  );
}

function mapManifestInvestmentStats(item) {
  return (item.investmentStats ?? [])
    .map((entry) => ({
      statHash: String(entry.statTypeHash ?? entry.statHash),
      value: entry.value,
    }))
    .filter((entry) => entry.statHash && entry.statHash !== "undefined");
}

function plugCatalogEntry(plug) {
  return {
    name: plug.displayProperties.name,
    description: plug.displayProperties.description?.trim() || "",
    iconPath: plug.displayProperties.icon || "",
    investmentStats: mapManifestInvestmentStats(plug),
    plugCategoryIdentifier: plugCategoryId(plug),
  };
}

function indexArmorRollPlugs(displayItem, items, plugSets, plugIndex) {
  for (const socket of displayItem.sockets?.socketEntries ?? []) {
    for (const setHash of [
      socket.randomizedPlugSetHash,
      socket.reusablePlugSetHash,
    ]) {
      if (!setHash) continue;
      const set = plugSets[String(setHash)];
      for (const plug of set?.reusablePlugItems ?? []) {
        const plugItem = items[String(plug.plugItemHash)];
        if (
          !plugItem?.displayProperties?.name ||
          (!plugCategoryId(plugItem).includes("armor_archetypes") &&
            !plugCategoryId(plugItem).includes("armor_stats"))
        ) {
          continue;
        }
        plugIndex.set(String(plug.plugItemHash), plugCatalogEntry(plugItem));
      }
    }
  }
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

  for (let socketIndex = 0; socketIndex < (item.sockets?.socketEntries?.length ?? 0); socketIndex++) {
    const socket = item.sockets.socketEntries[socketIndex];
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
      for (const plug of plugs) {
        const hash = String(plug.hash);
        plugIndex.set(hash, plugIndex.get(hash) ?? {
          name: plug.displayProperties.name,
          description: plug.displayProperties.description ?? "",
          iconPath: plug.displayProperties.icon,
        });
      }
      perkColumns.push({
        socketIndex,
        plugs: dedupeWeaponPlugsByName(plugs),
      });
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

  for (const { socketIndex, plugs } of perkColumns) {
    columns.push({
      type: "perk",
      socketIndex,
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

  const type = resolveCatalogTypeLabel(item);
  if (!type) return false;

  const rarity = item.inventory?.tierTypeName ?? "";
  if (!rarity || rarity === "Unknown") return false;

  // Stale manifest rows for exotic armor lack a collectible and must not become
  // catalog versions (they are mislabeled "Red War" via oldest-peer logic).
  if (item.itemType === 2 && rarity === "Exotic" && !item.collectibleHash) {
    return false;
  }

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

  const groupByHash = new Map(group.map((item) => [String(item.hash), item]));
  const isArmor30ForHash = (hash) => {
    const item = groupByHash.get(hash);
    return item ? isArmor30Item(item) : undefined;
  };

  const bySeason = new Map();
  const perkColumnsByHash = new Map();

  for (const item of candidates) {
    const collectible = item.collectibleHash
      ? collectibles[String(item.collectibleHash)] ?? null
      : null;
    const seasonLabel =
      item.itemType === 2
        ? resolveArmorVersionSeasonLabel(
            item,
            collectible,
            seasons,
            seasonPassItemSeason,
            seasonIndexAnchors,
            dimSeasonData,
            {
              peerItems: group,
              indexCohortAnchors,
              watermarkLabelMap,
              salvationsEdgeS29MinIndex,
              items,
            },
          )
        : resolveVersionSeasonLabel(
            item,
            collectible,
            seasons,
            seasonPassItemSeason,
            seasonIndexAnchors,
            dimSeasonData,
            {
              peerItems: group,
              indexCohortAnchors,
              watermarkLabelMap,
              salvationsEdgeS29MinIndex,
            },
          );
    const seasonIconPath = resolveSeasonIconPath(item);
    const source = resolveCollectibleSourceString(collectible);
    const eventLabel = resolveEventLabel(source, seasonIconPath, seasonLabel);
    const isExotic = item.inventory?.tierTypeName === "Exotic";
    const exoticPerk = isExotic
      ? resolveExoticIntrinsic(item, items)
      : undefined;
    let perkColumns = resolveWeaponPerkColumns(
      item,
      items,
      plugSets,
      socketTypes,
      socketCategories,
      statGroups,
      statDefs,
      plugIndex,
    );
    if (!perkColumns?.length && isMonumentWeaponReissue(item)) {
      const weaponPeer = group
        .filter((variant) => variant.itemType === 3)
        .sort((a, b) => (b.index ?? 0) - (a.index ?? 0))[0];
      if (weaponPeer) {
        perkColumns = resolveWeaponPerkColumns(
          weaponPeer,
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
      ...(item.screenshot ? { screenshotPath: item.screenshot } : {}),
      ...(exoticPerk ? { exoticPerk } : {}),
      perkColumns,
      _manifestIndex: item.index ?? 0,
    };

    const compareContext = {
      perkColumnsForHash: (hash) => perkColumnsByHash.get(hash),
      isArmor30ForHash,
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
  if (latest.screenshotPath) {
    entry.screenshotPath = latest.screenshotPath;
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
    const nameGroup = itemsByName.get(catalogItemGroupKey(item)) ?? [item];

    const displayCollectible = resolveCollectibleForVariant(
      displayItem,
      nameGroup,
      collectibles,
    );
    const source = resolveCollectibleSourceString(displayCollectible);
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
      if (rarity === "Exotic") {
        const exoticPerk = resolveExoticIntrinsic(displayItem, items);
        if (exoticPerk) {
          entry.exoticPerk = exoticPerk;
        }
      }
    }

    if (type === "Armor") {
      const armorDetail = resolveArmorDetailFields(
        displayItem,
        statDefs,
        rarity,
        items,
      );
      entry.slug = slugify(name);
      entry.description = armorDetail.description;
      entry.screenshotPath = armorDetail.screenshotPath;
      entry.stats = armorDetail.stats;
      if (armorDetail.exoticPerk) {
        entry.exoticPerk = armorDetail.exoticPerk;
      }
      if (armorDetail.equipableItemSetHash) {
        entry.equipableItemSetHash = String(armorDetail.equipableItemSetHash);
      }
      indexArmorRollPlugs(displayItem, items, plugSets, plugIndex);
    }

    entry.searchText = buildSearchText(entry);

    const key =
      type === "Armor" && classOrWeaponType && slot
        ? catalogArmorPieceGroupKey(name, classOrWeaponType, slot)
        : catalogEntryGroupKey(name, type);
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
    if ((entry.type !== "Weapon" && entry.type !== "Armor") || !entry.slug) {
      continue;
    }
    let slug = entry.slug;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${entry.itemHash}`;
    }
    usedSlugs.add(slug);
    entry.slug = slug;
  }

  for (const entry of catalog) {
    const nameKey =
      entry.type === "Armor" && entry.classOrWeaponType && entry.slot
        ? catalogArmorPieceGroupKey(
            entry.name,
            entry.classOrWeaponType,
            entry.slot,
          )
        : catalogEntryGroupKey(entry.name, entry.type);
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

    if (entry.type === "Armor") {
      const setHash = resolveEquipableItemSetHashFromGroup(group);
      if (setHash) {
        entry.equipableItemSetHash = setHash;
      }

      const armor30ByItemHash = {};
      const manifestInvestmentByItemHash = {};
      const exoticPerkByItemHash = {};
      for (const item of group) {
        const hash = String(item.hash);
        armor30ByItemHash[hash] = isArmor30Item(item);
        const investmentStats = mapManifestInvestmentStats(item);
        if (investmentStats.length) {
          manifestInvestmentByItemHash[hash] = investmentStats;
        }
        if (entry.rarity === "Exotic") {
          const exoticPerk = resolveExoticIntrinsic(item, items);
          if (exoticPerk) {
            exoticPerkByItemHash[hash] = exoticPerk;
          }
        }
      }

      entry.isArmor30 = armor30ByItemHash[entry.itemHash] ?? false;
      entry.manifestInvestmentStats =
        manifestInvestmentByItemHash[entry.itemHash];
      entry.isArmor30ByItemHash = armor30ByItemHash;

      if (versions.length > 1) {
        const armor30Version = versions.find(
          (version) => armor30ByItemHash[version.itemHash],
        );
        if (armor30Version) {
          entry.itemHash = armor30Version.itemHash;
          entry.iconPath = armor30Version.iconPath;
          entry.seasonIconPath = armor30Version.seasonIconPath;
          entry.seasonDisplayIconPath = armor30Version.seasonDisplayIconPath;
          entry.seasonDisplayIconWatermark =
            armor30Version.seasonDisplayIconWatermark;
          entry.seasonLabel = armor30Version.seasonLabel;
          entry.seasonNumber = armor30Version.seasonNumber;
          if (armor30Version.eventLabel) {
            entry.eventLabel = armor30Version.eventLabel;
          } else {
            delete entry.eventLabel;
          }
          entry.isArmor30 = true;
          entry.manifestInvestmentStats =
            manifestInvestmentByItemHash[armor30Version.itemHash];
          if (entry.rarity === "Exotic") {
            entry.exoticPerk =
              exoticPerkByItemHash[armor30Version.itemHash] ?? entry.exoticPerk;
          }
          entry.versions = versions;
        }
      }

      if (entry.rarity === "Exotic") {
        entry.exoticPerk =
          exoticPerkByItemHash[entry.itemHash] ?? entry.exoticPerk;
      }
      if (Object.keys(manifestInvestmentByItemHash).length) {
        entry.manifestInvestmentByItemHash = manifestInvestmentByItemHash;
      }
      if (Object.keys(exoticPerkByItemHash).length) {
        entry.exoticPerkByItemHash = exoticPerkByItemHash;
      }

      if (versions.length) {
        const groupByHash = new Map(
          group.map((item) => [String(item.hash), item]),
        );
        for (const version of versions) {
          const manifestItem = groupByHash.get(version.itemHash);
          if (manifestItem) {
            version.stats = resolveArmorStats(
              manifestItem,
              statDefs,
              entry.rarity,
            );
            if (entry.rarity === "Exotic") {
              const versionPerk =
                exoticPerkByItemHash[version.itemHash] ??
                resolveExoticIntrinsic(manifestItem, items);
              if (versionPerk) {
                version.exoticPerk = versionPerk;
              }
            }
          }
        }
      }
    }

    if (entry.type === "Weapon" && entry.rarity === "Exotic") {
      const exoticPerkByItemHash = {};
      for (const item of group) {
        const hash = String(item.hash);
        const exoticPerk = resolveExoticIntrinsic(item, items);
        if (exoticPerk) {
          exoticPerkByItemHash[hash] = exoticPerk;
        }
      }
      if (Object.keys(exoticPerkByItemHash).length) {
        entry.exoticPerkByItemHash = exoticPerkByItemHash;
        entry.exoticPerk =
          exoticPerkByItemHash[entry.itemHash] ?? entry.exoticPerk;
      }
      if (versions.length) {
        for (const version of versions) {
          const versionPerk = exoticPerkByItemHash[version.itemHash];
          if (versionPerk) {
            version.exoticPerk = versionPerk;
          }
        }
      }
    }

    if (entry.type === "Weapon" && versions.length) {
      const groupByHash = new Map(
        group.map((item) => [String(item.hash), item]),
      );
      for (const version of versions) {
        const manifestItem = groupByHash.get(version.itemHash);
        if (manifestItem) {
          const weaponDetail = resolveWeaponDetailFields(manifestItem, statDefs);
          if (weaponDetail.screenshotPath) {
            version.screenshotPath = weaponDetail.screenshotPath;
          }
          if (weaponDetail.stats?.length) {
            version.stats = weaponDetail.stats;
          }
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
      if (versions[0]?.screenshotPath) {
        entry.screenshotPath = versions[0].screenshotPath;
      }

      const screenshotPathByItemHash = {};
      for (const version of versions) {
        if (
          version.screenshotPath &&
          version.itemHash !== entry.itemHash
        ) {
          screenshotPathByItemHash[version.itemHash] = version.screenshotPath;
        }
      }
      if (Object.keys(screenshotPathByItemHash).length) {
        entry.screenshotPathByItemHash = screenshotPathByItemHash;
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

  indexAllPlugInvestments(items, plugIndex);

  return { catalog, facets, plugIndex: Object.fromEntries(plugIndex) };
}

function indexAllPlugInvestments(items, plugIndex) {
  for (const item of Object.values(items)) {
    if (!item.investmentStats?.length) continue;
    const name = item.displayProperties?.name?.trim();
    if (!name) continue;

    const hash = String(item.hash);
    const existing = plugIndex.get(hash);
    plugIndex.set(hash, {
      name,
      description:
        item.displayProperties.description?.trim() || existing?.description || "",
      iconPath: item.displayProperties.icon || existing?.iconPath || "",
      investmentStats: mapManifestInvestmentStats(item),
      plugCategoryIdentifier:
        plugCategoryId(item) || existing?.plugCategoryIdentifier || "",
    });
  }
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

  const outDir = resolve(root, "data");
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

  console.log(`Wrote ${catalog.length} items to data/all-loot.json`);
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
