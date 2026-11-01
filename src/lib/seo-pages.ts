import { DESTINATIONS } from "@/data/destinations";
import { PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { DUNGEONS, LEGACY_RAIDS, RAIDS, RAID_LAIRS } from "@/data/rad-loot/activities";
import { RAD_LOOT_ACTIVITY_PAGES } from "@/data/rad-loot/activity-pages";
import { PUBLISHED_SEASON_SLUGS } from "@/data/seasons";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

/** Public pages for search engines (sitemap + robots), all built from the published lists. */

export const STATIC_PATHS = [
  "/",
  "/activities",
  "/activities/destinations",
  "/activities/crucible",
  "/activities/gambit",
  "/activities/iron-banner",
  "/activities/trials-of-osiris",
  "/activities/vanguard-ops",
  "/activities/monument-of-triumph",
  "/activities/sparrow-racing-league",
  "/expansions",
  "/collections",
  "/exotics",
  "/sets",
  "/sets/bonuses",
  "/shaders",
  "/triumphs",
];

export function activityPaths(): string[] {
  const linked = new Set([...RAIDS, ...DUNGEONS, ...LEGACY_RAIDS, ...RAID_LAIRS].filter((entry) => entry.available).map((entry) => entry.slug));
  return Object.keys(RAD_LOOT_ACTIVITY_PAGES)
    .filter((slug) => linked.has(slug))
    .map((slug) => `/activities/${slug}`);
}

export const destinationPaths = () =>
  DESTINATIONS.filter((destination) => destination.built).map((destination) => `/activities/destinations/${destination.slug}`);
export const expansionPaths = () => [...PUBLISHED_EXPANSION_SLUGS].map((slug) => `/expansions/${slug}`);
export const seasonPaths = () => [...PUBLISHED_SEASON_SLUGS].map((slug) => `/seasons/${slug}`);

export async function triumphPaths(): Promise<string[]> {
  const catalog = await loadTriumphCatalog();
  return [
    ...catalog.groups.map((group) => `/triumphs/group/${group.slug}`),
    ...catalog.titles.map((title) => `/triumphs/title/${title.slug}`),
  ];
}

/** Exotic weapon and armor pages: the only item pages open to search engines. */
export async function exoticItemPaths(): Promise<string[]> {
  const catalog = await loadAllLootCatalog();
  return catalog.items
    .filter((item) => item.rarity === "Exotic" && item.slug && (item.type === "Weapon" || item.type === "Armor"))
    .map((item) => `/${item.type === "Weapon" ? "weapons" : "armor"}/${item.slug}`);
}
