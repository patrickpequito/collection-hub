/**
 * Builds data/featured-activities.json for RAD Loot weekly highlights.
 *
 * Raids: Bungie public milestones (weekly challenge on any difficulty).
 * Dungeons: Kyber's Corner weekly reset only (Bungie does not expose featured
 * dungeons). Schedule JSON is the offline fallback once a week is confirmed.
 *
 * Usage: node scripts/generate-featured-activities.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  featuredDungeonSlugsForWeek,
  featuredRaidsFromMilestones,
  featuredRaidFallbackForWeek,
  fetchFeaturedDungeonsFromKyber,
  getDungeonRotationWeeks,
  reloadSchedule,
  rotationWeekIndex,
  upsertDungeonWeek,
  weekBounds,
} from "./featured-rotation-shared.mjs";

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

async function resolveFeaturedRaids(weekIndex) {
  try {
    const milestones = await fetchJson("/Platform/Destiny2/Milestones/");
    const featured = featuredRaidsFromMilestones(milestones);
    if (featured.length > 0) return featured;
    console.warn(
      "Bungie milestones returned no featured raids; using schedule fallback",
    );
  } catch (error) {
    console.warn("Failed to fetch featured raids from Bungie:", error);
  }

  return featuredRaidFallbackForWeek(weekIndex);
}

function samePair(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return false;
  const left = [...a].sort().join(",");
  const right = [...b].sort().join(",");
  return left === right;
}

/**
 * Community sites often lag Tuesday reset by hours and keep advertising last
 * week's pair. Consecutive weeks never share the same featured dungeon pair.
 */
function isStalePriorWeekPair(weekIndex, pair) {
  if (weekIndex <= 0 || !pair?.length) return false;
  const prior = featuredDungeonSlugsForWeek(weekIndex - 1);
  return prior.length > 0 && samePair(pair, prior);
}

async function resolveFeaturedDungeons(weekIndex, weekStart) {
  const fromSchedule = featuredDungeonSlugsForWeek(weekIndex);
  let fromKyber = null;

  try {
    fromKyber = await fetchFeaturedDungeonsFromKyber(weekStart);
    console.log(`Kyber live dungeons: [${fromKyber.join(", ")}]`);
  } catch (error) {
    console.warn("Kyber dungeon scrape skipped:", error.message ?? error);
  }

  if (fromKyber?.length && isStalePriorWeekPair(weekIndex, fromKyber)) {
    console.warn(
      `Rejecting stale Kyber pair [${fromKyber.join(", ")}] — matches week ${weekIndex - 1}`,
    );
    fromKyber = null;
  }

  if (fromKyber?.length) {
    if (!samePair(fromKyber, fromSchedule)) {
      try {
        upsertDungeonWeek(weekIndex, fromKyber);
        reloadSchedule();
        console.log(
          `Updated schedule dungeon week ${weekIndex} from Kyber → [${fromKyber.join(", ")}]`,
        );
      } catch (error) {
        console.warn("Could not upsert dungeon schedule week:", error);
      }
    }
    return fromKyber;
  }

  if (fromSchedule.length > 0) {
    console.warn(
      `Using confirmed schedule fallback for week ${weekIndex}: [${fromSchedule.join(", ")}]`,
    );
    return fromSchedule;
  }

  throw new Error(
    `No featured dungeons for week ${weekIndex}: Kyber scrape failed/stale and schedule has no confirmed pair`,
  );
}

async function main() {
  reloadSchedule();
  const now = new Date();
  const weekIndex = rotationWeekIndex(now);
  const { weekStart, weekEnd } = weekBounds(weekIndex);
  const [featuredRaids, featuredDungeons] = await Promise.all([
    resolveFeaturedRaids(weekIndex),
    resolveFeaturedDungeons(weekIndex, weekStart),
  ]);

  if (featuredRaids.length === 0) {
    throw new Error("Could not resolve featured raids for this week");
  }

  if (featuredDungeons.length === 0) {
    throw new Error("Could not resolve featured dungeons for this week");
  }

  const payload = {
    generatedAt: now.toISOString(),
    weekIndex,
    weekStart,
    weekEnd,
    featuredRaids,
    featuredDungeons,
    rotationWeeks: getDungeonRotationWeeks().length,
  };

  const outDir = resolve(root, "data");
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
