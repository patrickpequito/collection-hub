import type { ActivityEntry } from "@/types/activity-loot";

export const VANGUARD_OPS: ActivityEntry = {
  slug: "vanguard-ops",
  title: "Vanguard Ops",
  available: true,
  imageFile: "vanguard-ops.webp",
  wideImageFile: "vanguard-ops-wide.webp",
};

export const GAMBIT: ActivityEntry = {
  slug: "gambit",
  title: "Gambit",
  available: true,
  imageFile: "gambit.webp",
};

export const RAD_LOOT: ActivityEntry = {
  slug: "rad-loot",
  title: "RAD Loot",
  available: true,
  imageFile: "rad-loot.webp",
};

export const PVE_ACTIVITIES = [VANGUARD_OPS, GAMBIT, RAD_LOOT] as const;

const PVE_ACTIVITY_HREFS: Partial<Record<string, string>> = {
  "rad-loot": `/rad-loot?from=${encodeURIComponent("/pve-activities")}`,
};

export function getPveActivityHref(entry: ActivityEntry): string | null {
  if (!entry.available || entry.placeholder) return null;
  return PVE_ACTIVITY_HREFS[entry.slug] ?? `/activities/${entry.slug}`;
}

export const PVE_ACTIVITY_IMAGE_BASE_PATH = "/images/pve-activities/activities";
