/**
 * Builds data/trials-featured-maps.json for the Trials of Osiris hub.
 *
 * Prefers Bungie public milestones when Trials activities are published.
 * Falls back to a deterministic one-from-each-pool pick when Trials is
 * eligible but Bungie omits map activities (common after Mot).
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
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
/** Trials runs Friday 17:00 UTC through Tuesday 17:00 UTC. */
const MS_TRIALS_WINDOW = 4 * MS_PER_DAY;
/** First IB blackout week after Mot (Tue 17:00 UTC), every four weeks. */
const IB_ANCHOR_MS = Date.parse("2026-08-25T17:00:00Z");
const MS_FOUR_WEEKS = 28 * MS_PER_DAY;

const TRIALS_RETURNS_MILESTONE_HASH = "2311040624";

/** Keep in sync with src/data/activities/trials-maps.ts */
const TRIALS_MAP_POOL_1 = ["Burnout", "Javelin-4", "Endless Vale"];
const TRIALS_MAP_POOL_2 = [
  ...TRIALS_MAP_POOL_1,
  "Altar of Flame",
  "Pacifica",
  "Cirrus Plaza",
  "Eventide Labs",
  "The Dead Cliffs",
  "Meltdown",
  "Solitude",
  "Radiant Cliffs",
  "Wormhaven",
];
const TRIALS_MAP_POOL_3 = [
  "Bannerfall",
  "Cathedral of Dusk",
  "Disjunction",
  "Distant Shore",
  "Dissonance",
  "Emperor's Respite",
  "Equinox",
  "Eternity",
  "Firebase Echo",
  "Fragment",
  "Gambler's Ruin",
  "Legion's Gulch",
  "Midtown",
  "Retribution",
  "The Anomaly",
  "The Cauldron",
  "The Fortress",
  "Twilight Gap",
  "Vostok",
  "Widow's Court",
];

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
    weekStartMs: startMs,
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(startMs + MS_TRIALS_WINDOW).toISOString(),
  };
}

function ironBannerWindowFor(ms) {
  let n = Math.floor((ms - IB_ANCHOR_MS) / MS_FOUR_WEEKS);
  let startMs = IB_ANCHOR_MS + n * MS_FOUR_WEEKS;
  if (startMs > ms) startMs -= MS_FOUR_WEEKS;
  return { startMs, endMs: startMs + MS_PER_WEEK };
}

function isIronBannerBlackoutFriday(fridayMs) {
  const { startMs, endMs } = ironBannerWindowFor(fridayMs);
  return fridayMs >= startMs && fridayMs < endMs;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickMapName(pool, rng) {
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

function selectRotationMapNames(weekIndex) {
  const rng = mulberry32(weekIndex + 1_409_731);
  const picks = [
    pickMapName(TRIALS_MAP_POOL_1, rng),
    pickMapName(TRIALS_MAP_POOL_2, rng),
    pickMapName(TRIALS_MAP_POOL_3, rng),
  ];
  const unique = [];
  for (const name of picks) {
    if (!unique.includes(name)) unique.push(name);
  }
  const fallback = [
    ...TRIALS_MAP_POOL_1,
    ...TRIALS_MAP_POOL_2,
    ...TRIALS_MAP_POOL_3,
  ];
  while (unique.length < 3) {
    const candidate = pickMapName(fallback, rng);
    if (!unique.includes(candidate)) unique.push(candidate);
  }
  return unique.slice(0, 3);
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
  const nowMs = now.getTime();
  const computedBounds = trialsWeekendBounds(now);
  const inTrialsWindow =
    nowMs >= computedBounds.weekStartMs &&
    nowMs <= computedBounds.weekStartMs + MS_TRIALS_WINDOW;
  const ibBlackout = isIronBannerBlackoutFriday(computedBounds.weekStartMs);

  const milestones = await fetchJson("/Platform/Destiny2/Milestones/");
  let mapNames = extractMapNamesFromMilestones(milestones);
  let source = "bungie";

  if (mapNames.length === 0 && ibBlackout) {
    source = "iron-banner";
  } else if (mapNames.length === 0 && inTrialsWindow && !ibBlackout) {
    mapNames = selectRotationMapNames(computedBounds.weekIndex);
    source = "rotation";
  } else if (mapNames.length === 0) {
    source = "unavailable";
  }

  const trialsMilestone = milestones[TRIALS_RETURNS_MILESTONE_HASH];
  const weekStart = trialsMilestone?.startDate ?? computedBounds.weekStart;
  const weekEnd = trialsMilestone?.endDate ?? computedBounds.weekEnd;

  const payload = {
    generatedAt: now.toISOString(),
    weekIndex: computedBounds.weekIndex,
    weekStart,
    weekEnd,
    maps: mapNames,
    source,
  };

  const outDir = resolve(root, "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "trials-featured-maps.json");
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  if (mapNames.length === 0) {
    console.log(
      `Wrote empty Trials featured maps for week ${computedBounds.weekIndex + 1} (${source}).`,
    );
  } else {
    console.log(
      `Wrote Trials featured maps (week ${computedBounds.weekIndex + 1}, ${source}): [${mapNames.join(", ")}]`,
    );
  }
  console.log(`  ${weekStart} → ${weekEnd}`);
  console.log(`  ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
