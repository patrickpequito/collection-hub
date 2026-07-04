/**
 * Fetches Destiny 2 manifest data and writes public/data/armor-sets.json.
 * Requires BUNGIE_API_KEY in .env.local (or environment).
 *
 * Usage: node scripts/generate-armor-sets.mjs
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
    // .env.local optional if env vars already set
  }
}

loadEnv();

const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error("Missing BUNGIE_API_KEY in .env.local");
  process.exit(1);
}

const CLASS = { 0: "titan", 1: "hunter", 2: "warlock" };
const BUCKET_TO_SLOT = {
  3448274439: "helmet",
  3551918588: "gauntlets",
  14239492: "chest",
  20886954: "legs",
  1585787867: "classItem",
  158374255: "classItem",
  2422292813: "classItem",
};

const SLOT_SUFFIXES = [
  " Mask",
  " Helm",
  " Helmet",
  " Hood",
  " Cowl",
  " Hat",
  " Gauntlets",
  " Gloves",
  " Grips",
  " Plate",
  " Robe",
  " Vest",
  " Cuirass",
  " Chest Armor",
  " Chestplate",
  " Greaves",
  " Strides",
  " Leg Armor",
  " Boots",
  " Legguards",
  " Bond",
  " Mark",
  " Cloak",
  " Class Item",
];

const SLOTS = ["helmet", "gauntlets", "chest", "legs", "classItem"];
const CLASSES = ["hunter", "titan", "warlock"];

/** Crucible sets whose armor slots share one display name. */
const UNIFORM_CRUCIBLE_CLASS_ITEMS = {
  "Ankaa Seeker IV": { warlock: "Binary Phoenix Bond" },
  "Swordflight 4.1": { hunter: "Binary Phoenix Cloak" },
  "Phoenix Strife Type 0": { titan: "Binary Phoenix Mark" },
};

function isLegendaryArmor(item) {
  return item.inventory?.tierTypeName === "Legendary";
}

function baseName(name) {
  for (const suffix of SLOT_SUFFIXES) {
    if (name.endsWith(suffix)) return name.slice(0, -suffix.length).trim();
  }
  return name;
}

function categorizeSource(source = "") {
  const s = source.toLowerCase();
  if (s.includes("raid")) return "raids";
  if (s.includes("dungeon")) return "dungeons";
  if (s.includes("season")) return "seasons";
  if (
    s.includes("vanguard") ||
    s.includes("patrol") ||
    s.includes("exploration") ||
    s.includes("public event") ||
    s.includes("terminal") ||
    s.includes("onslaught") ||
    s.includes("strike")
  ) {
    return "destinations";
  }
  return "expansions";
}

/** e.g. 'Source: "Vault of Glass" Raid' -> 'Vault of Glass' */
function normalizeSource(source = "") {
  const quoted = source.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  return source.replace(/^Source:\s*/i, "").trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

  const [items, collectibles] = await Promise.all([
    fetchJson(manifest.DestinyInventoryItemDefinition),
    fetchJson(manifest.DestinyCollectibleDefinition),
  ]);

  return { items, collectibles };
}

