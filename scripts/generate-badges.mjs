/**
 * Builds data/badges.json: every active Collections badge (the game's "Badges" node)
 * with its Hunter / Titan / Warlock item lists, straight from the Bungie manifest.
 *
 * Usage: node scripts/generate-badges.mjs
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

async function fetchJson(path) {
  const url = `https://www.bungie.net${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

const CLASS_KEYS = { Hunter: "hunter", Titan: "titan", Warlock: "warlock" };

async function main() {
  const settings = (await fetchJson("/Platform/Settings/")).Response.destiny2CoreSettings;
  const paths = (await fetchJson("/Platform/Destiny2/Manifest/")).Response.jsonWorldComponentContentPaths.en;
  const [nodes, collectibles, inventoryItems] = await Promise.all([
    fetchJson(paths.DestinyPresentationNodeDefinition),
    fetchJson(paths.DestinyCollectibleDefinition),
    fetchJson(paths.DestinyInventoryItemDefinition),
  ]);

  const items = {};
  const badges = [];

  for (const child of nodes[settings.badgesRootNode].children.presentationNodes) {
    const badge = nodes[child.presentationNodeHash];
    if (!badge || badge.redacted) continue;
    const classes = { hunter: [], titan: [], warlock: [] };

    for (const classChild of badge.children.presentationNodes) {
      const classNode = nodes[classChild.presentationNodeHash];
      const key = CLASS_KEYS[classNode?.displayProperties?.name];
      if (!key) continue;

      for (const entry of classNode.children.collectibles) {
        const collectible = collectibles[entry.collectibleHash];
        const item = collectible && inventoryItems[collectible.itemHash];
        if (!item) continue;
        const itemHash = String(collectible.itemHash);
        classes[key].push(itemHash);
        items[itemHash] ??= {
          itemHash,
          collectibleHash: String(entry.collectibleHash),
          name: item.displayProperties.name,
          iconPath: item.displayProperties.icon ?? "",
          seasonIconPath: item.iconWatermark || undefined,
          itemTypeDisplayName: item.itemTypeDisplayName ?? "",
          rarity: item.inventory?.tierTypeName ?? "",
          source: collectible.sourceString ?? "",
          // 3 = any class; weapons and most cosmetics are shared.
          isWeapon: item.itemType === 3,
          isArmor: item.itemType === 2,
        };
      }
    }

    badges.push({
      hash: String(badge.hash),
      name: badge.displayProperties.name,
      iconPath: badge.displayProperties.icon ?? "",
      completionRecordHash: badge.completionRecordHash ? String(badge.completionRecordHash) : "",
      classes,
    });
  }

  const out = resolve(root, "data/badges.json");
  writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), badges, items }, null, 1)}\n`);
  console.log(`Wrote ${badges.length} badges, ${Object.keys(items).length} items → data/badges.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
