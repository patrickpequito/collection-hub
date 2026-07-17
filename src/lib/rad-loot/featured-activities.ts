import { readFileSync } from "node:fs";
import path from "node:path";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import type { ActivityEntry } from "@/types/activity-loot";
import {
  DUNGEON_ROTATION_WEEKS,
  featuredDungeonSlugsForWeek,
  featuredRaidFallbackForWeek,
  rotationWeekIndex,
  weekBounds,
} from "@/lib/rad-loot/featured-rotation";

export type FeaturedActivitiesData = {
  generatedAt: string;
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  featuredRaids: string[];
  featuredDungeons: string[];
  rotationWeeks: number;
};

/** Weekly featured raid/dungeon badge (custom asset). */
export const FEATURED_TIER_ICON_PATH = "/images/rad-loot/featured.png";

/** Border highlight for featured activity banners. */
export const FEATURED_BORDER_COLOR = "#24b4b3";

function readFeaturedActivitiesJson(): FeaturedActivitiesData | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "data/featured-activities.json",
    );
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as FeaturedActivitiesData;
  } catch {
    return null;
  }
}

/**
 * Featured raids/dungeons from the checked-in weekly snapshot + schedule.
 * Never calls Bungie at request time (avoids CPU/origin cost on every visit).
 */
export async function loadFeaturedActivities(): Promise<FeaturedActivitiesData> {
  const now = new Date();
  const weekIndex = rotationWeekIndex(now);
  const { weekStart, weekEnd } = weekBounds(weekIndex);
  const snapshot = readFeaturedActivitiesJson();

  const featuredRaids =
    snapshot?.weekIndex === weekIndex && snapshot.featuredRaids.length > 0
      ? snapshot.featuredRaids
      : featuredRaidFallbackForWeek(weekIndex);

  const featuredDungeons =
    snapshot?.weekIndex === weekIndex && snapshot.featuredDungeons.length > 0
      ? snapshot.featuredDungeons
      : featuredDungeonSlugsForWeek(weekIndex);

  return {
    generatedAt: snapshot?.generatedAt ?? now.toISOString(),
    weekIndex,
    weekStart,
    weekEnd,
    featuredRaids,
    featuredDungeons,
    rotationWeeks: DUNGEON_ROTATION_WEEKS.length,
  };
}

export async function featuredActivitySlugs(): Promise<Set<string>> {
  const data = await loadFeaturedActivities();
  return new Set([...data.featuredRaids, ...data.featuredDungeons]);
}

const ALL_ACTIVITIES: ActivityEntry[] = [
  PANTHEON,
  ...RAIDS,
  ...DUNGEONS,
  ...LEGACY_RAIDS,
  ...RAID_LAIRS,
];

function entriesForSlugs(slugs: string[]): ActivityEntry[] {
  return slugs
    .map((slug) => ALL_ACTIVITIES.find((entry) => entry.slug === slug))
    .filter((entry): entry is ActivityEntry => Boolean(entry));
}

/** Featured raids + dungeons as banner entries, in rotation order. */
export async function featuredActivityEntries(): Promise<{
  raids: ActivityEntry[];
  dungeons: ActivityEntry[];
}> {
  const data = await loadFeaturedActivities();
  return {
    raids: entriesForSlugs(data.featuredRaids),
    dungeons: entriesForSlugs(data.featuredDungeons),
  };
}
