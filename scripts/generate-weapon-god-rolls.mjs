/**
 * Builds data/weapon-god-rolls.json from DIM's default voltron wishlist.
 *
 * PvE: first roll line under a god-pve block, else first line under any pve block.
 * PvP: first roll line under a god-pvp block, else first line under any pvp block.
 *
 * Usage: node scripts/generate-weapon-god-rolls.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const VOLTRON_URL =
  "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

function parseTags(notesLine) {
  const match = notesLine.match(/\|tags:([^|]*)/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseVoltron(text) {
  /** @type {Map<string, { godPve: string[] | null, godPvp: string[] | null, pveFirst: string[] | null, pvpFirst: string[] | null }>} */
  const items = new Map();
  let currentTags = [];

  for (const line of text.split("\n")) {
    if (line.startsWith("//notes:")) {
      currentTags = parseTags(line);
      continue;
    }

    const match = line.match(/^dimwishlist:item=(\d+)&perks=([\d,]+)/);
    if (!match) continue;

    const itemHash = match[1];
    const perks = match[2].split(",").filter(Boolean);
    if (!perks.length) continue;

    if (!items.has(itemHash)) {
      items.set(itemHash, {
        godPve: null,
        godPvp: null,
        pveFirst: null,
        pvpFirst: null,
      });
    }

    const record = items.get(itemHash);
    const hasGodPve = currentTags.includes("god-pve");
    const hasGodPvp = currentTags.includes("god-pvp");
    const hasPve = currentTags.includes("pve");
    const hasPvp = currentTags.includes("pvp");

    if (hasGodPve && !record.godPve) record.godPve = perks;
    if (hasGodPvp && !record.godPvp) record.godPvp = perks;
    if (hasPve && !record.pveFirst) record.pveFirst = perks;
    if (hasPvp && !record.pvpFirst) record.pvpFirst = perks;
  }

  /** @type {Record<string, { pve?: string[], pvp?: string[] }>} */
  const rolls = {};

  for (const [itemHash, record] of items) {
    const pve = record.godPve ?? record.pveFirst;
    const pvp = record.godPvp ?? record.pvpFirst;
    if (!pve && !pvp) continue;

    rolls[itemHash] = {};
    if (pve) rolls[itemHash].pve = pve;
    if (pvp) rolls[itemHash].pvp = pvp;
  }

  return rolls;
}

async function main() {
  console.log("Fetching voltron wishlist...");
  const response = await fetch(VOLTRON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch voltron.txt: ${response.status}`);
  }

  const text = await response.text();
  const rolls = parseVoltron(text);
  const itemCount = Object.keys(rolls).length;
  const withPve = Object.values(rolls).filter((entry) => entry.pve).length;
  const withPvp = Object.values(rolls).filter((entry) => entry.pvp).length;

  const output = {
    generatedAt: new Date().toISOString(),
    source: VOLTRON_URL,
    itemCount,
    withPve,
    withPvp,
    rolls,
  };

  const outDir = resolve(root, "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "weapon-god-rolls.json");
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Wrote ${itemCount} weapon god rolls (${withPve} PvE, ${withPvp} PvP) to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
