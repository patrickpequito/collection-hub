/**
 * Builds public/data/item-hash-index.json from the Bungie manifest.
 * Used to match catalog item hashes with inventory/collection variants.
 *
 * Usage: node scripts/generate-item-hash-index.mjs
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

  const items = await fetchJson(manifest.DestinyInventoryItemDefinition);
  return items;
}

function buildIndex(items) {
  const byName = new Map();
  const collectibleByItemHash = {};
  const itemsByCollectibleHash = {};

  for (const item of Object.values(items)) {
    const name = item.displayProperties?.name?.trim();
    const hash = String(item.hash);
    if (!name) continue;

    if (!byName.has(name)) byName.set(name, new Set());
    byName.get(name).add(hash);

    const collectibleHash = item.collectibleHash;
    if (collectibleHash) {
      const coll = String(collectibleHash);
      collectibleByItemHash[hash] = coll;
      if (!itemsByCollectibleHash[coll]) itemsByCollectibleHash[coll] = [];
      if (!itemsByCollectibleHash[coll].includes(hash)) {
        itemsByCollectibleHash[coll].push(hash);
      }
    }
  }

  const nameToHashes = {};
  const hashToName = {};

  for (const [name, hashes] of byName) {
    if (hashes.size < 2) continue;
    const list = [...hashes].sort();
    nameToHashes[name] = list;
    for (const hash of list) {
      hashToName[hash] = name;
    }
  }

  return {
    hashToName,
    nameToHashes,
    collectibleByItemHash,
    itemsByCollectibleHash,
  };
}

async function main() {
  const items = await loadManifestTables();
  const index = buildIndex(items);

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "item-hash-index.json");
  writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`);

  console.log(`Wrote ${outPath}`);
  console.log(
    `  ${Object.keys(index.nameToHashes).length} duplicate display names`,
  );
  console.log(
    `  ${Object.keys(index.itemsByCollectibleHash).length} collectibles mapped`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
