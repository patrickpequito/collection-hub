import { CollectionItemIcon } from "@/components/collection-item-icon";
import type { LootItem } from "@/types/activity-loot";

type LootItemGridProps = {
  items: LootItem[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  ownedBorder?: "gold" | "green";
  /** Item hashes that use green border (exotics) regardless of ownedBorder default. */
  exoticItemHashes?: Set<string>;
};

export function LootItemGrid({
  items,
  ownedItemHashes,
  showOwnership,
  ownedBorder = "gold",
  exoticItemHashes,
}: LootItemGridProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <CollectionItemIcon
          key={item.itemHash}
          name={item.name}
          iconPath={item.iconPath}
          source={item.source}
          owned={ownedItemHashes.has(item.itemHash)}
          showOwnership={showOwnership}
          ownedBorder={
            exoticItemHashes?.has(item.itemHash) ? "green" : ownedBorder
          }
        />
      ))}
    </div>
  );
}

type LootSectionProps = {
  title: string;
  items: LootItem[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  ownedBorder?: "gold" | "green";
  exoticItemHashes?: Set<string>;
};

export function LootSection({
  title,
  items,
  ownedItemHashes,
  showOwnership,
  ownedBorder = "gold",
  exoticItemHashes,
}: LootSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-4 border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        {title}
      </h2>
      <LootItemGrid
        items={items}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        ownedBorder={ownedBorder}
        exoticItemHashes={exoticItemHashes}
      />
    </section>
  );
}
