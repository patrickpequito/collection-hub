import {
  displayNumberFromLabel,
  resolveEventLabelFromIconPath,
  resolveSeasonLabelFromIconPath,
} from "@/lib/all-loot/season-icon-label";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";

function applyIconLabelsToVersion(
  version: AllLootItemVersion,
): AllLootItemVersion {
  const eventFromIcon = resolveEventLabelFromIconPath(version.seasonIconPath);
  if (eventFromIcon) {
    if (version.eventLabel === eventFromIcon) return version;
    return { ...version, eventLabel: eventFromIcon };
  }

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
 * Align catalog labels with the season/event emblem on each icon.
 * Event watermarks set `eventLabel`; season watermarks set `seasonLabel`.
 */
export function applySeasonItemOverrides(item: AllLootItem): AllLootItem {
  const eventFromIcon = resolveEventLabelFromIconPath(item.seasonIconPath);
  const patchedVersions = item.versions?.map(applyIconLabelsToVersion);

  if (eventFromIcon) {
    const versionsChanged = patchedVersions?.some(
      (version, index) => version !== item.versions?.[index],
    );
    if (item.eventLabel === eventFromIcon && !versionsChanged) {
      return item;
    }
    return {
      ...item,
      eventLabel: eventFromIcon,
      versions: patchedVersions,
    };
  }

  const iconLabel = resolveSeasonLabelFromIconPath(item.seasonIconPath);

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
