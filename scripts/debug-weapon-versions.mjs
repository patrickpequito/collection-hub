/**
 * Debug version/season resolution for a weapon name.
 * Usage: node scripts/debug-weapon-versions.mjs "Vision of Confluence"
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSeasonIndexAnchors,
  buildSeasonPassItemSeasonMap,
  inferSeasonLabelFromIndex,
  isDebutRelevantVariant,
  resolveItemSeasonLabel,
  resolveSeasonLabelFromSource,
  resolveVersionSeasonLabel,
} from "./all-loot-mappings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const weaponName = process.argv[2] ?? "Vision of Confluence";

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
  const headers = path.startsWith("http") ? {} : { "X-API-Key": API_KEY };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

const DIM_SEASONS_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/data/d2/seasons.json";
const DIM_WATERMARK_TO_SEASON_URL =
  "https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/data/d2/watermark-to-season.json";

const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
const paths = manifest.jsonWorldComponentContentPaths.en;
const [items, collectibles, seasons, seasonPasses, progressions, dimSeasons, watermarkToSeason] =
  await Promise.all([
    fetchJson(paths.DestinyInventoryItemDefinition),
    fetchJson(paths.DestinyCollectibleDefinition),
    fetchJson(paths.DestinySeasonDefinition),
    fetchJson(paths.DestinySeasonPassDefinition),
    fetchJson(paths.DestinyProgressionDefinition),
    fetchJson(DIM_SEASONS_URL),
    fetchJson(DIM_WATERMARK_TO_SEASON_URL),
  ]);

const dimSeasonData = { dimSeasons, watermarkToSeason };
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

const group = Object.values(items).filter(
  (item) => item.displayProperties?.name === weaponName,
);

console.log(`\n=== ${weaponName} (${group.length} manifest entries) ===\n`);

for (const item of group.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))) {
  const col = item.collectibleHash
    ? collectibles[String(item.collectibleHash)]
    : null;
  const source = col?.sourceString ?? "";
  const versionLabel = resolveVersionSeasonLabel(
    item,
    col,
    seasons,
    seasonPassItemSeason,
    seasonIndexAnchors,
    dimSeasonData,
    { peerItems: group },
  );

  console.log({
    hash: item.hash,
    index: item.index,
    itemType: item.itemType,
    collectible: Boolean(item.collectibleHash),
    debutRelevant: isDebutRelevantVariant(item, group),
    watermark: item.iconWatermark?.split("/").pop(),
    source: source.slice(0, 90),
    fromSource: resolveSeasonLabelFromSource(source, seasons),
    versionLabel,
    fromInfer: inferSeasonLabelFromIndex(item.index ?? 0, seasonIndexAnchors),
    fromResolve: col
      ? resolveItemSeasonLabel(item, col, seasons, seasonPassItemSeason)
      : null,
  });
}
