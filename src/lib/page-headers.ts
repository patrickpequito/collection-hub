import { existsSync } from "node:fs";
import path from "node:path";

/** Section header images. Uses home banners until dedicated headers are added. */
export const PAGE_HEADERS = {
  radLoot: "/images/banners/rad-loot.webp",
  exotics: "/images/banners/exotics.webp",
  triumphs: "/images/banners/triumphs.webp",
  armorSets: "/images/banners/armor-sets.webp",
  armorSetsHeader: "/images/headers/armor-sets-header.webp",
  lootCollector: "/images/banners/loot-collector.webp",
  lootCollectorHeader: "/images/headers/loot-collector-header.webp",
  pvpActivities: "/images/banners/pvp-activities.webp",
  pveActivities: "/images/banners/pve-activities.webp",
} as const;

export function sectionHeaderUrl(imageFile: string): string {
  return `/images/headers/${imageFile}`;
}

export function activityHeaderUrl(imageFile: string): string {
  return `/images/rad-loot/headers/${imageFile}`;
}

/** Shared fallback when an expansion hub header file is not on disk yet. */
export const EXPANSION_HEADER_FALLBACK =
  "/images/banners/expansions-seasons.webp";

/**
 * Expansion hub page header: `public/images/headers/{slug}-header.webp`.
 * Falls back to the shared Expansions & Seasons banner when the file is missing.
 */
export function expansionHeaderUrl(slug: string): string {
  const file = `${slug}-header.webp`;
  const diskPath = path.join(process.cwd(), "public/images/headers", file);
  if (existsSync(diskPath)) {
    return sectionHeaderUrl(file);
  }
  return EXPANSION_HEADER_FALLBACK;
}

/** Season hub page header: `public/images/headers/{slug}-header.webp`. */
export function seasonHeaderUrl(slug: string): string {
  return expansionHeaderUrl(slug);
}
