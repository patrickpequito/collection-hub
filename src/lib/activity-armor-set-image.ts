const ARMOR_SETS_DIR = "/images/rad-loot/armor-sets";

/** Default filename for the full armor-set preview (all three classes in one image). */
export function activityArmorSetImageFile(activitySlug: string): string {
  return `${activitySlug}.webp`;
}

export function activityArmorSetPreviewUrl(imageFile: string): string {
  return `${ARMOR_SETS_DIR}/${imageFile}`;
}

/** Resolves preview filenames for an activity page. */
export function resolveArmorSetPreviewFiles(
  activitySlug: string,
  customFiles?: string[],
): string[] {
  if (customFiles?.length) return customFiles;
  return [activityArmorSetImageFile(activitySlug)];
}
