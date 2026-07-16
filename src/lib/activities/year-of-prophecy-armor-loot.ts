import { buildArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { resolveIntroductionSeasonFromItems } from "@/lib/activities/legacy-armor-season";
import { YEAR_OF_PROPHECY_ARMOR_SETS } from "@/data/activities/year-of-prophecy-armor";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";
import type { AllLootItem } from "@/types/all-loot";

export function resolveYearOfProphecyArmorGroups(
  armorItems: AllLootItem[],
): LegacyArmorSetGroup[] {
  const groups: LegacyArmorSetGroup[] = [];

  for (const entry of YEAR_OF_PROPHECY_ARMOR_SETS) {
    const items = armorItems.filter(
      (item) =>
        item.type === "Armor" &&
        item.rarity !== "Exotic" &&
        item.equipableItemSetHash === entry.equipableItemSetHash,
    );
    if (!items.length) continue;

    const rows = buildArmorRowsFromCatalogItems(items, entry.displayName);
    if (!rows.length) continue;

    const { seasonLabel, seasonNumber } = resolveIntroductionSeasonFromItems(
      items,
      entry.catalogName,
    );

    groups.push({
      setName: entry.catalogName,
      displayName: entry.displayName,
      previewFile: entry.previewFile,
      seasonLabel,
      seasonNumber,
      rows,
    });
  }

  return groups;
}
