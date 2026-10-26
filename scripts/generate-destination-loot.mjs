/**
 * Builds data/destination-loot.json — per destination, the item names from its
 * destination engram (Bungie's official loot pool), its vendor's own rewards and
 * every collectible whose source names the place (random-perk weapons lose their
 * real source in the catalog, but the collectible keeps it).
 * The destination pages merge this with catalog items whose "Source" names the place.
 *
 * Usage: node scripts/generate-destination-loot.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/**
 * engram: destination engram name (the smallest pool variant is used — the big
 * ones add generic "World Gear" shared by every destination).
 * vendor: vendor hash + which of its items count as destination loot.
 */
const DESTINATIONS = {
  "european-dead-zone": {
    engram: "EDZ Engram",
    vendor: { hash: "396892126", types: [2, 3] },
    collectibleSource: /european dead zone|\bedz\b/i,
  },
  nessus: { engram: "Nessus Engram", vendor: { hash: "1576276905", types: [2, 3] }, collectibleSource: /nessus/i },
  "dreaming-city": { vendor: { hash: "1841717884", types: [3] }, collectibleSource: /dreaming city/i },
  // Shaw Han's list is mostly a redemption kiosk (pre-orders, Exotic Archive);
  // only his unnamed category holds Cosmodrome rewards.
  cosmodrome: {
    vendor: { hash: "1816541247", types: [2, 3, 21], displayCategoryIndex: 13 },
    collectibleSource: /cosmodrome/i,
  },
  "throne-world": {
    engram: "Throne World Engram",
    vendor: { hash: "2384113223", types: [2, 3] },
    collectibleSource: /exploring the throne world|wellspring/i,
  },
  europa: { collectibleSource: /exploring europa|^europa$|empire hunts|europan tour/i },
  // Eris Morn's unnamed category holds the Moon exotic quests (Xenophage, Deathbringer).
  "the-moon": {
    vendor: { hash: "1616085565", types: [2, 3], displayCategoryIndex: 9 },
    collectibleSource: /exploring the moon|altars of sorrow|nightmare hunt|ghosts of the moon|^the moon$/i,
  },
  "the-pale-heart": { engram: "Pale Heart Engram", collectibleSource: /pale heart/i },
};

/** Vendor reputation tracks (rank names + icon for the destination page). */
const REPUTATIONS = {
  "throne-world": "4203877294",
  neomuna: "1807348350",
  "the-pale-heart": "3011295063",
};

/** Collectible item types that count as loot: armor, weapons, emblems, shaders/mods (19, mods are dropped on the page), ships, sparrows, ghosts. */
const LOOT_ITEM_TYPES = new Set([2, 3, 14, 19, 21, 22, 24]);

/** Never destination-specific. */
const GENERIC_NAMES = new Set(["World Gear", "Legendary Shards"]);

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // optional
  }
}

async function fetchJson(path) {
  const url = `https://www.bungie.net${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": process.env.BUNGIE_API_KEY } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

loadEnv();
if (!process.env.BUNGIE_API_KEY) {
  console.error("Missing BUNGIE_API_KEY in .env.local");
  process.exit(1);
}

const manifest = (await fetchJson("/Platform/Destiny2/Manifest/")).Response.jsonWorldComponentContentPaths.en;
const [items, vendors, collectibles, activities] = await Promise.all([
  fetchJson(manifest.DestinyInventoryItemDefinition),
  fetchJson(manifest.DestinyVendorDefinition),
  fetchJson(manifest.DestinyCollectibleDefinition),
  fetchJson(manifest.DestinyActivityDefinition),
]);

function collectibleLoot(pattern) {
  return Object.values(collectibles)
    .filter((collectible) => pattern.test(collectible.sourceString ?? ""))
    .map((collectible) => items[collectible.itemHash])
    .filter((item) => item && LOOT_ITEM_TYPES.has(item.itemType) && item.displayProperties?.name)
    .map((item) => item.displayProperties.name);
}

function engramPool(name) {
  const variants = Object.values(items)
    .filter((item) => item.displayProperties?.name === name)
    .map((item) =>
      (item.preview?.derivedItemCategories ?? []).flatMap((category) =>
        category.items.map((entry) => items[entry.itemHash]?.displayProperties?.name).filter(Boolean),
      ),
    )
    .filter((names) => names.length > 0)
    .sort((a, b) => a.length - b.length);
  return (variants[0] ?? []).filter((entry) => !GENERIC_NAMES.has(entry));
}

function vendorRewards({ hash, types, displayCategoryIndex }) {
  const vendor = vendors[hash];
  if (!vendor) return [];
  return (vendor.itemList ?? [])
    .filter((entry) => displayCategoryIndex === undefined || entry.displayCategoryIndex === displayCategoryIndex)
    .map((entry) => items[entry.itemHash])
    .filter((item) => item && types.includes(item.itemType) && item.displayProperties?.name)
    .map((item) => item.displayProperties.name);
}

const output = { generatedAt: new Date().toISOString(), destinations: {} };
for (const [slug, config] of Object.entries(DESTINATIONS)) {
  const names = [
    ...(config.engram ? engramPool(config.engram) : []),
    ...(config.vendor ? vendorRewards(config.vendor) : []),
    ...(config.collectibleSource ? collectibleLoot(config.collectibleSource) : []),
  ];
  output.destinations[slug] = [...new Set(names)].sort();
  console.log(`${slug}: ${output.destinations[slug].length} items`);
}

output.reputation = {};
for (const [slug, hash] of Object.entries(REPUTATIONS)) {
  const progression = await fetchJson(`/Platform/Destiny2/Manifest/DestinyProgressionDefinition/${hash}/`);
  const steps = progression.Response?.steps ?? [];
  output.reputation[slug] = {
    // Rank names and emblems by level (index 0 = rank 0).
    steps: steps.map((step) => ({ name: step.stepName ?? "", icon: step.icon ?? null })),
  };
}

// Wellspring activity hashes → mode + boss, so the page can read today's encounter
// from a public profile's launchable activities.
const WELLSPRING_DROPS = {
  "Vezuul, Lightflayer": "Tarnation",
  "Bor'gong, Warden of the Spring": "Fel Taradiddle",
  "Golmag, Warden of the Spring": "Come to Pass",
  "Zeerik, Lightflayer": "Father's Sins",
};
output.wellspring = {};
for (const [hash, activity] of Object.entries(activities)) {
  const match = /^The Wellspring: (Attack|Defend)/.exec(activity.displayProperties?.name ?? "");
  if (!match) continue;
  const boss = Object.keys(WELLSPRING_DROPS).find((name) => (activity.displayProperties.description ?? "").includes(name));
  if (!boss) continue;
  output.wellspring[hash] = { mode: match[1], boss, drop: WELLSPRING_DROPS[boss] };
}

writeFileSync(resolve(root, "data/destination-loot.json"), JSON.stringify(output, null, 2));
console.log("Wrote data/destination-loot.json");
