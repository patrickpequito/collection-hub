"use client";

import { useMemo, useState } from "react";
import { LootItemGrid } from "@/components/loot-section";
import type { ActivityWeaponPool } from "@/types/activity-hub";

type ActivityWeaponPoolSectionProps = {
  pools: ActivityWeaponPool[];
  defaultPoolId: string;
  ownedPoolItemHashes: string[];
  showOwnership: boolean;
  itemHrefs?: Record<string, string>;
  inactivePoolMessage?: string;
  /** Subsection label; pass `null` to hide. */
  heading?: string | null;
};

export function ActivityWeaponPoolSection({
  pools,
  defaultPoolId,
  ownedPoolItemHashes,
  showOwnership,
  itemHrefs,
  inactivePoolMessage = "Not in rotation this Iron Banner.",
  heading = "Weapons",
}: ActivityWeaponPoolSectionProps) {
  const [selectedPoolId, setSelectedPoolId] = useState(defaultPoolId);
  const ownedItemHashes = useMemo(
    () => new Set(ownedPoolItemHashes),
    [ownedPoolItemHashes],
  );
  const selectedPool =
    pools.find((pool) => pool.id === selectedPoolId) ?? pools[0];

  if (!selectedPool || pools.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {heading ? (
          <h3 className="text-sm font-medium text-zinc-300">{heading}</h3>
        ) : null}
        <div
          className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5"
          role="tablist"
          aria-label="Weapon pools"
        >
          {pools.map((pool) => {
            const isSelected = pool.id === selectedPoolId;

            return (
              <button
                key={pool.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedPoolId(pool.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {pool.label}
                {pool.isActive ? (
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    Active
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {!selectedPool.isActive ? (
        <p className="mb-2 text-xs text-zinc-500">{inactivePoolMessage}</p>
      ) : null}

      <LootItemGrid
        items={selectedPool.items}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        itemHrefs={itemHrefs}
      />
    </div>
  );
}
