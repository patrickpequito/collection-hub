/** Tuesday 17:00 UTC — weekly reset (19:00 Madrid summer). */
export const ROTATION_EPOCH_MS = Date.UTC(2026, 5, 9, 17, 0, 0);

export const RAID_MILESTONE_SLUGS: Record<string, string> = {
  "1888320892": "vault-of-glass",
  "540415767": "crotas-end",
  "292102995": "kings-fall",
  "3181387331": "last-wish",
  "2712317338": "garden-of-salvation",
  "541780856": "deep-stone-crypt",
  "2136320298": "vow-of-the-disciple",
  "3699252268": "root-of-nightmares",
};

export const DUNGEON_ROTATION_WEEKS: readonly (readonly string[])[] = [
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
    if (!slug) continue;

    const standard = live.activities?.[0];
    const challengeCount = standard?.challengeObjectiveHashes?.length ?? 0;
    if (challengeCount > 0) {
      featured.push(slug);
    }
  }

  return featured.sort();
}
