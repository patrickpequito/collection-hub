"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import {
  useProfileActivityCompletions,
  useProfileQuestCompletions,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  collectDifficultyHuntActivityHashes,
  collectQuestCompletionTargets,
  computeCampaignProgress,
  countOwnedGroups,
  getCampaignTotal,
  type ExpansionProgressInputs,
} from "@/lib/expansions/expansion-progress";
import { countTitleProgress } from "@/lib/triumphs/record-progress";
import type { TitleEntry } from "@/types/triumph";
import type {
  ExpansionCampaignMission,
  ExpansionCampaignQuest,
  ExpansionDifficultyHunt,
  ExpansionRotatingBossActivity,
} from "@/lib/expansions/resolve-expansion-loot";

type ExpansionProgressStripProps = {
  collectionTotal: number;
  /** Each entry is the set of hashes that count as one collection item. */
  collectionOwnershipGroups: string[][];
  title: TitleEntry | null;
  campaignMissions: ExpansionCampaignMission[];
  campaignLegendaryRecordHash: string;
  campaignQuests?: ExpansionCampaignQuest[];
  difficultyHunts?: ExpansionDifficultyHunt[];
  rotatingBossActivity?: ExpansionRotatingBossActivity | null;
  lootTotal: number;
  lootOwnershipGroups: string[][];
};

export function ExpansionProgressStrip({
  collectionTotal,
  collectionOwnershipGroups,
  title,
  campaignMissions,
  campaignLegendaryRecordHash,
  campaignQuests = [],
  difficultyHunts = [],
  rotatingBossActivity = null,
  lootTotal,
  lootOwnershipGroups,
}: ExpansionProgressStripProps) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  const huntActivityHashes = useMemo(
    () => collectDifficultyHuntActivityHashes(difficultyHunts),
    [difficultyHunts],
  );
  const campaignQuestTargets = useMemo(
    () => collectQuestCompletionTargets(campaignQuests),
    [campaignQuests],
  );
  const activityCompletions = useProfileActivityCompletions(huntActivityHashes);
  const completedQuestHashes = useProfileQuestCompletions(campaignQuestTargets);

  const collectionOwned = useMemo(
    () =>
      showOwnership
        ? countOwnedGroups(collectionOwnershipGroups, ownedItemHashes)
        : null,
    [collectionOwnershipGroups, ownedItemHashes, showOwnership],
  );

  const lootOwned = useMemo(
    () =>
      showOwnership
        ? countOwnedGroups(lootOwnershipGroups, ownedItemHashes)
        : null,
    [lootOwnershipGroups, ownedItemHashes, showOwnership],
  );

  const titleProgress = useMemo(() => {
    if (!title) return { completed: 0, total: 0 };
    const instanceMap = new Map(Object.entries(signedIn ? instances : {}));
    return countTitleProgress(title, instanceMap).all;
  }, [instances, signedIn, title]);

  const titleDone = signedIn && title ? titleProgress.completed : null;
  const titleTotal = title?.records.length ?? 0;

  const campaignInputs: Pick<
    ExpansionProgressInputs,
    | "campaignMissions"
    | "campaignLegendaryRecordHash"
    | "campaignQuests"
    | "difficultyHunts"
    | "rotatingBossActivity"
  > = useMemo(
    () => ({
      campaignMissions,
      campaignLegendaryRecordHash,
      campaignQuests,
      difficultyHunts,
      rotatingBossActivity,
    }),
    [campaignMissions, campaignLegendaryRecordHash, campaignQuests, difficultyHunts, rotatingBossActivity],
  );

  const campaignProgress = useMemo(
    () =>
      signedIn
        ? computeCampaignProgress(
            campaignInputs,
            instances,
            activityCompletions,
            completedQuestHashes,
            ownedItemHashes,
          )
        : null,
    [
      activityCompletions,
      campaignInputs,
      completedQuestHashes,
      instances,
      ownedItemHashes,
      signedIn,
    ],
  );

  const campaignTotal = getCampaignTotal({
    slug: "",
    collectionTotal,
    collectionOwnershipGroups,
    title,
    campaignMissions,
    campaignLegendaryRecordHash,
    campaignQuests,
    difficultyHunts,
    rotatingBossActivity,
    lootTotal,
    lootOwnershipGroups,
  });

  return (
    <StatBlockGrid count={4}>
      <StatBlock label="Collection">
        <StatCount owned={collectionOwned} total={collectionTotal} gold />
      </StatBlock>
      <StatBlock label={title?.guardianTitle ? `Title · ${title.guardianTitle}` : "Title"}>
        <StatCount owned={titleDone} total={titleTotal} />
      </StatBlock>
      <StatBlock label="Campaign">
        <StatCount
          owned={campaignProgress?.completed ?? null}
          total={campaignProgress?.total ?? campaignTotal}
        />
      </StatBlock>
      <StatBlock label="Loot">
        <StatCount owned={lootOwned} total={lootTotal} gold />
      </StatBlock>
    </StatBlockGrid>
  );
}
