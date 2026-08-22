"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
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
  lootTotal: number;
  lootOwnershipGroups: string[][];
};

function StatCard({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  /** 0–1 when known; null shows an empty track. */
  progress: number | null;
}) {
  const widthPercent =
    progress == null ? 0 : Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-zinc-900/40 ${
        progress != null && progress >= 1
          ? "border-[#c9a227]/50"
          : "border-zinc-800"
      }`}
    >
      <div className="px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">
          {value}
        </p>
      </div>
      <div
        className="h-1 w-full bg-zinc-800"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress == null ? undefined : Math.round(widthPercent)}
      >
        <div
          className="h-full bg-[#c9a227] transition-[width] duration-300 ease-out"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

export function ExpansionProgressStrip({
  collectionTotal,
  collectionOwnershipGroups,
  title,
  campaignMissions,
  campaignLegendaryRecordHash,
  campaignQuests = [],
  difficultyHunts = [],
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
  > = {
    campaignMissions,
    campaignLegendaryRecordHash,
    campaignQuests,
    difficultyHunts,
  };

  const campaignProgress = useMemo(
    () =>
      signedIn
        ? computeCampaignProgress(
            campaignInputs,
            instances,
            activityCompletions,
            completedQuestHashes,
            showOwnership ? ownedItemHashes : undefined,
          )
        : null,
    [
      activityCompletions,
      campaignInputs,
      completedQuestHashes,
      instances,
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
    lootTotal,
    lootOwnershipGroups,
  });

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Collection"
        value={
          collectionOwned === null
            ? `— / ${collectionTotal}`
            : `${collectionOwned}/${collectionTotal}`
        }
        progress={
          collectionOwned == null || collectionTotal === 0
            ? null
            : collectionOwned / collectionTotal
        }
      />
      <StatCard
        label="Title"
        value={
          titleDone === null
            ? `— / ${titleTotal}`
            : `${titleDone}/${titleTotal}`
        }
        progress={
          titleDone == null || titleTotal === 0
            ? null
            : titleDone / titleTotal
        }
      />
      <StatCard
        label="Campaign"
        value={
          campaignProgress == null
            ? `— / ${campaignTotal}`
            : campaignProgress.label
        }
        progress={
          campaignProgress == null || campaignProgress.total === 0
            ? null
            : campaignProgress.completed / campaignProgress.total
        }
      />
      <StatCard
        label="Loot owned"
        value={
          lootOwned === null ? `— / ${lootTotal}` : `${lootOwned}/${lootTotal}`
        }
        progress={
          lootOwned == null || lootTotal === 0 ? null : lootOwned / lootTotal
        }
      />
    </section>
  );
}
