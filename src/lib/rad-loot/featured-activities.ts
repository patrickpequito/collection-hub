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
  fetchFeaturedRaidsFromBungie,
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

let raidCache: {
  weekIndex: number;
  featuredRaids: string[];
} | null = null;

function readFeaturedActivitiesJson(): FeaturedActivitiesData | null {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/data/featured-activities.json",
    );
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as FeaturedActivitiesData;
  } catch {
    return null;
  }
}

async function resolveFeaturedRaids(weekIndex: number): Promise<string[]> {
  if (raidCache?.weekIndex === weekIndex) {
    return raidCache.featuredRaids;
  }

  const apiKey = process.env.BUNGIE_API_KEY?.trim();
  if (apiKey) {
    try {
      const featuredRaids = await fetchFeaturedRaidsFromBungie(apiKey);
      if (featuredRaids.length > 0) {
        raidCache = { weekIndex, featuredRaids };
        return featuredRaids;
      }
      console.warn(
        "Bungie milestones returned no featured raids; using schedule fallback",
      );
    } catch (error) {
      console.error("Failed to fetch featured raids from Bungie:", error);
    }
  }

  const fallback = readFeaturedActivitiesJson();
  if (
    fallback?.weekIndex === weekIndex &&
    fallback.featuredRaids.length > 0
  ) {
    return fallback.featuredRaids;
  }

  return featuredRaidFallbackForWeek(weekIndex);
}

/** Current featured raids/dungeons, computed at request time from reset schedule + Bungie. */
export async function loadFeaturedActivities(): Promise<FeaturedActivitiesData> {
  const now = new Date();
  const weekIndex = rotationWeekIndex(now);
  const { weekStart, weekEnd } = weekBounds(weekIndex);
  const [featuredRaids, featuredDungeons] = await Promise.all([
    resolveFeaturedRaids(weekIndex),
    Promise.resolve(featuredDungeonSlugsForWeek(weekIndex)),
  ]);

  return {
    generatedAt: now.toISOString(),
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
