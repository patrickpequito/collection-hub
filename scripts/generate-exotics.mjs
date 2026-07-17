/**
 * Fetches exotic items from the Bungie manifest and writes data/exotics.json.
 *
 * Usage: node scripts/generate-exotics.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  1498876634: "primary",
  2465295065: "special",
  953998645: "heavy",
};

const ARMOR_BUCKET_TO_SLOT = {
  3448274439: "helmet",
  3551918588: "gauntlets",
  14239492: "chest",
  20886954: "legs",
  1585787867: "classItem",
  158374255: "classItem",
  2422292813: "classItem",
};

const CLASS_TO_CATEGORY = {
  1: "hunter",
  0: "titan",
  2: "warlock",
};

async function fetchJson(path) {
  const url = `https://www.bungie.net${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function loadManifestTables() {
  const manifest = (
    await fetchJson("/Platform/Destiny2/Manifest/")
  ).Response.jsonWorldComponentContentPaths.en;

  const [items, collectibles] = await Promise.all([
    fetchJson(manifest.DestinyInventoryItemDefinition),
    fetchJson(manifest.DestinyCollectibleDefinition),
  ]);

  return { items, collectibles };
}

function buildExoticCatalog(items, collectibles) {
  const seen = new Set();
  const catalog = [];

  for (const item of Object.values(items)) {
    if (item.inventory?.tierTypeName !== "Exotic") continue;

    const coll = collectibles[String(item.collectibleHash)];
    if (!coll?.sourceString) continue;

    const hash = String(item.hash);
    if (seen.has(hash)) continue;
    seen.add(hash);

    const entry = {
      itemHash: hash,
      name: item.displayProperties?.name ?? "Unknown",
      iconPath: item.displayProperties?.icon ?? "",
      source: coll.sourceString,
    };

    if (item.itemType === 3) {
      const weaponSlot = WEAPON_BUCKET_TO_SLOT[item.inventory?.bucketTypeHash];
      if (!weaponSlot) continue;
      catalog.push({
        ...entry,
        category: "weapons",
        weaponSlot,
      });
      continue;
    }

    if (item.itemType === 2) {
      const armorSlot = ARMOR_BUCKET_TO_SLOT[item.inventory?.bucketTypeHash];
      const category = CLASS_TO_CATEGORY[item.classType];
      if (!armorSlot || !category) continue;
      catalog.push({
        ...entry,
        category,
        armorSlot,
      });
    }
  }

  catalog.sort((a, b) => a.name.localeCompare(b.name));
  return catalog;
}

async function main() {
  console.log("Loading Bungie manifest…");
  const { items, collectibles } = await loadManifestTables();
  const itemsList = buildExoticCatalog(items, collectibles);

  const outDir = resolve(root, "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "exotics.json");
  writeFileSync(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), items: itemsList }, null, 2),
  );

  const byCategory = {};
  for (const item of itemsList) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }

  console.log(`Wrote ${itemsList.length} exotics to data/exotics.json`);
  console.log(byCategory);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
