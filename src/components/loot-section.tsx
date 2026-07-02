import { CollectionItemIcon } from "@/components/collection-item-icon";
import type { LootItem } from "@/types/activity-loot";

type LootItemGridProps = {
  items: LootItem[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  ownedBorder?: "gold" | "green";
  /** Item hashes that use green border (exotics) regardless of ownedBorder default. */
  exoticItemHashes?: Set<string>;
  weaponHrefs?: Record<string, string>;
  itemHrefs?: Record<string, string>;
};

export function LootItemGrid({
  items,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  ownedBorder = "gold",
  exoticItemHashes,
  weaponHrefs,
  itemHrefs,
}: LootItemGridProps) {
  const hrefs = itemHrefs ?? weaponHrefs;
  const isOwned = (itemHash: string) =>
    resolveItemOwned?.(itemHash) ?? ownedItemHashes.has(itemHash);
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <CollectionItemIcon
          key={item.itemHash}
          name={item.name}
          iconPath={item.iconPath}
          source={item.source}
          owned={isOwned(item.itemHash)}
          showOwnership={showOwnership}
          ownedBorder={
            exoticItemHashes?.has(item.itemHash) ? "green" : ownedBorder
          }
          href={hrefs?.[item.itemHash]}
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
  resolveItemOwned?: (itemHash: string) => boolean;
  ownedBorder?: "gold" | "green";
  exoticItemHashes?: Set<string>;
  weaponHrefs?: Record<string, string>;
  itemHrefs?: Record<string, string>;
};

export function LootSection({
  title,
  items,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  ownedBorder = "gold",
  exoticItemHashes,
  weaponHrefs,
  itemHrefs,
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
        resolveItemOwned={resolveItemOwned}
        ownedBorder={ownedBorder}
        exoticItemHashes={exoticItemHashes}
        itemHrefs={itemHrefs ?? weaponHrefs}
      />
    </section>
  );
}
