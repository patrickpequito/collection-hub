/**
 * Rebuilds weapon masterwork columns in data/all-loot.json using per-weapon
 * stat group filtering (same approach as DIM's isValidMasterworkStat).
 *
 * Usage: node scripts/patch-weapon-masterworks.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
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

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const headers = path.startsWith("http") ? {} : { "X-API-Key": API_KEY };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

function isMasterworkStatPlug(plug) {
  return plug?.plug?.plugCategoryIdentifier?.includes("masterworks.stat");
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

function collectMasterworkPlugs(item, items, plugSets) {
  for (const socket of item.sockets?.socketEntries ?? []) {
    const setHash = socket.reusablePlugSetHash;
    if (!setHash) continue;
    const plugs = (plugSets[String(setHash)]?.reusablePlugItems ?? [])
      .map((entry) => items[String(entry.plugItemHash)])
      .filter(isMasterworkStatPlug);
    if (plugs.length) return plugs;
  }
  return [];
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

async function main() {
  const catalogPath = resolve(root, "data/all-loot.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const plugIndex = catalog.plugIndex ?? {};

  console.log("Loading Bungie manifest tables…");
  const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
  const paths = manifest.jsonWorldComponentContentPaths.en;
  const [items, plugSets, statDefs, statGroups] = await Promise.all([
    fetchJson(paths.DestinyInventoryItemDefinition),
    fetchJson(paths.DestinyPlugSetDefinition),
    fetchJson(paths.DestinyStatDefinition),
    fetchJson(paths.DestinyStatGroupDefinition),
  ]);

  let patchedWeapons = 0;
  for (const entry of catalog.items) {
    if (entry.type !== "Weapon" || !entry.perkColumns?.length) continue;
    const item = items[entry.itemHash];
    if (!item) continue;

    const masterworkPlugs = collectMasterworkPlugs(item, items, plugSets);
    const masterworks = resolveMasterworkPlugsForWeapon(
      item,
      masterworkPlugs,
      statGroups,
      statDefs,
    );

    const perkColumns = entry.perkColumns.filter((column) => column.type !== "masterwork");
    if (masterworks.length) {
      const plugHashes = masterworks.map(({ plug, statName, tier }) => {
        const hash = String(plug.hash);
        plugIndex[hash] = masterworkPlugCatalogEntry({ plug, statName, tier });
        return hash;
      });
      perkColumns.unshift({ type: "masterwork", plugHashes });
    }
    entry.perkColumns = perkColumns;
    patchedWeapons += 1;
  }

  catalog.plugIndex = plugIndex;
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  console.log(`Patched masterwork columns for ${patchedWeapons} weapons.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
