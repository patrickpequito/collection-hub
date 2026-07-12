/**
 * Builds public/data/trials-featured-maps.json for the Trials of Osiris hub.
 *
 * Fetches featured Crucible maps from Bungie public milestones when Trials is
 * active. Intended to run every Friday after weekly reset (Trials start).
 *
 * Usage: node scripts/generate-trials-featured-maps.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** First Trials weekend after Monument of Triumph (Friday 17:00 UTC). */
const TRIALS_EPOCH_MS = Date.UTC(2026, 5, 12, 17, 0, 0);
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
/** Trials runs Friday 17:00 UTC through Tuesday 17:00 UTC. */
const MS_TRIALS_WINDOW = 4 * 24 * 60 * 60 * 1000;

const TRIALS_RETURNS_MILESTONE_HASH = "2311040624";

/** activityHash → map name (synced with src/data/activities/trials-maps.ts). */
const TRIALS_MAP_ACTIVITY_HASH_TO_NAME = {
  247771251: "Burnout",
  176316743: "Javelin-4",
  368995245: "Endless Vale",
  105227112: "Altar of Flame",
  1543755844: "Pacifica",
  1579576831: "Cirrus Plaza",
  132163276: "Eventide Labs",
  42744716: "The Dead Cliffs",
  96563552: "Meltdown",
  422437929: "Solitude",
  532383918: "Radiant Cliffs",
  148937731: "Wormhaven",
  423513998: "Bannerfall",
  595258113: "Cathedral of Dusk",
  188634482: "Disjunction",
  236451195: "Distant Shore",
  75561253: "Dissonance",
  778271008: "Emperor's Respite",
  1815340083: "Equinox",
  68962784: "Eternity",
  2276121440: "Firebase Echo",
  119049673: "Fragment",
  2591737171: "Gambler's Ruin",
  1711620427: "Legion's Gulch",
  64172690: "Midtown",
  922191739: "Retribution",
  184660376: "The Anomaly",
  828535312: "The Cauldron",
  903944065: "The Fortress",
  111657329: "Twilight Gap",
  281812211: "Vostok",
  427041827: "Widow's Court",
};

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

function trialsWeekendBounds(at = new Date()) {
  const nowMs = at.getTime();
  let weekIndex = Math.floor((nowMs - TRIALS_EPOCH_MS) / MS_PER_WEEK);
  let startMs = TRIALS_EPOCH_MS + weekIndex * MS_PER_WEEK;

  if (nowMs < startMs) {
    weekIndex -= 1;
    startMs = TRIALS_EPOCH_MS + weekIndex * MS_PER_WEEK;
  }

  return {
    weekIndex,
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(startMs + MS_TRIALS_WINDOW).toISOString(),
  };
}

function extractMapNamesFromMilestones(milestones) {
  const trialsMilestone = milestones[TRIALS_RETURNS_MILESTONE_HASH];
  const maps = [];
  const seen = new Set();

  const addActivity = (activityHash) => {
    const name = TRIALS_MAP_ACTIVITY_HASH_TO_NAME[activityHash];
    if (!name || seen.has(name)) return;
    seen.add(name);
    maps.push(name);
  };

  for (const activity of trialsMilestone?.activities ?? []) {
    addActivity(activity.activityHash);
  }

  if (maps.length === 0) {
    for (const milestone of Object.values(milestones)) {
      for (const activity of milestone.activities ?? []) {
        addActivity(activity.activityHash);
      }
    }
  }

  return maps.slice(0, 3);
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

async function main() {
  const now = new Date();
  const milestones = await fetchJson("/Platform/Destiny2/Milestones/");
  const mapNames = extractMapNamesFromMilestones(milestones);

  if (mapNames.length === 0) {
    console.log(
      "Trials featured maps not available in live milestones — keeping existing snapshot",
    );
    process.exit(0);
  }

  const trialsMilestone = milestones[TRIALS_RETURNS_MILESTONE_HASH];
  const computedBounds = trialsWeekendBounds(now);
  const weekStart = trialsMilestone?.startDate ?? computedBounds.weekStart;
  const weekEnd = trialsMilestone?.endDate ?? computedBounds.weekEnd;

  const payload = {
    generatedAt: now.toISOString(),
    weekIndex: computedBounds.weekIndex,
    weekStart,
    weekEnd,
    maps: mapNames,
  };

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "trials-featured-maps.json");
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(
    `Wrote Trials featured maps (week ${computedBounds.weekIndex + 1}): [${mapNames.join(", ")}]`,
  );
  console.log(`  ${weekStart} → ${weekEnd}`);
  console.log(`  ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
