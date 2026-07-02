import type { AllLootItem } from "@/types/all-loot";
import type { WeaponVersionDisplay } from "@/types/weapon-rolls";

function versionFromCatalogItem(armor: AllLootItem): WeaponVersionDisplay {
  return {
    itemHash: armor.itemHash,
    iconPath: armor.iconPath,
    seasonIconPath: armor.seasonIconPath,
    seasonDisplayIconPath: armor.seasonDisplayIconPath,
    seasonDisplayIconWatermark: armor.seasonDisplayIconWatermark,
    seasonLabel: armor.seasonLabel,
    seasonNumber: armor.seasonNumber,
    eventLabel: armor.eventLabel,
  };
}

export function resolveArmorVersionForHash(
  armor: AllLootItem,
  itemHash: string,
): WeaponVersionDisplay {
  const version = armor.versions?.find((entry) => entry.itemHash === itemHash);
  if (version) {
    return {
      itemHash: version.itemHash,
      iconPath: version.iconPath,
      seasonIconPath: version.seasonIconPath,
      seasonDisplayIconPath: version.seasonDisplayIconPath,
      seasonDisplayIconWatermark: version.seasonDisplayIconWatermark,
      seasonLabel: version.seasonLabel,
      seasonNumber: version.seasonNumber,
      eventLabel: version.eventLabel,
    };
  }

  if (itemHash === armor.itemHash) {
    return versionFromCatalogItem(armor);
  }

  return { ...versionFromCatalogItem(armor), itemHash };
}
