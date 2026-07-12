import { ACTIVITY_LOOT_PANEL_CLASS } from "@/components/activity-current-loot-panel";
import { ActivityWeaponPoolSection } from "@/components/activity-weapon-pool-section";
import { LootItemGrid } from "@/components/loot-section";
import type {
  ActivityWeaponPool,
  TrialsWeaponSeasonGroup,
} from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";

type TrialsWeaponsBySeasonSectionProps = {
  groups: TrialsWeaponSeasonGroup[];
  weaponPools?: ActivityWeaponPool[];
  activityTitle?: string;
  footerNote?: string;
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
};

function collectOwnedItemHashes(
  items: LootItem[],
  ownedItemHashes: Set<string>,
  resolveItemOwned?: (itemHash: string) => boolean,
): string[] {
  return items
    .filter(
      (item) =>
        resolveItemOwned?.(item.itemHash) ??
        ownedItemHashes.has(item.itemHash),
    )
    .map((item) => item.itemHash);
}

export function TrialsWeaponsBySeasonSection({
  groups,
  weaponPools,
  activityTitle = "Trials of Osiris",
  footerNote,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: TrialsWeaponsBySeasonSectionProps) {
  const hasSeasonGroups = groups.length > 0;
  const hasPools = weaponPools && weaponPools.length > 0;

  if (!hasSeasonGroups && !hasPools) return null;

  const defaultWeaponPoolId =
    weaponPools?.find((pool) => pool.isActive)?.id ?? weaponPools?.[0]?.id ?? "";
  const ownedPoolItemHashes = weaponPools
    ? collectOwnedItemHashes(
        weaponPools.flatMap((pool) => pool.items),
        ownedItemHashes,
        resolveItemOwned,
      )
    : [];

  return (
    <section className={ACTIVITY_LOOT_PANEL_CLASS}>
      <div className="space-y-6">
        {hasPools ? (
          <ActivityWeaponPoolSection
            pools={weaponPools}
            defaultPoolId={defaultWeaponPoolId}
            ownedPoolItemHashes={ownedPoolItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
            inactivePoolMessage={`Not in rotation this ${activityTitle}.`}
            heading={null}
          />
        ) : null}

        {hasSeasonGroups ? (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={`${group.seasonNumber}-${group.seasonLabel}`}>
                <p className="mb-2 text-xs text-zinc-500">{group.seasonLabel}</p>
                <LootItemGrid
                  items={group.items}
                  ownedItemHashes={ownedItemHashes}
                  showOwnership={showOwnership}
                  resolveItemOwned={resolveItemOwned}
                  itemHrefs={itemHrefs}
                />
              </div>
            ))}
          </div>
        ) : null}

        {footerNote ? (
          <p className="border-t border-zinc-800 pt-4 text-xs text-zinc-500">
            {footerNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
