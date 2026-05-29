"use client";

import { CollectionItemIcon } from "@/components/collection-item-icon";
import type { ExoticItem } from "@/types/exotic-item";

type ExoticItemGridProps = {
  items: ExoticItem[];
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
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <CollectionItemIcon
          key={item.itemHash}
          name={item.name}
          iconPath={item.iconPath}
          source={item.source}
          owned={ownedItemHashes.has(item.itemHash)}
          showOwnership={showOwnership}
          ownedBorder="green"
        />
      ))}
    </div>
  );
}
