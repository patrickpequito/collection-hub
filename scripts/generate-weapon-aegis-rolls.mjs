/**
 * Builds public/data/weapon-aegis-rolls.json from MrCharles Aegis DIM wishlist.
 * Stores deduplicated desirable roll lines per itemHash for per-copy scoring.
 *
 * Usage: node scripts/generate-weapon-aegis-rolls.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const AEGIS_WISHLIST_URL =
  "https://raw.githubusercontent.com/charlesxcaliber/DIMAegisWeaponWishlist/main/MrCharlesWishlist_MRF_PPC0.txt";

function parseTierFromNotesLine(line) {
  const notes = line.replace(/^\/\/notes:/, "").trim();
  const match = notes.match(/^([SABCDEF])-Tier\b/i);
  return match ? match[1].toUpperCase() : null;
}

function parseAegisWishlist(text) {
  /** @type {Map<string, { archetypeTier: string | null, lineKeys: Set<string>, lines: string[][] }>} */
  const weapons = new Map();
  let currentTier = null;

  for (const line of text.split("\n")) {
    if (line.startsWith("//notes:")) {
      currentTier = parseTierFromNotesLine(line);
      continue;
    }

    if (line.length === 0) {
      currentTier = null;
      continue;
    }

    const match = line.match(/^dimwishlist:item=(\d+)&perks=([\d,]+)/);
    if (!match) continue;

    const itemHash = match[1];
    const perks = match[2].split(",").filter(Boolean);
    if (!perks.length) continue;

    if (!weapons.has(itemHash)) {
      weapons.set(itemHash, {
        archetypeTier: currentTier,
        lineKeys: new Set(),
        lines: [],
      });
    }

    const entry = weapons.get(itemHash);
    if (!entry.archetypeTier && currentTier) {
      entry.archetypeTier = currentTier;
    }

    const key = [...perks].sort().join(",");
    if (entry.lineKeys.has(key)) continue;

    entry.lineKeys.add(key);
    entry.lines.push(perks);
  }

  /** @type {Record<string, { archetypeTier?: string, lines: string[][] }>} */
  const output = {};

  for (const [itemHash, entry] of weapons) {
    output[itemHash] = {
      lines: entry.lines,
      ...(entry.archetypeTier ? { archetypeTier: entry.archetypeTier } : {}),
    };
  }

  return output;
}

async function main() {
  console.log("Fetching Aegis wishlist...");
  const response = await fetch(AEGIS_WISHLIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Aegis wishlist: ${response.status}`);
  }

  const text = await response.text();
  const weapons = parseAegisWishlist(text);
  const itemCount = Object.keys(weapons).length;
  const lineCount = Object.values(weapons).reduce(
    (sum, entry) => sum + entry.lines.length,
    0,
  );

  const output = {
    generatedAt: new Date().toISOString(),
    source: AEGIS_WISHLIST_URL,
    itemCount,
    lineCount,
    weapons,
  };

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "weapon-aegis-rolls.json");
  writeFileSync(outPath, `${JSON.stringify(output)}\n`);

  console.log(
    `Wrote ${itemCount} weapons (${lineCount} Aegis lines) to ${outPath}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
