import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import { getTitleEntry, resolveTriumphIcon } from "@/lib/triumphs/load";
import type { TriumphCatalog } from "@/types/triumph";

export type ActivityBannerMeta = {
  iconPath: string;
  completionRecordHash: string | null;
};

export function getActivityBannerMeta(
  catalog: TriumphCatalog,
  slug: string,
): ActivityBannerMeta | null {
  const title = getTitleEntry(catalog, slug);
  if (title) {
    const iconPath = resolveTriumphIcon(title.iconPath, title.records);
    if (!iconPath) return null;
    return {
      iconPath,
      completionRecordHash: title.completionRecordHash,
    };
  }

  const page = getActivityLootPage(slug);
  if (page?.triumphPanel?.iconPath) {
    return {
      iconPath: page.triumphPanel.iconPath,
      completionRecordHash: null,
    };
  }

  return null;
}
