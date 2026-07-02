/**
 * Builds public/data/armor-set-bonuses.json from DestinyEquipableItemSetDefinition.
 *
 * Usage: node scripts/generate-armor-set-bonuses.mjs
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
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const headers = path.startsWith("http") ? {} : { "X-API-Key": API_KEY };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.Response ?? data;
}

async function main() {
  const manifest = await fetchJson("/Platform/Destiny2/Manifest/");
  const paths = manifest.jsonWorldComponentContentPaths.en;
  const [equipSets, sandbox, items] = await Promise.all([
    fetchJson(paths.DestinyEquipableItemSetDefinition),
    fetchJson(paths.DestinySandboxPerkDefinition),
    fetchJson(paths.DestinyInventoryItemDefinition),
  ]);

  const sets = {};

  for (const set of Object.values(equipSets)) {
    const setHash = String(set.hash);
    const setName = set.displayProperties?.name?.trim();
    if (!setName || !set.setPerks?.length) continue;

    const bonuses = set.setPerks
      .map((entry) => {
        const perk = sandbox[String(entry.sandboxPerkHash)];
        if (!perk?.displayProperties?.name) return null;
        return {
          requiredCount: entry.requiredSetCount,
          name: perk.displayProperties.name,
          description: perk.displayProperties.description?.trim() || "",
          iconPath: perk.displayProperties.icon || "",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.requiredCount - b.requiredCount);

    if (!bonuses.length) continue;

    sets[setHash] = { setName, bonuses };
  }

  const itemHashToSetHash = {};
  for (const item of Object.values(items)) {
    if (item.itemType !== 2) continue;
    const setHash = item.equippingBlock?.equipableItemSetHash;
    if (!setHash) continue;
    itemHashToSetHash[String(item.hash)] = String(setHash);
  }

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const output = {
    generatedAt: new Date().toISOString(),
    setCount: Object.keys(sets).length,
    itemHashToSetHash,
    sets,
  };
  writeFileSync(
    resolve(outDir, "armor-set-bonuses.json"),
    `${JSON.stringify(output, null, 2)}\n`,
  );
  console.log(
    `Wrote ${output.setCount} armor set bonus definitions (${Object.keys(itemHashToSetHash).length} piece hashes).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
