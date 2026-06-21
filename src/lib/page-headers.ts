/** Section header images. Uses home banners until dedicated headers are added. */
export const PAGE_HEADERS = {
  radLoot: "/images/banners/rad-loot.webp",
  exotics: "/images/banners/exotics.webp",
  triumphs: "/images/banners/triumphs.webp",
  armorSets: "/images/banners/armor-sets.webp",
  armorSetsHeader: "/images/headers/armor-sets-header.webp",
  lootCollector: "/images/banners/loot-collector.webp",
  lootCollectorHeader: "/images/headers/loot-collector-header.webp",
} as const;

export function sectionHeaderUrl(imageFile: string): string {
  return `/images/headers/${imageFile}`;
}

export function activityHeaderUrl(imageFile: string): string {
  return `/images/rad-loot/headers/${imageFile}`;
}
