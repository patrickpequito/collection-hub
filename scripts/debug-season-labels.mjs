import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveItemSeasonLabel,
  resolveSeasonLabelFromSource,
  inferSeasonLabelFromIndex,
  buildSeasonIndexAnchors,
  buildSeasonPassItemSeasonMap,
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

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
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

const { items, collectibles, seasons, seasonPasses, progressions } =
  await loadManifestTables();
const seasonPassItemSeason = buildSeasonPassItemSeasonMap(
  seasons,
  seasonPasses,
  progressions,
);
const anchors = buildSeasonIndexAnchors(
  items,
  collectibles,
  seasons,
  seasonPassItemSeason,
);

let generic = 0;
let total = 0;
const genericSources = new Map();

for (const item of Object.values(items)) {
  if (!item.collectibleHash) continue;
  const col = collectibles[String(item.collectibleHash)];
  const src = col?.sourceString ?? "";
  if (!src) continue;
  total++;
  if (!resolveSeasonLabelFromSource(src, seasons)) {
    generic++;
    genericSources.set(src, (genericSources.get(src) ?? 0) + 1);
  }
}

console.log({ total, generic, pct: `${((generic / total) * 100).toFixed(1)}%` });
console.log("Top unmapped sources:");
for (const [src, count] of [...genericSources.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)) {
  console.log(count, src.slice(0, 100));
}

const archiveCols = Object.values(collectibles).filter((c) =>
  /exotic archive/i.test(c.sourceString ?? ""),
);
console.log("\nExotic Archive collectibles:", archiveCols.length);
const archiveItems = archiveCols
  .map((c) => {
    const item = Object.values(items).find((i) => i.collectibleHash === c.hash);
    return item
      ? { name: item.displayProperties?.name, index: item.index, hash: item.hash }
      : null;
  })
  .filter(Boolean)
  .sort((a, b) => a.index - b.index);
console.log("First 5:", archiveItems.slice(0, 5));
console.log("Sample around Jötunn index:", archiveItems.filter((i) => i.index >= 29460 && i.index <= 29480));
const eververse = Object.values(items).filter((item) => {
  if (!item.collectibleHash) return false;
  const col = collectibles[String(item.collectibleHash)];
  return col?.sourceString === "Source: Eververse";
});
const evSample = eververse.slice(0, 5).map((item) => {
  const col = collectibles[String(item.collectibleHash)];
  return {
    name: item.displayProperties?.name,
    hash: item.hash,
    index: item.index,
    itemSeasonHash: item.seasonHash,
    colSeasonHash: col?.seasonHash,
    fromResolve: resolveItemSeasonLabel(item, col, seasons, seasonPassItemSeason),
  };
});
console.log("\nEververse samples:", evSample);

const passReward = Object.values(items).find((item) => {
  if (!item.collectibleHash) return false;
  const col = collectibles[String(item.collectibleHash)];
  return col?.sourceString === "Source: Season Pass Reward";
});
if (passReward) {
  const col = collectibles[String(passReward.collectibleHash)];
  console.log("\nSeason Pass Reward sample:", {
    name: passReward.displayProperties?.name,
    hash: passReward.hash,
    fromPass: seasonPassItemSeason.get(String(passReward.hash)),
    fromResolve: resolveItemSeasonLabel(
      passReward,
      col,
      seasons,
      seasonPassItemSeason,
    ),
  });
}

let withColSeason = 0;
let withItemSeason = 0;
let withEither = 0;
for (const item of Object.values(items)) {
  if (!item.collectibleHash) continue;
  const col = collectibles[String(item.collectibleHash)];
  if (!col) continue;
  const hasCol = Boolean(col.seasonHash);
  const hasItem = Boolean(item.seasonHash);
  if (hasCol) withColSeason++;
  if (hasItem) withItemSeason++;
  if (hasCol || hasItem) withEither++;
}
console.log("ARCHIVE_JSON", JSON.stringify(archiveItems));

for (const target of ["Jötunn", "Dream Breaker", "Witherhoard", "Izanagi's Burden"]) {
  console.log(`\n=== ${target} ===`);
  const group = Object.values(items).filter(
    (entry) => entry.displayProperties?.name === target,
  );
  for (const item of group.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))) {
    const col = item.collectibleHash
      ? collectibles[String(item.collectibleHash)]
      : null;
    const src = col?.sourceString ?? "";
    console.log({
      hash: item.hash,
      index: item.index,
      seasonHash: item.seasonHash,
      collectible: Boolean(item.collectibleHash),
      source: src.slice(0, 90),
      fromSource: resolveSeasonLabelFromSource(src, seasons),
      fromResolve: col
        ? resolveItemSeasonLabel(item, col, seasons, seasonPassItemSeason)
        : null,
      fromInfer: inferSeasonLabelFromIndex(item.index ?? 0, anchors),
    });
  }
}
