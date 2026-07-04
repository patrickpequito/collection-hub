import type { AllLootItem } from "@/types/all-loot";
import type { ArmorPiece, ArmorPieceVersion } from "@/types/armor-set";
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

export function resolveArmorScreenshotForHash(
  armor: AllLootItem,
  itemHash: string,
): string | undefined {
  const version = armor.versions?.find((entry) => entry.itemHash === itemHash);
  if (version?.screenshotPath) return version.screenshotPath;
  if (itemHash === armor.itemHash) return armor.screenshotPath;
  return undefined;
}

export function resolveSeasonKeyFromVersion(
  version: Pick<WeaponVersionDisplay, "seasonLabel" | "eventLabel">,
): string {
  return version.eventLabel ?? version.seasonLabel;
}

export function resolveArmorPieceForSeason(
  piece: ArmorPiece,
  seasonKey: string | null,
): Pick<ArmorPiece, "itemHash" | "iconPath"> {
  if (!seasonKey || !piece.versions?.length) {
    return { itemHash: piece.itemHash, iconPath: piece.iconPath };
  }

  const match = piece.versions.find(
    (version) =>
      version.seasonLabel === seasonKey ||
      version.eventLabel === seasonKey,
  );
  if (match) {
    return { itemHash: match.itemHash, iconPath: match.iconPath };
  }

  return { itemHash: piece.itemHash, iconPath: piece.iconPath };
}

export function catalogItemVersions(item: AllLootItem): ArmorPieceVersion[] {
  const versions: ArmorPieceVersion[] = [];
  const seen = new Set<string>();

  const add = (entry: ArmorPieceVersion) => {
    if (seen.has(entry.itemHash)) return;
    seen.add(entry.itemHash);
    versions.push(entry);
  };

  add({
    itemHash: item.itemHash,
    iconPath: item.iconPath,
    seasonLabel: item.seasonLabel,
    seasonNumber: item.seasonNumber,
    eventLabel: item.eventLabel,
    screenshotPath: item.screenshotPath,
  });

  for (const version of item.versions ?? []) {
    add({
      itemHash: version.itemHash,
      iconPath: version.iconPath,
      seasonLabel: version.seasonLabel,
      seasonNumber: version.seasonNumber,
      eventLabel: version.eventLabel,
      screenshotPath: version.screenshotPath,
    });
  }

  return versions;
}