function buildArmorSets(items, collectibles) {
  const pieces = [];

  for (const item of Object.values(items)) {
    if (item.itemType !== 2) continue;
    if (!isLegendaryArmor(item)) continue;
    const coll = collectibles[String(item.collectibleHash)];
    if (!coll?.sourceString) continue;

    const slot = BUCKET_TO_SLOT[item.inventory?.bucketTypeHash];
    const cls = CLASS[item.classType];
    if (!slot || !cls) continue;

    pieces.push({
      source: coll.sourceString,
      sourceLabel: normalizeSource(coll.sourceString),
      category: categorizeSource(coll.sourceString),
      cls,
      slot,
      name: item.displayProperties?.name,
      base: baseName(item.displayProperties?.name),
      iconPath: item.displayProperties?.icon ?? "",
      hash: String(item.hash),
    });
  }

  const sets = new Map();

  for (const piece of pieces) {
    if (piece.slot === "classItem") continue;
    const key = `${piece.category}::${piece.sourceLabel}::${piece.base}`;
    if (!sets.has(key)) {
      sets.set(key, {
        id: slugify(`${piece.category}-${piece.base}`),
        name: piece.base,
        category: piece.category,
        source: piece.source,
        sourceLabel: piece.sourceLabel,
        classes: {},
      });
    }
    const set = sets.get(key);
    if (!set.classes[piece.cls]) set.classes[piece.cls] = {};
    set.classes[piece.cls][piece.slot] = {
      itemHash: piece.hash,
      name: piece.name,
      iconPath: piece.iconPath,
    };
  }

  const classItems = pieces.filter((p) => p.slot === "classItem");
  const usedClassItems = new Set();

  const uniformClassItemNames = new Set(
    Object.values(UNIFORM_CRUCIBLE_CLASS_ITEMS).flatMap((byClass) =>
      Object.values(byClass),
    ),
  );

  function assignClassItem(set, cls, match) {
    set.classes[cls].classItem = {
      itemHash: match.hash,
      name: match.name,
      iconPath: match.iconPath,
    };
    usedClassItems.add(match.hash);
  }

  function tryAssignClassItem(set, cls, classItemName = null) {
    if (!set.classes[cls]) return false;
    const hasClassItem = Boolean(set.classes[cls].classItem);
    const coreSlots = SLOTS.filter((s) => s !== "classItem");
    const coreFilled = coreSlots.every((s) => set.classes[cls][s]);
    if (!coreFilled || hasClassItem) return false;

    const match = classItemName
      ? classItems.find(
          (item) =>
            item.name === classItemName &&
            item.cls === cls &&
            !usedClassItems.has(item.hash),
        )
      : classItems.find(
          (item) =>
            item.sourceLabel === set.sourceLabel &&
            item.cls === cls &&
            !usedClassItems.has(item.hash) &&
            !uniformClassItemNames.has(item.name),
        );

    if (!match) return false;
    assignClassItem(set, cls, match);
    return true;
  }

  // Reserve Binary Phoenix class items for uniform Crucible sets first.
  for (const set of sets.values()) {
    const uniformByClass = UNIFORM_CRUCIBLE_CLASS_ITEMS[set.name];
    if (!uniformByClass) continue;
    for (const cls of CLASSES) {
      const classItemName = uniformByClass[cls];
      if (classItemName) tryAssignClassItem(set, cls, classItemName);
    }
  }

  for (const set of sets.values()) {
    for (const cls of CLASSES) {
      tryAssignClassItem(set, cls);
    }
  }

  const complete = [];
  for (const set of sets.values()) {
    let isComplete = true;
    for (const cls of CLASSES) {
      for (const slot of SLOTS) {
        if (!set.classes[cls]?.[slot]) isComplete = false;
      }
    }
    if (isComplete) complete.push(set);
  }

  // Include sets with at least one full class row (all 5 slots).
  const seen = new Set(complete.map((s) => s.id));
  for (const set of sets.values()) {
    if (seen.has(set.id)) continue;
    const hasFullClass = CLASSES.some((cls) =>
      SLOTS.every((slot) => set.classes[cls]?.[slot]),
    );
    if (hasFullClass) {
      complete.push(set);
      seen.add(set.id);
    }
  }

  complete.sort((a, b) => a.name.localeCompare(b.name));
  return complete;
}

async function main() {
  console.log("Loading Bungie manifest…");
  const { items, collectibles } = await loadManifestTables();
  const sets = buildArmorSets(items, collectibles);

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "armor-sets.json");
  writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), sets }, null, 2));

  const byCategory = {};
  for (const set of sets) {
    byCategory[set.category] = (byCategory[set.category] || 0) + 1;
  }

  console.log(`Wrote ${sets.length} armor sets to public/data/armor-sets.json`);
  console.log(byCategory);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
