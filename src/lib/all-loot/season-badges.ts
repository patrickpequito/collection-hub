import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";

export type SeasonBadge = {
  key: string;
  iconPath: string;
  label: string;
};

function badgeFromVersion(version: AllLootItemVersion): SeasonBadge | null {
  const iconPath =
    version.seasonDisplayIconPath ?? version.seasonIconPath ?? undefined;
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
  const seen = new Set<string>();

  const addBadge = (badge: SeasonBadge | null) => {
    if (!badge || seen.has(badge.label)) return;
    seen.add(badge.label);
    badges.push(badge);
  };

  if (weapon.versions?.length) {
    for (const version of weapon.versions) {
      addBadge(badgeFromVersion(version));
    }
    return badges;
  }

  addBadge(
    badgeFromVersion({
      itemHash: weapon.itemHash,
      name: weapon.name,
      iconPath: weapon.iconPath,
      seasonIconPath: weapon.seasonIconPath,
      seasonDisplayIconPath: weapon.seasonDisplayIconPath,
      seasonLabel: weapon.seasonLabel,
      seasonNumber: weapon.seasonNumber,
      eventLabel: weapon.eventLabel,
    }),
  );

  return badges;
}
