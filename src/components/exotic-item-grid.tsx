"use client";

import { CollectionItemIcon } from "@/components/collection-item-icon";
import type { CollectibleItem } from "@/types/exotic-item";

type OwnableItem = CollectibleItem & {
  alternateItemHashes?: string[];
};

function isItemOwned(item: OwnableItem, ownedItemHashes: Set<string>): boolean {
  if (ownedItemHashes.has(item.itemHash)) return true;
  for (const hash of item.alternateItemHashes ?? []) {
    if (ownedItemHashes.has(hash)) return true;
  }
  return false;
}

type ExoticItemGridProps = {
  items: OwnableItem[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
};

export function ExoticItemGrid({
  items,
  ownedItemHashes,
  showOwnership,
}: ExoticItemGridProps) {
  if (items.length === 0) {
    return <p className="text-xs text-zinc-500">No items in this section.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <CollectionItemIcon
          key={item.itemHash}
          name={item.name}
          iconPath={item.iconPath}
          source={item.source}
          owned={isItemOwned(item, ownedItemHashes)}
          showOwnership={showOwnership}
          ownedBorder="green"
        />
      ))}
    </div>
  );
}
