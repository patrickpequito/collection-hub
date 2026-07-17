/**
 * Builds data/catalysts.json — exotic weapon catalysts grouped by slot.
 *
 * Usage: node scripts/generate-catalysts.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/**
 * Placeholder textures that exist on the CDN but render pink/wrong in the UI.
 * Also used when the only socket art is a generic masterwork catalyst template.
 */
const BROKEN_ICON_FRAGMENTS = [
  "78f8cdd72e124dc1faaf7801085e4d5b",
  "564c4604b7e78e78bf126359b91990e5",
  "8b20acd1a243c966117e2e40a683b066",
];

/** Shared inventory icon used by many working catalysts in-game. */
const GENERIC_CATALYST_ICON =
  "/common/destiny2_content/icons/62890cb9e33bbed6a3587a1064dc860e.png";

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

  const [items, plugSets, collectibles, records] = await Promise.all([
    fetchJson(manifest.DestinyInventoryItemDefinition),
    fetchJson(manifest.DestinyPlugSetDefinition),
    fetchJson(manifest.DestinyCollectibleDefinition),
    fetchJson(manifest.DestinyRecordDefinition),
  ]);

  return { items, plugSets, collectibles, records };
}

function collectSocketPlugHashes(socket, plugSets) {
  const plugHashes = new Set();
  for (const plug of socket.reusablePlugItems ?? []) {
    plugHashes.add(plug.plugItemHash);
  }
  for (const setHash of [
    socket.randomizedPlugSetHash,
    socket.reusablePlugSetHash,
  ]) {
    if (!setHash) continue;
    const set = plugSets[String(setHash)];
    for (const plug of set?.reusablePlugItems ?? []) {
      plugHashes.add(plug.plugItemHash);
    }
  }
  return plugHashes;
}

function getAllCatalystDefs(items, catalystName) {
  return Object.values(items).filter(
    (item) => item.displayProperties?.name === catalystName,
  );
}

function isMasterworkCatalystPlug(item) {
  const id = item?.plug?.plugCategoryIdentifier ?? "";
  return id.includes("masterwork");
}

function isBrokenCatalystIcon(iconPath, item) {
  if (!iconPath) return true;
  if (BROKEN_ICON_FRAGMENTS.some((fragment) => iconPath.includes(fragment))) {
    return true;
  }
  if (item && isMasterworkCatalystPlug(item) && !iconPath.endsWith(".jpg")) {
    return true;
  }
  return false;
}

/** Pick real catalyst art when available; never reuse the parent weapon icon. */
function pickCatalystIcon(socketPlug, defs, weaponItem) {
  const weaponIcon = weaponItem?.displayProperties?.icon ?? "";
  const candidates = [];

  for (const def of defs.filter((d) => d.itemType === 20)) {
    candidates.push({ icon: def.displayProperties?.icon, item: def });
  }
  for (const def of defs.filter(
    (d) => d.plug?.plugCategoryIdentifier === "catalysts",
  )) {
    candidates.push({ icon: def.displayProperties?.icon, item: def });
  }
  for (const def of defs) {
    if (def.displayProperties?.icon?.endsWith(".jpg")) {
      candidates.push({ icon: def.displayProperties.icon, item: def });
    }
  }
  candidates.push({
    icon: socketPlug?.displayProperties?.icon,
    item: socketPlug,
  });

  for (const { icon, item } of candidates) {
    if (!icon) continue;
    if (isBrokenCatalystIcon(icon, item)) continue;
    if (weaponIcon && icon === weaponIcon) continue;
    return icon;
  }

  return GENERIC_CATALYST_ICON;
}

function pickCanonicalHash(defs) {
  return String(
    defs.reduce(
      (min, d) => (d.hash < min ? d.hash : min),
      defs[0]?.hash ?? 0,
    ),
  );
}

function findRecordHash(records, catalystName) {
  const record = Object.values(records).find(
    (entry) => entry.displayProperties?.name === catalystName,
  );
  return record ? String(record.hash) : undefined;
}

function buildCatalystCatalog(items, plugSets, collectibles, records) {
  const byName = new Map();

  for (const item of Object.values(items)) {
    if (item.inventory?.tierTypeName !== "Exotic" || item.itemType !== 3) {
      continue;
    }

    const weaponSlot = WEAPON_BUCKET_TO_SLOT[item.inventory?.bucketTypeHash];
    if (!weaponSlot) continue;

    const weaponName = item.displayProperties?.name ?? "Unknown";
    const weaponSource =
      collectibles[String(item.collectibleHash)]?.sourceString ?? "";

    for (const socket of item.sockets?.socketEntries ?? []) {
      for (const plugHash of collectSocketPlugHashes(socket, plugSets)) {
        const plug = items[String(plugHash)];
        const catalystName = plug?.displayProperties?.name ?? "";
        if (!catalystName.endsWith(" Catalyst")) continue;

        const defs = getAllCatalystDefs(items, catalystName);
        const alternateItemHashes = [
          ...new Set(defs.map((d) => String(d.hash))),
        ].sort((a, b) => Number(a) - Number(b));

        const coll = collectibles[String(plug.collectibleHash)];
        const source =
          coll?.sourceString ??
          (weaponSource
            ? `Catalyst for ${weaponName}. ${weaponSource}`
            : `Catalyst for ${weaponName}.`);

        const recordHash = findRecordHash(records, catalystName);

        const entry = {
          itemHash: pickCanonicalHash(defs),
          name: catalystName,
          iconPath: pickCatalystIcon(plug, defs, item),
          source,
          weaponSlot,
          weaponName,
          weaponHash: String(item.hash),
          ...(recordHash ? { recordHash } : {}),
          alternateItemHashes,
        };

        const existing = byName.get(catalystName);
        if (
          !existing ||
          Number(entry.itemHash) < Number(existing.itemHash)
        ) {
          byName.set(catalystName, entry);
        }
      }
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  console.log("Loading Bungie manifest…");
  const { items, plugSets, collectibles, records } = await loadManifestTables();
  const itemsList = buildCatalystCatalog(items, plugSets, collectibles, records);

  const outDir = resolve(root, "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "catalysts.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), items: itemsList },
      null,
      2,
    ),
  );

  const bySlot = {};
  let withRecord = 0;
  for (const item of itemsList) {
    bySlot[item.weaponSlot] = (bySlot[item.weaponSlot] ?? 0) + 1;
    if (item.recordHash) withRecord++;
  }

  console.log(`Wrote ${itemsList.length} catalysts to data/catalysts.json`);
  console.log(bySlot);
  console.log(`With triumph record: ${withRecord}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
