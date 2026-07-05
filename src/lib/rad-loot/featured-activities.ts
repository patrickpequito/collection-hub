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

let cache: FeaturedActivitiesData | null = null;

export function loadFeaturedActivities(): FeaturedActivitiesData {
  if (cache) return cache;

  const filePath = path.join(
    process.cwd(),
    "public/data/featured-activities.json",
  );
  const raw = readFileSync(filePath, "utf8");
  cache = JSON.parse(raw) as FeaturedActivitiesData;
  return cache;
}

export function featuredActivitySlugs(): Set<string> {
  const data = loadFeaturedActivities();
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
export function featuredActivityEntries(): {
  raids: ActivityEntry[];
  dungeons: ActivityEntry[];
} {
  const data = loadFeaturedActivities();
  return {
    raids: entriesForSlugs(data.featuredRaids),
    dungeons: entriesForSlugs(data.featuredDungeons),
  };
}
