"use client";

import { ActivityCosmeticLootPanel } from "@/components/activity-current-loot-panel";
import { useOwnership } from "@/components/client-ownership";
import type { ExpansionCosmeticSection } from "@/lib/expansions/resolve-expansion-loot";

/** Expansion page · Cosmetics: ships, sparrows, ghosts, shaders… earned by playing, by type. */
export function ExpansionCosmeticsPanel({
  sections,
  itemHrefs,
}: {
  sections: ExpansionCosmeticSection[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityCosmeticLootPanel
      heading="Cosmetics"
      sections={sections}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
      itemHrefs={itemHrefs}
    />
  );
}
