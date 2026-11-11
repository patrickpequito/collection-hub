"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { useOwnership } from "@/components/client-ownership";
import { LootItemGrid } from "@/components/loot-section";
import type { LootItem } from "@/types/activity-loot";

type ExpansionLootPanelProps = {
  title: string;
  description?: string;
  items: LootItem[];
  ownedBorder?: "gold" | "green";
  itemHrefs?: Record<string, string>;
  /** Small label at the right of the heading (e.g. "Not obtainable"). */
  note?: string;
};

export function ExpansionLootPanel({
  title,
  description,
  items,
  ownedBorder = "gold",
  itemHrefs,
  note,
}: ExpansionLootPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  return (
    <section className="min-w-0">
      <SectionHeading title={title} note={note} />
      <div className="min-w-0 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4">
      {description ? (
        <p className="mb-4 text-sm text-zinc-400">{description}</p>
      ) : null}
      <div>
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
      </div>
    </section>
  );
}
