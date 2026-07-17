import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  TRIALS_BONUS_POOL_EPOCH_MS,
  getActiveTrialsBonusPoolId,
} from "@/data/activities/trials-of-osiris";
import {
  TRIALS_MAP_BY_ACTIVITY_HASH,
  TRIALS_MAP_BY_NAME,
  TRIALS_MAP_POOL_1,
  TRIALS_MAP_POOL_2,
  TRIALS_MAP_POOL_3,
  TRIALS_RETURNS_MILESTONE_HASH,
  type TrialsMapEntry,
} from "@/data/activities/trials-maps";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
/** Trials runs Friday 17:00 UTC through Tuesday 17:00 UTC. */
const MS_TRIALS_WINDOW = 4 * 24 * 60 * 60 * 1000;

export type TrialsFeaturedMapsResult = {
  maps: TrialsMapEntry[];
  weekStart: string;
  weekEnd: string;
  source: "bungie" | "snapshot" | "rotation";
};

type TrialsFeaturedMapsSnapshot = {
  weekStart: string;
  weekEnd: string;
  maps: string[];
};

type LiveMilestone = {
  startDate?: string;
  endDate?: string;
  activities?: { activityHash: number }[];
};

function trialsWeekIndex(nowMs = Date.now()): number {
  const elapsed = nowMs - TRIALS_BONUS_POOL_EPOCH_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / MS_PER_WEEK);
}

/** Friday 17:00 UTC → Tuesday 17:00 UTC for the active Trials weekend. */
function trialsWeekendBounds(nowMs = Date.now()): {
  weekStart: string;
  weekEnd: string;
  weekIndex: number;
} {
  let weekIndex = trialsWeekIndex(nowMs);
  let startMs = TRIALS_BONUS_POOL_EPOCH_MS + weekIndex * MS_PER_WEEK;

  if (nowMs < startMs) {
    weekIndex -= 1;
    startMs = TRIALS_BONUS_POOL_EPOCH_MS + weekIndex * MS_PER_WEEK;
  }

  return {
    weekIndex,
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(startMs + MS_TRIALS_WINDOW).toISOString(),
  };
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickMapName(pool: readonly string[], rng: () => number): string {
  const index = Math.floor(rng() * pool.length);
  return pool[index] ?? pool[0];
}

function resolveMapNames(names: string[]): TrialsMapEntry[] {
  return names.flatMap((name) => {
    const entry = TRIALS_MAP_BY_NAME.get(name);
    return entry ? [entry] : [];
  });
}

/** Deterministic weekly selection: one map from each Trials map pool. */
export function selectTrialsFeaturedMapNames(
  weekIndex = trialsWeekIndex(),
): string[] {
  const rng = mulberry32(weekIndex + 1_409_731);
  const picks = [
    pickMapName(TRIALS_MAP_POOL_1, rng),
    pickMapName(TRIALS_MAP_POOL_2, rng),
    pickMapName(TRIALS_MAP_POOL_3, rng),
  ];

  const unique: string[] = [];
  for (const name of picks) {
    if (!unique.includes(name)) unique.push(name);
  }

  while (unique.length < 3) {
    const fallbackPool = [
      ...TRIALS_MAP_POOL_1,
      ...TRIALS_MAP_POOL_2,
      ...TRIALS_MAP_POOL_3,
    ];
    const candidate = pickMapName(fallbackPool, rng);
    if (!unique.includes(candidate)) unique.push(candidate);
  }

  return unique.slice(0, 3);
}

async function loadLatestSnapshot(): Promise<TrialsFeaturedMapsSnapshot | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "data/trials-featured-maps.json",
    );
    const raw = await readFile(filePath, "utf8");
    const snapshot = JSON.parse(raw) as TrialsFeaturedMapsSnapshot;
    if (
      !snapshot.weekStart ||
      !snapshot.weekEnd ||
      !Array.isArray(snapshot.maps) ||
      snapshot.maps.length === 0
    ) {
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

async function fetchMapsFromBungieMilestones(): Promise<{
  maps: TrialsMapEntry[];
  weekStart?: string;
  weekEnd?: string;
} | null> {
  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://www.bungie.net/Platform/Destiny2/Milestones/", {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    ErrorCode: number;
    Response?: Record<string, LiveMilestone>;
  };

  if (data.ErrorCode !== 1 || !data.Response) return null;

  const trialsMilestone = data.Response[TRIALS_RETURNS_MILESTONE_HASH];
  const activities = trialsMilestone?.activities ?? [];
  const maps: TrialsMapEntry[] = [];
  const seen = new Set<string>();

  for (const activity of activities) {
    const entry = TRIALS_MAP_BY_ACTIVITY_HASH.get(String(activity.activityHash));
    if (!entry || seen.has(entry.name)) continue;
    seen.add(entry.name);
    maps.push(entry);
  }

  if (maps.length === 0) {
    for (const milestone of Object.values(data.Response)) {
      for (const activity of milestone.activities ?? []) {
        const entry = TRIALS_MAP_BY_ACTIVITY_HASH.get(
          String(activity.activityHash),
        );
        if (!entry || seen.has(entry.name)) continue;
        seen.add(entry.name);
        maps.push(entry);
      }
    }
  }

  if (maps.length === 0) return null;

  return {
    maps: maps.slice(0, 3),
    weekStart: trialsMilestone?.startDate,
    weekEnd: trialsMilestone?.endDate,
  };
}

export async function resolveTrialsFeaturedMaps(
  nowMs = Date.now(),
): Promise<TrialsFeaturedMapsResult> {
  const snapshot = await loadLatestSnapshot();
  if (snapshot) {
    return {
      maps: resolveMapNames(snapshot.maps),
      weekStart: snapshot.weekStart,
      weekEnd: snapshot.weekEnd,
      source: "snapshot",
    };
  }

  const fromBungie = await fetchMapsFromBungieMilestones();
  if (fromBungie && fromBungie.maps.length > 0) {
    const bounds = trialsWeekendBounds(nowMs);
    return {
      maps: fromBungie.maps,
      weekStart: fromBungie.weekStart ?? bounds.weekStart,
      weekEnd: fromBungie.weekEnd ?? bounds.weekEnd,
      source: "bungie",
    };
  }

  const { weekIndex, weekStart, weekEnd } = trialsWeekendBounds(nowMs);
  return {
    maps: resolveMapNames(selectTrialsFeaturedMapNames(weekIndex)),
    weekStart,
    weekEnd,
    source: "rotation",
  };
}

export function formatTrialsWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${dateFormatter.format(start)} – ${dateFormatter.format(end)} UTC`;
}

/** Exposed for tests and future UI hints about the active bonus weapon pool. */
export function currentTrialsBonusPoolId(nowMs = Date.now()) {
  return getActiveTrialsBonusPoolId(nowMs);
}
