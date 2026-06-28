import type { AllLootItem } from "@/types/all-loot";
import type { WeaponVersionDisplay } from "@/types/weapon-rolls";

function versionFromCatalogItem(weapon: AllLootItem): WeaponVersionDisplay {
  return {
    itemHash: weapon.itemHash,
    iconPath: weapon.iconPath,
    seasonIconPath: weapon.seasonIconPath,
    seasonDisplayIconPath: weapon.seasonDisplayIconPath,
    seasonDisplayIconWatermark: weapon.seasonDisplayIconWatermark,
    seasonLabel: weapon.seasonLabel,
    seasonNumber: weapon.seasonNumber,
    eventLabel: weapon.eventLabel,
  };
}

export function resolveWeaponVersionForHash(
  weapon: AllLootItem,
  itemHash: string,
): WeaponVersionDisplay {
  const version = weapon.versions?.find((entry) => entry.itemHash === itemHash);
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

  if (itemHash === weapon.itemHash) {
    return versionFromCatalogItem(weapon);
  }

  return { ...versionFromCatalogItem(weapon), itemHash };
}
