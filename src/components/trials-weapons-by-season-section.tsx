import { ACTIVITY_LOOT_PANEL_CLASS, PanelHeading } from "@/components/activity-current-loot-panel";
import { ActivityWeaponPoolSection } from "@/components/activity-weapon-pool-section";
import { BoxHeading } from "@/components/detail-page-parts";
import { LootItemGrid } from "@/components/loot-section";
import { RotatingWeaponPools } from "@/components/rotating-weapon-pools";
import type { PoolOccurrence } from "@/lib/activities/pool-rotation";
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
  heading?: string;
  headingNote?: string;
  /** Bonus pool schedule: shows every pool ranked by weekend (Lighthouse listed apart). */
  poolOccurrences?: PoolOccurrence[];
  poolsNowMs?: number;
  /** Title inside the panel (block style), e.g. "Weapons" under a Current loot section. */
  boxTitle?: string;
  /** Labelled weapon groups after the pools (vendor exclusive, Adept, legacy). */
  weaponSubgroups?: { title: string; items: LootItem[] }[];
};

/** Flawless chest pool: always available, so it is not part of the weekly rotation. */
const LIGHTHOUSE_POOL_ID = "lighthouse";

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
  heading,
  headingNote,
  poolOccurrences,
  poolsNowMs,
  boxTitle,
  weaponSubgroups,
}: TrialsWeaponsBySeasonSectionProps) {
  const hasSeasonGroups = groups.length > 0;
  const hasPools = weaponPools && weaponPools.length > 0;
  const subgroups = (weaponSubgroups ?? []).filter((group) => group.items.length > 0);

  if (!hasSeasonGroups && !hasPools && !subgroups.length) return null;

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
    <section>
      {heading ? <PanelHeading title={heading} note={headingNote} /> : null}
      <div className={`${ACTIVITY_LOOT_PANEL_CLASS} space-y-6`}>
        {boxTitle ? (
          <BoxHeading
            title={boxTitle}
            note={(() => {
              const all = [
                ...new Map(
                  [
                    ...(weaponPools ?? []).flatMap((pool) => pool.items),
                    ...groups.flatMap((group) => group.items),
                    ...(weaponSubgroups ?? []).flatMap((group) => group.items),
                  ].map(
                    (item) => [item.itemHash, item],
                  ),
                ).values(),
              ];
              return showOwnership
                ? `${collectOwnedItemHashes(all, ownedItemHashes, resolveItemOwned).length} / ${all.length}`
                : all.length;
            })()}
          />
        ) : null}
        {hasPools && poolOccurrences ? (
          <div className="space-y-3">
            <RotatingWeaponPools
              pools={weaponPools.filter((pool) => pool.id !== LIGHTHOUSE_POOL_ID)}
              occurrences={poolOccurrences}
              initialNowMs={poolsNowMs ?? 0}
              upcomingAsNext
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              itemHrefs={itemHrefs}
            />
            {weaponPools
              .filter((pool) => pool.id === LIGHTHOUSE_POOL_ID)
              .map((pool) => (
                <div key={pool.id} className="space-y-2 border-t border-white/[0.08] pt-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="ui-label text-[11px]!">Lighthouse · flawless reward</span>
                    <span className="ui-label text-[11px]!">
                      {showOwnership
                        ? `${collectOwnedItemHashes(pool.items, ownedItemHashes, resolveItemOwned).length} / ${pool.items.length}`
                        : pool.items.length}
                    </span>
                  </div>
                  <LootItemGrid
                    items={pool.items}
                    ownedItemHashes={ownedItemHashes}
                    showOwnership={showOwnership}
                    resolveItemOwned={resolveItemOwned}
                    itemHrefs={itemHrefs}
                  />
                </div>
              ))}
          </div>
        ) : hasPools ? (
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

        {subgroups.map((group) => (
          <div key={group.title} className="space-y-2 border-t border-white/[0.08] pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="ui-label text-[11px]!">{group.title}</span>
              <span className="ui-label text-[11px]!">
                {showOwnership
                  ? `${collectOwnedItemHashes(group.items, ownedItemHashes, resolveItemOwned).length} / ${group.items.length}`
                  : group.items.length}
              </span>
            </div>
            <LootItemGrid
              items={group.items}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              itemHrefs={itemHrefs}
            />
          </div>
        ))}

        {hasSeasonGroups ? (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={`${group.seasonNumber}-${group.seasonLabel}`}>
                <p className="ui-label mb-2">{group.seasonLabel}</p>
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
