"use client";

import { useOwnership } from "@/components/client-ownership";
import { LootItemGrid } from "@/components/loot-section";
import type { LootItem } from "@/types/activity-loot";

type ExpansionLootPanelProps = {
  title: string;
  description?: string;
  items: LootItem[];
  ownedBorder?: "gold" | "green";
  itemHrefs?: Record<string, string>;
};

export function ExpansionLootPanel({
  title,
  description,
  items,
  ownedBorder = "gold",
  itemHrefs,
}: ExpansionLootPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm text-zinc-400">{description}</p>
      ) : null}
      <div className="mt-4">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500">No items in this section yet.</p>
        ) : (
          <LootItemGrid
            items={items}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            ownedBorder={ownedBorder}
            exoticItemHashes={
              ownedBorder === "green"
                ? new Set(items.map((item) => item.itemHash))
                : undefined
            }
            itemHrefs={itemHrefs}
          />
        )}
      </div>
    </section>
  );
}
