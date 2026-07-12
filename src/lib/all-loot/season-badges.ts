import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";

export type SeasonBadge = {
  key: string;
  iconPath: string;
  label: string;
};

function versionDisplayKey(
  version: Pick<AllLootItemVersion, "seasonLabel" | "eventLabel">,
): string {
  return version.eventLabel ?? version.seasonLabel;
}

/** One row per season/event label — catalog can retain multiple hashes per label. */
export function dedupeVersionsForDisplay(
  weapon: Pick<AllLootItem, "itemHash" | "versions"> & {
    seasonLabel?: string;
    seasonNumber?: number;
    eventLabel?: string;
    iconPath?: string;
    name?: string;
    seasonIconPath?: string;
    seasonDisplayIconPath?: string;
  },
): AllLootItemVersion[] {
  const versions: AllLootItemVersion[] = weapon.versions?.length
    ? weapon.versions
    : [
        {
          itemHash: weapon.itemHash,
          name: weapon.name ?? "",
          iconPath: weapon.iconPath ?? "",
          seasonLabel: weapon.seasonLabel ?? "",
          seasonNumber: weapon.seasonNumber ?? 0,
          eventLabel: weapon.eventLabel,
          seasonIconPath: weapon.seasonIconPath,
          seasonDisplayIconPath: weapon.seasonDisplayIconPath,
        },
      ];

  const byLabel = new Map<string, AllLootItemVersion>();

  for (const version of versions) {
    const key = versionDisplayKey(version);
    const existing = byLabel.get(key);
    if (!existing) {
      byLabel.set(key, version);
      continue;
    }
    if (version.itemHash === weapon.itemHash) {
      byLabel.set(key, version);
      continue;
    }
    if (existing.itemHash === weapon.itemHash) {
      continue;
    }
    if ((version.seasonNumber ?? 0) > (existing.seasonNumber ?? 0)) {
      byLabel.set(key, version);
    }
  }

  return [...byLabel.values()];
}

function badgeFromVersion(version: AllLootItemVersion): SeasonBadge | null {
  const iconPath = version.seasonIconPath ?? version.seasonDisplayIconPath ?? undefined;
  const label = version.eventLabel ?? version.seasonLabel;
  if (!iconPath || !label) return null;

  return {
    key: version.itemHash,
    iconPath,
    label,
  };
}

export function resolveVersionDisplayLabel(
  version: Pick<AllLootItemVersion, "seasonLabel" | "eventLabel">,
): string {
  return version.eventLabel ?? version.seasonLabel;
}

export function resolveSeasonBadges(weapon: AllLootItem): SeasonBadge[] {
  const badges: SeasonBadge[] = [];
  const seenLabels = new Set<string>();

  for (const version of dedupeVersionsForDisplay(weapon)) {
    const badge = badgeFromVersion(version);
    if (!badge || seenLabels.has(badge.label)) continue;
    seenLabels.add(badge.label);
    badges.push(badge);
  }

  return badges;
}
