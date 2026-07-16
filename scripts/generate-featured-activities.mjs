/**
 * Builds public/data/featured-activities.json for RAD Loot weekly highlights.
 *
 * Raids: Bungie public milestones (weekly challenge on any difficulty).
 * Dungeons: rotator schedule in public/data/featured-rotation-schedule.json.
 *
 * Usage: node scripts/generate-featured-activities.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DUNGEON_ROTATION_WEEKS,
  featuredDungeonSlugsForWeek,
  featuredRaidsFromMilestones,
  featuredRaidFallbackForWeek,
  rotationWeekIndex,
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

async function main() {
  const now = new Date();
  const weekIndex = rotationWeekIndex(now);
  const { weekStart, weekEnd } = weekBounds(weekIndex);
  const [featuredRaids, featuredDungeons] = await Promise.all([
    resolveFeaturedRaids(weekIndex),
    Promise.resolve(featuredDungeonSlugsForWeek(weekIndex)),
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
