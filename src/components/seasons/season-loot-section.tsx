"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { useOwnership } from "@/components/client-ownership";
import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import { LootItemGrid } from "@/components/loot-section";
import type { SeasonWeaponPool } from "@/lib/seasons/resolve-season-loot";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";

function ownsItem(item: LootItem, owned: Set<string>): boolean {
  return (item.ownershipHashes?.length ? item.ownershipHashes : [item.itemHash]).some(
    (hash) => owned.has(hash),
  );
}

/** Seasonal armor set(s): all three classes, set preview beside them. */
export function SeasonArmorSection({
  armorGroups,
  itemHrefs,
}: {
  armorGroups: LegacyArmorSetGroup[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  if (armorGroups.length === 0) return null;

  // Same armor set block as raid / playlist pages (always open).
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Armor" />
      {armorGroups.map((group) => {
        const name = group.displayName ?? group.setName;
        const source = group.rows
          .flatMap((row) => Object.values(row.pieces))
          .find((piece) => piece?.source)?.source;
        return (
          <ArmorSetBlock
            key={group.setName}
            setName={name}
            title={group.kind === "ornament" ? `Ornaments · ${name.replace(/ ornaments$/i, "")}` : `Armor · ${name}`}
            rows={group.rows}
            previewFiles={[group.previewFile ?? resolveArmorSetPreviewFile(group.setName, source ?? "")]}
            missingImageVariant="contribute"
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
          />
        );
      })}
    </section>
  );
}

/** Season weapons grouped by source, two boxes per row. */
export function SeasonWeaponsSection({
  weaponPools,
  itemHrefs,
}: {
  weaponPools: SeasonWeaponPool[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  if (weaponPools.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Weapons" note="Grouped by source" />
      <div className="grid items-start gap-3 md:grid-cols-2">
        {weaponPools.map((pool) => {
          const owned = pool.weapons.filter((item) => ownsItem(item, ownedItemHashes)).length;
          return (
            <div
              key={pool.id}
              className="min-w-0 space-y-3 border border-hairline bg-panel/85 p-3 sm:p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">
                  {pool.title}
                </h3>
                <span className="ui-label shrink-0">
                  {showOwnership ? `${owned} / ${pool.weapons.length}` : pool.weapons.length}
                </span>
              </div>
              <LootItemGrid
                items={pool.weapons}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                itemHrefs={itemHrefs}
                fill
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
