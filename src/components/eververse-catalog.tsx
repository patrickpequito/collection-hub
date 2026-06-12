"use client";

import { useMemo } from "react";
import { EververseSaleCard } from "@/components/eververse-sale-card";
import type { EververseRotation } from "@/types/eververse";

type EververseCatalogProps = {
  rotation: EververseRotation;
  ownedItemHashes?: string[];
  showOwnership?: boolean;
};

export function EververseCatalog({
  rotation,
  ownedItemHashes = [],
  showOwnership = false,
}: EververseCatalogProps) {
  const ownedSet = useMemo(
    () => new Set(ownedItemHashes),
    [ownedItemHashes],
  );

  const totalItems = rotation.categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  return (
    <div className="space-y-8">
      {showOwnership ? (
        <p className="text-xs text-zinc-500">
          Gold border = already owned. Dimmed icons = not collected yet.
        </p>
      ) : null}

      <p className="text-xs text-zinc-500">
        {totalItems} Bright Dust {totalItems === 1 ? "item" : "items"} on
        rotation.
      </p>

      {rotation.categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {category.label}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {category.items.map((item) => (
              <EververseSaleCard
                key={`${category.id}-${item.itemHash}-${item.brightDustCost}`}
                item={item}
                owned={ownedSet.has(item.itemHash)}
                showOwnership={showOwnership}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
