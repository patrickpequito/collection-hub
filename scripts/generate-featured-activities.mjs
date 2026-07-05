/**
 * Builds public/data/featured-activities.json for RAD Loot weekly highlights.
 *
 * Raids: Bungie public milestones (challenge objectives on standard mode).
 * Dungeons: deterministic rotator schedule from Monument of Triumph launch.
 *
 * Usage: node scripts/generate-featured-activities.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** Tuesday 17:00 UTC — weekly reset (19:00 Madrid summer). */
const ROTATION_EPOCH_MS = Date.UTC(2026, 5, 9, 17, 0, 0);

const RAID_MILESTONE_SLUGS = {
  1888320892: "vault-of-glass",
  540415767: "crotas-end",
  292102995: "kings-fall",
  3181387331: "last-wish",
  2712317338: "garden-of-salvation",
  541780856: "deep-stone-crypt",
  2136320298: "vow-of-the-disciple",
  3699252268: "root-of-nightmares",
};

const DUNGEON_ROTATION_WEEKS = [
  ["duality", "the-shattered-throne"],
  ["spire-of-the-watcher", "pit-of-heresy"],
  ["ghosts-of-the-deep", "prophecy"],
  ["warlords-ruin", "grasp-of-avarice"],
  ["the-shattered-throne", "duality"],
  ["pit-of-heresy", "spire-of-the-watcher"],
  ["prophecy", "ghosts-of-the-deep"],
  ["grasp-of-avarice", "warlords-ruin"],
  ["duality", "vespers-host"],
  ["spire-of-the-watcher", "the-shattered-throne"],
  ["ghosts-of-the-deep", "pit-of-heresy"],
  ["warlords-ruin", "prophecy"],
  ["vespers-host", "grasp-of-avarice"],
  ["the-shattered-throne", "duality"],
  ["pit-of-heresy", "spire-of-the-watcher"],
  ["prophecy", "ghosts-of-the-deep"],
  ["grasp-of-avarice", "warlords-ruin"],
  ["duality", "vespers-host"],
  ["spire-of-the-watcher", "the-shattered-throne"],
  ["ghosts-of-the-deep", "pit-of-heresy"],
  ["warlords-ruin", "prophecy"],
  ["the-shattered-throne", "grasp-of-avarice"],
  ["pit-of-heresy", "duality"],
  ["prophecy", "ghosts-of-the-deep"],
  ["grasp-of-avarice", "warlords-ruin"],
  ["duality", "vespers-host"],
  ["spire-of-the-watcher", "the-shattered-throne"],
  ["ghosts-of-the-deep", "pit-of-heresy"],
  ["warlords-ruin", "prophecy"],
  ["the-shattered-throne", "grasp-of-avarice"],
];

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

function rotationWeekIndex(at = new Date()) {
  const elapsed = at.getTime() - ROTATION_EPOCH_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
}

function featuredDungeonSlugsForWeek(weekIndex) {
  const pair =
    DUNGEON_ROTATION_WEEKS[weekIndex % DUNGEON_ROTATION_WEEKS.length] ??
    DUNGEON_ROTATION_WEEKS[0];
  return [...pair];
}

function weekBounds(weekIndex) {
  const startMs = ROTATION_EPOCH_MS + weekIndex * 7 * 24 * 60 * 60 * 1000;
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(endMs).toISOString(),
  };
}

loadEnv();

const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error("Missing BUNGIE_API_KEY (set in .env.local or environment)");
  process.exit(1);
}

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `https://www.bungie.net${path}`;
  const res = await fetch(url, {
    headers: path.startsWith("http") ? {} : { "X-API-Key": API_KEY },
  });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const data = await res.json();
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || `Bungie error ${data.ErrorCode}`);
  }
  return data.Response ?? data;
}

async function resolveFeaturedRaids() {
  const milestones = await fetchJson("/Platform/Destiny2/Milestones/");
  const featured = [];

  for (const [milestoneHash, live] of Object.entries(milestones)) {
    const slug = RAID_MILESTONE_SLUGS[milestoneHash];
    if (!slug) continue;

    const standard = live.activities?.[0];
    const challengeCount = standard?.challengeObjectiveHashes?.length ?? 0;
    if (challengeCount > 0) {
      featured.push(slug);
    }
  }

  return featured.sort();
}

async function main() {
  const now = new Date();
  const weekIndex = rotationWeekIndex(now);
  const { weekStart, weekEnd } = weekBounds(weekIndex);
  const [featuredRaids, featuredDungeons] = await Promise.all([
    resolveFeaturedRaids(),
    Promise.resolve(featuredDungeonSlugsForWeek(weekIndex)),
  ]);

  const payload = {
    generatedAt: now.toISOString(),
    weekIndex,
    weekStart,
    weekEnd,
    featuredRaids,
    featuredDungeons,
    rotationWeeks: DUNGEON_ROTATION_WEEKS.length,
  };

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "featured-activities.json");
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(
    `Wrote featured activities (week ${weekIndex + 1}): raids=[${featuredRaids.join(", ")}] dungeons=[${featuredDungeons.join(", ")}]`,
  );
  console.log(`  ${weekStart} → ${weekEnd}`);
  console.log(`  ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
