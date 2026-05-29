"use client";

import { useMemo, useState } from "react";
import { ArmorSetCard } from "@/components/armor-set-card";
import {
  ARMOR_CATEGORIES,
  countSetsByCategory,
  filterSetsByCategory,
} from "@/lib/armor-sets/constants";
import type { ArmorCategory, ArmorSet } from "@/types/armor-set";

type ArmorSetCatalogProps = {
  sets: ArmorSet[];
  ownedItemHashes?: string[];
  showOwnership?: boolean;
};

export function ArmorSetCatalog({
  sets,
  ownedItemHashes = [],
  showOwnership = false,
}: ArmorSetCatalogProps) {
  const counts = useMemo(() => countSetsByCategory(sets), [sets]);
  const [activeCategory, setActiveCategory] = useState<ArmorCategory>("raids");

  const ownedSet = useMemo(
    () => new Set(ownedItemHashes),
    [ownedItemHashes],
  );

  const visibleSets = useMemo(
    () => filterSetsByCategory(sets, activeCategory),
    [sets, activeCategory],
  );

  return (
    <div className="space-y-6">
      {showOwnership ? (
        <p className="text-xs text-zinc-500">
          Gold border = in your inventory. Dimmed icons = not collected yet.
          Hover a piece for its source.
        </p>
      ) : null}

      <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        {ARMOR_CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              activeCategory === tab.id
                ? "bg-white text-zinc-950"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({counts[tab.id]})</span>
          </button>
        ))}
      </nav>

      {visibleSets.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No armor sets in this category yet. Run{" "}
          <code className="text-zinc-200">npm run generate:armor-sets</code> after
          game updates.
        </p>
      ) : (
        <div className="grid gap-4">
          {visibleSets.map((set) => (
            <ArmorSetCard
              key={set.id}
              set={set}
              ownedItemHashes={ownedSet}
              showOwnership={showOwnership}
            />
          ))}
        </div>
      )}
    </div>
  );
}
