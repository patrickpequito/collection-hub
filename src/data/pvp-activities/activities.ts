import type { ActivityEntry } from "@/types/activity-loot";

export const CRUCIBLE: ActivityEntry = {
  slug: "crucible",
  title: "Crucible",
  available: true,
  imageFile: "crucible.webp",
  wideImageFile: "crucible-wide.webp",
};

export const IRON_BANNER: ActivityEntry = {
  slug: "iron-banner",
  title: "Iron Banner",
  available: true,
  imageFile: "iron-banner.webp",
};

export const TRIALS_OF_OSIRIS: ActivityEntry = {
  slug: "trials-of-osiris",
  title: "Trials of Osiris",
  available: true,
  imageFile: "trials-of-osiris.webp",
};

export const PVP_ACTIVITIES = [CRUCIBLE, IRON_BANNER, TRIALS_OF_OSIRIS] as const;

export function getPvpActivityHref(entry: ActivityEntry): string | null {
  if (!entry.available || entry.placeholder) return null;
  return `/activities/${entry.slug}`;
}

export const PVP_ACTIVITY_IMAGE_BASE_PATH = "/images/pvp-activities/activities";
