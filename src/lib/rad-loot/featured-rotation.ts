import { readFileSync } from "node:fs";
import path from "node:path";
import type { FeaturedRotationSchedule } from "@/types/featured-rotation";

export const RAID_MILESTONE_SLUGS: Record<string, string> = {
  "1888320892": "vault-of-glass",
  "540415767": "crotas-end",
  "292102995": "kings-fall",
  "3181387331": "last-wish",
  "2712317338": "garden-of-salvation",
  "541780856": "deep-stone-crypt",
  "2136320298": "vow-of-the-disciple",
  "3699252268": "root-of-nightmares",
  "4196566271": "salvations-edge",
};

/** Newest raids with weekly challenges but outside the rotator highlight pool. */
export const EXCLUDED_FEATURED_RAID_SLUGS = new Set([
  "the-desert-perpetual",
  "the-pantheon",
]);

let cachedSchedule: FeaturedRotationSchedule | null = null;

function loadFeaturedRotationSchedule(): FeaturedRotationSchedule {
  if (cachedSchedule) return cachedSchedule;

  const filePath = path.join(
    process.cwd(),
    "data/featured-rotation-schedule.json",
  );
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
    epochUtc: string;
    dungeonWeeks: string[][];
    raidFallbackWeeks?: string[][];
  };

  cachedSchedule = {
    epochMs: Date.parse(raw.epochUtc),
    dungeonWeeks: raw.dungeonWeeks,
    raidFallbackWeeks: raw.raidFallbackWeeks ?? [],
  };
  return cachedSchedule;
}

const rotationSchedule = loadFeaturedRotationSchedule();

/** Tuesday 17:00 UTC — weekly reset (19:00 Madrid summer). */
export const ROTATION_EPOCH_MS = rotationSchedule.epochMs;

export const DUNGEON_ROTATION_WEEKS: readonly (readonly string[])[] =
  rotationSchedule.dungeonWeeks;

export const RAID_ROTATION_FALLBACK_WEEKS: readonly (readonly string[])[] =
  rotationSchedule.raidFallbackWeeks;

export function rotationWeekIndex(at = new Date()): number {
  const elapsed = at.getTime() - ROTATION_EPOCH_MS;
  if (elapsed < 0) return 0;
  return Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
}

export function featuredDungeonSlugsForWeek(weekIndex: number): string[] {
  const pair =
    DUNGEON_ROTATION_WEEKS[weekIndex % DUNGEON_ROTATION_WEEKS.length] ??
    DUNGEON_ROTATION_WEEKS[0];
  return [...pair];
}

export function featuredRaidFallbackForWeek(weekIndex: number): string[] {
  if (!RAID_ROTATION_FALLBACK_WEEKS.length) return [];
  const pair =
    RAID_ROTATION_FALLBACK_WEEKS[
      weekIndex % RAID_ROTATION_FALLBACK_WEEKS.length
    ] ?? RAID_ROTATION_FALLBACK_WEEKS[0];
  return [...pair].sort();
}

export function weekBounds(weekIndex: number): {
  weekStart: string;
  weekEnd: string;
} {
  const startMs = ROTATION_EPOCH_MS + weekIndex * 7 * 24 * 60 * 60 * 1000;
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
  return {
    weekStart: new Date(startMs).toISOString(),
    weekEnd: new Date(endMs).toISOString(),
  };
}

type MilestoneActivity = {
  challengeObjectiveHashes?: number[];
};

type LiveMilestone = {
  activities?: MilestoneActivity[];
};

function milestoneHasWeeklyChallenge(live: LiveMilestone): boolean {
  return (live.activities ?? []).some(
    (activity) => (activity.challengeObjectiveHashes?.length ?? 0) > 0,
  );
}

export async function fetchFeaturedRaidsFromBungie(
  apiKey: string,
): Promise<string[]> {
  const response = await fetch(
    "https://www.bungie.net/Platform/Destiny2/Milestones/",
    {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(`Bungie milestones request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    ErrorCode: number;
    Message?: string;
    Response?: Record<string, LiveMilestone>;
  };

  if (data.ErrorCode !== 1) {
    throw new Error(data.Message ?? `Bungie error ${data.ErrorCode}`);
  }

  const milestones = data.Response ?? {};
  const featured: string[] = [];

  for (const [milestoneHash, live] of Object.entries(milestones)) {
    const slug = RAID_MILESTONE_SLUGS[milestoneHash];
    if (!slug || EXCLUDED_FEATURED_RAID_SLUGS.has(slug)) continue;

    if (milestoneHasWeeklyChallenge(live)) {
      featured.push(slug);
    }
  }

  return featured.sort();
}
