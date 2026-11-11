"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import type { ReactNode } from "react";
import { useOwnership } from "@/components/client-ownership";
import { ActivityCurrentLootPanel } from "@/components/activity-current-loot-panel";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

/**
 * Expansion page · Destination: banner to the destination page plus its loot.
 * Region chests and lost sectors live on the destination page (Activities).
 */
type ExpansionDestinationPanelProps = {
  destinationTitle: string;
  /** Destination banner under the section title (rendered on the server). */
  banner?: ReactNode;
  destinationActivityTitle: string;
  destinationActivitySlug: string;
  armorRows: ActivityArmorRow[];
  weapons: LootItem[];
  previewFiles?: string[];
  itemHrefs?: Record<string, string>;
};

export function ExpansionDestinationPanel({
  destinationTitle,
  banner,
  destinationActivityTitle,
  destinationActivitySlug,
  armorRows,
  weapons,
  previewFiles,
  itemHrefs,
}: ExpansionDestinationPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const hasLoot = armorRows.length > 0 || weapons.length > 0;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title={destinationTitle.replace(" // ", " · ")} />
      {banner}

      {hasLoot ? (
        <ActivityCurrentLootPanel
          activitySlug={destinationActivitySlug}
          activityTitle={destinationActivityTitle}
          armorRows={armorRows}
          previewFiles={previewFiles}
          weapons={weapons}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          itemHrefs={itemHrefs}
        />
      ) : (
        <p className="text-sm text-zinc-400">
          Destination loot will appear here as it is curated for this expansion.
        </p>
      )}
    </section>
  );
}
