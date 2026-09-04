import {
  displayNumberFromLabel,
  resolveSeasonLabelFromIconPath,
} from "@/lib/all-loot/season-icon-label";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";

function applyIconLabelToVersion(
  version: AllLootItemVersion,
): AllLootItemVersion {
  const iconLabel = resolveSeasonLabelFromIconPath(version.seasonIconPath);
  if (!iconLabel || iconLabel === version.seasonLabel) {
    return version;
  }

  return {
    ...version,
    seasonLabel: iconLabel,
    seasonNumber: displayNumberFromLabel(iconLabel),
    eventLabel: undefined,
  };
}

/**
 * Align catalog season labels with the season/expansion emblem on each icon.
 * Mirrors the icon-first policy in scripts/all-loot-mappings.mjs.
 */
export function applySeasonItemOverrides(item: AllLootItem): AllLootItem {
  const iconLabel = resolveSeasonLabelFromIconPath(item.seasonIconPath);
  const patchedVersions = item.versions?.map(applyIconLabelToVersion);

  if (!iconLabel || iconLabel === item.seasonLabel) {
    if (!patchedVersions?.length) return item;
    const versionsChanged = patchedVersions.some(
      (version, index) => version !== item.versions?.[index],
    );
    if (!versionsChanged) return item;
    return { ...item, versions: patchedVersions };
  }

  return {
    ...item,
    seasonLabel: iconLabel,
    seasonNumber: displayNumberFromLabel(iconLabel),
    eventLabel: undefined,
    versions: patchedVersions,
  };
}

export function applySeasonCatalogOverrides(items: AllLootItem[]): AllLootItem[] {
  return items.map(applySeasonItemOverrides);
}
