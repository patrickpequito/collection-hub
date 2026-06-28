/**
 * Fills versions[].perkColumns and versions[].stats from the Bungie manifest.
 *
 * Usage: node scripts/patch-version-perk-columns.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveWeaponPerkColumnsFromManifest,
  resolveWeaponStatsFromManifest,
} from "./lib/weapon-perk-columns.mjs";

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
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const headers = path.startsWith("http") ? {} : { "X-API-Key": API_KEY };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

function collectHashesForEntry(entry) {
  const hashes = new Set([entry.itemHash]);
  for (const hash of entry.alternateItemHashes ?? []) hashes.add(hash);
  for (const hash of entry.mergedVersionHashes ?? []) hashes.add(hash);
  for (const version of entry.versions ?? []) hashes.add(version.itemHash);
  return [...hashes];
}

async function main() {
  const catalogPath = resolve(root, "public/data/all-loot.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const plugIndex = catalog.plugIndex ?? {};

  console.log("Loading Bungie manifest tables…");
  const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
  const paths = manifest.jsonWorldComponentContentPaths.en;
  const [items, plugSets, socketTypes, socketCategories, statDefs, statGroups] =
    await Promise.all([
      fetchJson(paths.DestinyInventoryItemDefinition),
      fetchJson(paths.DestinyPlugSetDefinition),
      fetchJson(paths.DestinySocketTypeDefinition),
      fetchJson(paths.DestinySocketCategoryDefinition),
      fetchJson(paths.DestinyStatDefinition),
      fetchJson(paths.DestinyStatGroupDefinition),
    ]);

  const manifestDeps = {
    items,
    plugSets,
    socketTypes,
    socketCategories,
    statGroups,
    statDefs,
    plugIndex,
  };

  let patchedVersions = 0;
  let patchedWeapons = 0;

  for (const entry of catalog.items) {
    if (entry.type !== "Weapon") continue;

    const columnsByHash = new Map();
    const statsByHash = new Map();

    for (const hash of collectHashesForEntry(entry)) {
      const item = items[hash];
      if (!item) continue;

      const perkColumns = resolveWeaponPerkColumnsFromManifest(item, manifestDeps);
      const stats = resolveWeaponStatsFromManifest(item, statDefs);
      if (perkColumns?.length) columnsByHash.set(hash, perkColumns);
      if (stats?.length) statsByHash.set(hash, stats);
    }

    if (entry.versions?.length) {
      for (const version of entry.versions) {
        const perkColumns = columnsByHash.get(version.itemHash);
        const stats = statsByHash.get(version.itemHash);
        if (perkColumns?.length) {
          version.perkColumns = perkColumns;
          patchedVersions += 1;
        }
        if (stats?.length) version.stats = stats;
      }
    }

    const primaryPerks = columnsByHash.get(entry.itemHash);
    const primaryStats = statsByHash.get(entry.itemHash);
    if (primaryPerks?.length) {
      entry.perkColumns = primaryPerks;
      patchedWeapons += 1;
    }
    if (primaryStats?.length) entry.stats = primaryStats;

    const perkColumnsByItemHash = {};
    const statsByItemHash = {};
    for (const [hash, columns] of columnsByHash.entries()) {
      if (hash === entry.itemHash) continue;
      if (columns?.length) perkColumnsByItemHash[hash] = columns;
    }
    for (const [hash, stats] of statsByHash.entries()) {
      if (hash === entry.itemHash) continue;
      if (stats?.length) statsByItemHash[hash] = stats;
    }
    if (Object.keys(perkColumnsByItemHash).length) {
      entry.perkColumnsByItemHash = perkColumnsByItemHash;
    }
    if (Object.keys(statsByItemHash).length) {
      entry.statsByItemHash = statsByItemHash;
    }
  }

  catalog.plugIndex = plugIndex;
  writeFileSync(catalogPath, JSON.stringify(catalog));

  console.log(
    `Patched ${patchedVersions} version perk pools and ${patchedWeapons} primary weapons.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
