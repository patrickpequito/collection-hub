"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";

type SeasonProgressStripProps = {
  total: number;
  ownershipGroups: string[][];
  exoticOwnershipGroups: string[][];
  cosmeticOwnershipGroups: string[][];
};

/** Season loot, exotics and Season Pass cosmetics. */
export function SeasonProgressStrip({
  total,
  ownershipGroups,
  exoticOwnershipGroups,
  cosmeticOwnershipGroups,
}: SeasonProgressStripProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const count = useMemo(
    () => (groups: string[][]) =>
      showOwnership ? countOwnedGroups(groups, ownedItemHashes) : null,
    [ownedItemHashes, showOwnership],
  );

  const blocks = [
    { label: "Season loot", groups: ownershipGroups, total, gold: true },
    { label: "Exotics", groups: exoticOwnershipGroups, total: exoticOwnershipGroups.length },
    {
      label: "Season pass cosmetics",
      groups: cosmeticOwnershipGroups,
      total: cosmeticOwnershipGroups.length,
    },
  ].filter((block) => block.total > 0);

  return (
    <StatBlockGrid count={blocks.length}>
      {blocks.map((block) => (
        <StatBlock key={block.label} label={block.label}>
          <StatCount owned={count(block.groups)} total={block.total} gold={block.gold} />
        </StatBlock>
      ))}
    </StatBlockGrid>
  );
}
