"use client";

import { useOwnership } from "@/components/client-ownership";
import { LegacyArmorSetsSection } from "@/components/legacy-armor-sets-section";
import { LootItemGrid } from "@/components/loot-section";
import type { SeasonWeaponPool } from "@/lib/seasons/resolve-season-loot";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";

type SeasonLootSectionProps = {
  armorGroups: LegacyArmorSetGroup[];
  weaponPools: SeasonWeaponPool[];
  itemHrefs?: Record<string, string>;
};

export function SeasonLootSection({
  armorGroups,
  weaponPools,
  itemHrefs,
}: SeasonLootSectionProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        Season loot
      </h2>

      {armorGroups.length > 0 ? (
        <div className="mt-4">
          <LegacyArmorSetsSection
            groups={armorGroups}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
            heading="Armor sets"
            bare
          />
        </div>
      ) : null}

      {weaponPools.length > 0 ? (
        <div
          className={
            armorGroups.length > 0
              ? "mt-6 space-y-6 border-t border-zinc-800 pt-6"
              : "mt-6 space-y-6"
          }
        >
          {weaponPools.map((pool) => (
            <div key={pool.id} className="min-w-0 space-y-3">
              <h3 className="text-sm font-medium text-zinc-300">{pool.title}</h3>
              <LootItemGrid
                items={pool.weapons}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                itemHrefs={itemHrefs}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
