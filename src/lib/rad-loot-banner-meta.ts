import { ACTIVITY_BANNER_META } from "@/data/rad-loot/activity-banner-meta";
import { getTitleEntry, resolveTriumphIcon } from "@/lib/triumphs/load";
import type { TriumphCatalog } from "@/types/triumph";

export type ActivityBannerMeta = {
  iconPath: string;
  completionRecordHash: string | null;
};

export function getStaticActivityBannerMeta(
  slug: string,
): ActivityBannerMeta | null {
  return ACTIVITY_BANNER_META[slug] ?? null;
}

export function getActivityBannerMeta(
  catalog: TriumphCatalog | null,
  slug: string,
): ActivityBannerMeta | null {
  const staticMeta = getStaticActivityBannerMeta(slug);
  if (staticMeta) return staticMeta;

  if (!catalog) return null;

  const title = getTitleEntry(catalog, slug);
  if (title) {
    const iconPath = resolveTriumphIcon(title.iconPath, title.records);
    if (!iconPath) return null;
    return {
      iconPath,
      completionRecordHash: title.completionRecordHash,
    };
  }

  return null;
}
