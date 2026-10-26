import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
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
  /**
   * Icons stretch slightly (52–62px) so each row fills the box edge to edge
   * instead of leaving a gap where a whole column does not fit.
   */
  fill?: boolean;
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
  fill = false,
}: LootItemGridProps) {
  const hrefs = itemHrefs ?? weaponHrefs;
  const isOwned = (itemHash: string) => {
    if (resolveItemOwned) return resolveItemOwned(itemHash);
    const item = items.find((entry) => entry.itemHash === itemHash);
    const hashes = item?.ownershipHashes?.length
      ? item.ownershipHashes
      : [itemHash];
    return hashes.some((hash) => ownedItemHashes.has(hash));
  };
  return (
    <div
      className={
        fill ? "grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5" : "flex flex-wrap gap-1.5"
      }
    >
      {items.map((item) => (
        <CollectionItemIcon
          fluid={fill}
          fillCell={fill}
          key={item.itemHash}
          name={item.name}
          iconPath={item.iconPath}
          source={item.source}
          seasonIconPath={item.seasonIconPath}
          classOrWeaponType={item.classOrWeaponType}
          damageType={item.damageType}
          ammoType={item.ammoType}
          owned={isOwned(item.itemHash)}
          showOwnership={showOwnership}
          ownedBorder={
            exoticItemHashes?.has(item.itemHash) ? "green" : ownedBorder
          }
          href={hrefs?.[item.itemHash]}
          ornamentOverlay={item.itemType === "Ornament"}
          rarity={item.rarity}
          itemType={item.itemType}
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
    <section>
      <SectionHeading title={title} />
      <div className="border border-hairline bg-panel/85 p-4">
        <LootItemGrid
          items={items}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          ownedBorder={ownedBorder}
          exoticItemHashes={exoticItemHashes}
          itemHrefs={itemHrefs ?? weaponHrefs}
        />
      </div>
    </section>
  );
}

/** One block inside a section (like Emblems / Weapons): title, owned count and icons. */
export function LootBox({
  title,
  items,
  ownedItemHashes,
  showOwnership,
  itemHrefs,
  fill = false,
}: Pick<LootSectionProps, "items" | "ownedItemHashes" | "showOwnership" | "itemHrefs"> & {
  title: string;
  /** Icons stretch so rows fill the box (see LootItemGrid). */
  fill?: boolean;
}) {
  const owned = items.filter((item) =>
    (item.ownershipHashes?.length ? item.ownershipHashes : [item.itemHash]).some((hash) => ownedItemHashes.has(hash)),
  ).length;
  return (
    <div className="min-w-0 space-y-3 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4">
      <BoxHeading title={title} note={showOwnership ? `${owned} / ${items.length}` : items.length} />
      <LootItemGrid
        items={items}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        itemHrefs={itemHrefs}
        fill={fill}
      />
    </div>
  );
}
