"use client";

import { useMemo } from "react";
import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { useOwnership } from "@/components/client-ownership";
import { SectionHeading } from "@/components/detail-page-parts";
import { LootBox } from "@/components/loot-section";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import type { EververseLoot } from "@/lib/eververse/resolve-eververse";
import type { LootItem } from "@/types/activity-loot";

type EververseSectionProps = {
  eververse: EververseLoot;
  /** Blurb under the heading; defaults to the season wording. */
  /** null hides the intro text (expansion pages). */
  description?: string | null;
  itemHrefs?: Record<string, string>;
};

/**
 * Eververse cosmetics: armor ornament sets as the shared armor set block, then every
 * other cosmetic type in two-column boxes with an owned count (like Monument cosmetics).
 */
export function EververseSection({
  eververse,
  description = "Cosmetics from this season sold in the Eververse for Silver or Bright Dust. Not counted in the season collection progress.",
  itemHrefs,
}: EververseSectionProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const { ornamentSets, otherArmorOrnaments, exoticArmorOrnaments, weaponOrnaments, sections } = eververse;

  const owned = useMemo(
    () => (showOwnership ? countOwnedGroups(eververse.ownershipGroups, ownedItemHashes) : null),
    [eververse.ownershipGroups, ownedItemHashes, showOwnership],
  );

  if (eververse.total === 0) return null;

  const boxes: { title: string; items: LootItem[] }[] = [
    { title: "Armor ornaments", items: otherArmorOrnaments.flatMap((group) => group.items) },
    { title: "Exotic armor ornaments", items: exoticArmorOrnaments.flatMap((group) => group.items) },
    { title: "Weapon ornaments", items: weaponOrnaments },
    ...sections,
  ].filter((box) => box.items.length > 0);

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading
        title="Eververse"
        note={
          owned === null
            ? `${eververse.total} items · not counted in progress`
            : `${owned} / ${eververse.total} owned · not counted in progress`
        }
      />
      {description ? <p className="text-sm text-ash">{description}</p> : null}

      {ornamentSets.map((group) => {
        const name = group.displayName ?? group.setName;
        const source = group.rows
          .flatMap((row) => Object.values(row.pieces))
          .find((piece) => piece?.source)?.source;
        return (
          <ArmorSetBlock
            key={group.setName}
            setName={name}
            title={`Ornaments · ${name.replace(/ ornaments$/i, "")}`}
            rows={group.rows}
            previewFiles={[group.previewFile ?? resolveArmorSetPreviewFile(group.setName, source ?? "")]}
            missingImageVariant="contribute"
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
          />
        );
      })}

      {boxes.length ? (
        <div className="grid items-start gap-3 md:grid-cols-2">
          {boxes.map((box) => (
            <LootBox
              key={box.title}
              title={box.title}
              items={box.items}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              itemHrefs={itemHrefs}
              fill
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
