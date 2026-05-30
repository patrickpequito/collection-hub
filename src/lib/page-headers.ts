/** Section header images. Uses home banners until dedicated headers are added. */
export const PAGE_HEADERS = {
  radLoot: "/images/banners/rad-loot.webp",
  exotics: "/images/banners/exotics.webp",
  armorSets: "/images/banners/armor-sets.webp",
} as const;

export function activityHeaderUrl(imageFile: string): string {
  return `/images/rad-loot/headers/${imageFile}`;
}
