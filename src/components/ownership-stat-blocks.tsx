"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import { countTitleProgress, countTriumphProgress } from "@/lib/triumphs/record-progress";
import { useSignedIn } from "@/lib/use-signed-in";
import type { TitleEntry, TriumphRecord } from "@/types/triumph";

type OwnershipBlock = {
  label: string;
  /** Each entry is the set of hashes that count as one item. */
  groups: string[][];
  gold?: boolean;
};

/** Header blocks for playlist pages: owned / total per loot group, plus the title. */
export function OwnershipStatBlocks({
  blocks,
  title,
  triumphRecords,
}: {
  blocks: OwnershipBlock[];
  /** Title block (base triumphs toward the seal), placed second. */
  title?: TitleEntry | null;
  /** Playlists without a title: completed / total triumphs, placed last. */
  triumphRecords?: TriumphRecord[];
}) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();

  const titleProgress = useMemo(() => {
    if (!title) return null;
    return countTitleProgress(title, new Map(Object.entries(signedIn ? instances : {}))).base;
  }, [instances, signedIn, title]);

  const cells = blocks.map((block) => (
    <StatBlock key={block.label} label={block.label}>
      <StatCount
        owned={showOwnership ? countOwnedGroups(block.groups, ownedItemHashes) : null}
        total={block.groups.length}
        gold={block.gold}
      />
    </StatBlock>
  ));
  if (title && titleProgress) {
    cells.splice(
      1,
      0,
      <StatBlock key="title" label={title.guardianTitle ? `Title · ${title.guardianTitle}` : "Title"}>
        <StatCount owned={signedIn ? titleProgress.completed : null} total={titleProgress.total} />
      </StatBlock>,
    );
  }

  if (triumphRecords?.length) {
    const progress = countTriumphProgress(triumphRecords, new Map(Object.entries(signedIn ? instances : {})));
    cells.push(
      <StatBlock key="triumphs" label="Triumphs">
        <StatCount owned={signedIn ? progress.completed : null} total={progress.total} />
      </StatBlock>,
    );
  }

  return <StatBlockGrid count={cells.length}>{cells}</StatBlockGrid>;
}
