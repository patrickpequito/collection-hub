/**
 * Builds data/profile-activities.json for the Guardian profile: which activity hashes are
 * patrol zones (and which destination), which are the Tower, and the lore books (record lists).
 * Also writes data/weekly-activities.json: Nightfall and Pantheon activity names, matched on the
 * home page against a public profile's launchable activities to show this week's rotation.
 *
 * Usage: node scripts/generate-profile-activities.mjs
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

/** Manifest destination name → site destination slug (src/data/destinations.ts). */
const DESTINATION_SLUGS = [
  [/^kepler/i, "kepler"],
  [/pale heart/i, "the-pale-heart"],
  [/neomuna/i, "neomuna"],
  [/throne world|savathûn/i, "throne-world"],
  [/europa/i, "europa"],
  [/^the moon|^moon/i, "the-moon"],
  [/dreaming city/i, "dreaming-city"],
  [/nessus|arcadian valley/i, "nessus"],
  [/european dead zone|^edz|^earth$/i, "european-dead-zone"],
  [/cosmodrome/i, "cosmodrome"],
  [/mars|hellas basin|tharsis/i, "mars"],
  [/mercury/i, "mercury"],
  [/tangled shore/i, "tangled-shore"],
  [/^titan|new pacific arcology/i, "titan"],
  [/^io\b|echo mesa/i, "io"],
];

const PATROL_MODE = 6;
const SOCIAL_MODE = 40;

async function main() {
  const settings = (await fetchJson("/Platform/Settings/")).Response.destiny2CoreSettings;
  const paths = (await fetchJson("/Platform/Destiny2/Manifest/")).Response.jsonWorldComponentContentPaths.en;
  const [activities, destinations, nodes] = await Promise.all([
    fetchJson(paths.DestinyActivityDefinition),
    fetchJson(paths.DestinyDestinationDefinition),
    fetchJson(paths.DestinyPresentationNodeDefinition),
  ]);

  // Lore books: the leaf nodes under the lore root, each a list of lore records.
  const loreBooks = [];
  const walkLore = (hash) => {
    const node = nodes[hash];
    if (!node) return;
    if (node.children.records.length) loreBooks.push(node.children.records.map((entry) => String(entry.recordHash)));
    for (const child of node.children.presentationNodes) walkLore(child.presentationNodeHash);
  };
  walkLore(settings.loreRootNodeHash);

  const patrol = {};
  const tower = [];
  const unmapped = new Set();

  for (const activity of Object.values(activities)) {
    const modes = [activity.directActivityModeType, ...(activity.activityModeTypes ?? [])];
    const name = activity.displayProperties?.name ?? "";
    const destination = destinations[activity.destinationHash]?.displayProperties?.name ?? "";
    // Social mode also tags story missions; only the Tower itself counts here.
    if (modes.includes(SOCIAL_MODE)) {
      if (/^tower$/i.test(name) || /^tower$/i.test(destination)) tower.push(String(activity.hash));
      continue;
    }
    if (!modes.includes(PATROL_MODE)) continue;
    const slug = DESTINATION_SLUGS.find(([pattern]) => pattern.test(destination))?.[1];
    if (!slug) {
      if (destination) unmapped.add(destination);
      continue;
    }
    patrol[activity.hash] = slug;
  }

  // Nightfall strikes (mode 46) and the Pantheon's weekly featured bosses, by activity hash.
  // "Featured Reprise: Calus: The Pantheon" → one Reprise and one Encore boss each week. The
  // "Pantheon: <boss> <tier>" gauntlets are always open, so they are not listed.
  const weekly = {};
  for (const activity of Object.values(activities)) {
    const name = activity.displayProperties?.name ?? "";
    const modes = [activity.directActivityModeType, ...(activity.activityModeTypes ?? [])];
    const featured = name.match(/^Featured (Reprise|Encore): ([^:]+):/);
    if (featured) {
      weekly[activity.hash] = { kind: "pantheon", pool: featured[1], name: featured[2].trim() };
    } else if (modes.includes(46) && /^Nightfall|Grandmaster/i.test(name)) {
      weekly[activity.hash] = {
        kind: /grandmaster/i.test(name) ? "grandmaster" : "nightfall",
        name: activity.displayProperties?.description || name,
        difficulty: name.replace(/^Nightfall: /, ""),
      };
    }
  }
  writeFileSync(resolve(root, "data/weekly-activities.json"), `${JSON.stringify(weekly)}\n`);
  console.log(`Wrote ${Object.keys(weekly).length} Nightfall / Pantheon activities → data/weekly-activities.json`);

  const out = resolve(root, "data/profile-activities.json");
  writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), patrol, tower, loreBooks })}\n`);
  console.log(
    `Wrote ${Object.keys(patrol).length} patrol, ${tower.length} Tower activities and ${loreBooks.length} lore books → data/profile-activities.json`,
  );
  if (unmapped.size) console.log("Unmapped patrol destinations:", [...unmapped].join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
