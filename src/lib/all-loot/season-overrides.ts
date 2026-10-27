import {
  displayNumberFromLabel,
  resolveEventLabelFromIconPath,
  resolveSeasonLabelFromIconPath,
} from "@/lib/all-loot/season-icon-label";
import { eventDisplayLabel, eventYear } from "@/lib/all-loot/events";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";

/** Events read from the source text (no watermark of their own): keep them when the season is re-derived. */
const SOURCE_EVENTS = new Set(["Crimson Days", "The Revelry"]);
/** Moments of Triumph rewards carry their season's emblem: listed under that season, not as an event. */
const NOT_EVENTS = new Set(["Moments of Triumph"]);

function dropNonEvents(item: AllLootItem): AllLootItem {
  const drop = (label?: string) => (label && NOT_EVENTS.has(label) ? undefined : label);
  if (!NOT_EVENTS.has(item.eventLabel ?? "") && !item.versions?.some((version) => NOT_EVENTS.has(version.eventLabel ?? ""))) {
    return item;
  }
  return {
    ...item,
    eventLabel: drop(item.eventLabel),
    versions: item.versions?.map((version) => ({ ...version, eventLabel: drop(version.eventLabel) })),
  };
}
const keptEvent = (label?: string) => (label && SOURCE_EVENTS.has(label) ? label : undefined);

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
    eventLabel: keptEvent(version.eventLabel),
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
    eventLabel: keptEvent(item.eventLabel),
    versions: patchedVersions,
  };
}

/** Event items get the year of their edition, searchable as "the dawning 2019". */
function withEventYears(item: AllLootItem): AllLootItem {
  const versions = item.versions?.map((version) =>
    version.eventLabel
      ? { ...version, eventYear: eventYear(version.eventLabel, version.seasonLabel, item.source) ?? undefined }
      : version,
  );
  const year = item.eventLabel ? (eventYear(item.eventLabel, item.seasonLabel, item.source) ?? undefined) : undefined;
  const labels = [
    item.eventLabel ? eventDisplayLabel(item.eventLabel, year) : null,
    ...(versions ?? []).map((version) => (version.eventLabel ? eventDisplayLabel(version.eventLabel, version.eventYear) : null)),
  ].filter((label): label is string => Boolean(label));
  if (!labels.length) return item;
  return {
    ...item,
    eventYear: year,
    versions,
    searchText: `${item.searchText} ${[...new Set(labels)].join(" ").toLowerCase()}`,
  };
}

export function applySeasonCatalogOverrides(items: AllLootItem[]): AllLootItem[] {
  return items.map((item) => withEventYears(applySeasonItemOverrides(dropNonEvents(item))));
}
