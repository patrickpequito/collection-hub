import type {
  ExpansionCampaignMission,
  ExpansionCampaignQuest,
  ExpansionDifficultyHunt,
  ExpansionHuntDifficultyTier,
  ExpansionRotatingBossActivity,
} from "@/lib/expansions/resolve-expansion-loot";
import type { QuestCompletionTarget } from "@/lib/destiny-quest-progress";
import {
  countTitleProgress,
  isProfileRecordComplete,
} from "@/lib/triumphs/record-progress";
import type { RecordInstance, TitleEntry } from "@/types/triumph";

export type ExpansionProgressInputs = {
  slug: string;
  collectionTotal: number;
  collectionOwnershipGroups: string[][];
  title: TitleEntry | null;
  campaignMissions: ExpansionCampaignMission[];
  campaignLegendaryRecordHash: string;
  campaignQuests: ExpansionCampaignQuest[];
  difficultyHunts: ExpansionDifficultyHunt[];
  rotatingBossActivity: ExpansionRotatingBossActivity | null;
  lootTotal: number;
  lootOwnershipGroups: string[][];
};

export type ExpansionCampaignProgress = {
  completed: number;
  total: number;
  label: string;
};

export type ExpansionOverallProgress = {
  completed: number;
  total: number;
  /** 0–1 when signed in; null when unknown. */
  progress: number | null;
  /** 0–100 rounded when signed in; null when unknown. */
  percent: number | null;
};

export function countOwnedGroups(
  groups: string[][],
  ownedItemHashes: Set<string>,
): number {
  let count = 0;
  for (const group of groups) {
    if (group.some((hash) => ownedItemHashes.has(hash))) count += 1;
  }
  return count;
}

function objectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean | null {
  if (!objectiveHash) return null;
  if (!instance) return null;
  const objective = instance.objectives?.find(
    (entry) => entry.objectiveHash === objectiveHash,
  );
  if (objective) {
    return (
      Boolean(objective.complete) ||
      objective.progress >= objective.completionValue
    );
  }
  if (isProfileRecordComplete(instance)) return true;
  return null;
}

function anyHashCompleted(
  hashes: string[],
  completions: Record<string, number>,
): boolean {
  return hashes.some((hash) => (completions[hash] ?? 0) > 0);
}

function huntDifficultySlotCount(hunts: ExpansionDifficultyHunt[]): number {
  return hunts.reduce(
    (sum, hunt) => sum + getHuntDifficultyTiers(hunt).length,
    0,
  );
}

export function getHuntDifficultyTiers(
  hunt: ExpansionDifficultyHunt,
): ExpansionHuntDifficultyTier[] {
  if (hunt.difficultyTiers?.length) {
    return hunt.difficultyTiers;
  }

  return [
    { label: "Adept", activityHashes: hunt.adeptActivityHashes },
    {
      label: "Hero",
      activityHashes: hunt.heroActivityHashes,
      higherRecordHash: hunt.higherRecordHash,
    },
    { label: "Legend", activityHashes: hunt.legendActivityHashes },
    { label: "Master", activityHashes: hunt.masterActivityHashes },
  ];
}

function isHuntTierComplete(
  tier: ExpansionHuntDifficultyTier,
  activityCompletions: Record<string, number>,
  instances: Record<string, RecordInstance>,
): boolean {
  if (anyHashCompleted(tier.activityHashes, activityCompletions)) {
    return true;
  }
  if (
    tier.higherRecordHash &&
    isProfileRecordComplete(instances[tier.higherRecordHash])
  ) {
    return true;
  }
  return false;
}

export function getCampaignTotal(inputs: ExpansionProgressInputs): number {
  const rotatingBossCount = inputs.rotatingBossActivity?.bosses.length ?? 0;
  const usesQuestsAndHunts =
    inputs.campaignQuests.length > 0 ||
    inputs.difficultyHunts.length > 0 ||
    rotatingBossCount > 0;

  if (usesQuestsAndHunts) {
    return (
      inputs.campaignQuests.length +
      huntDifficultySlotCount(inputs.difficultyHunts) +
      rotatingBossCount
    );
  }

  const showLegend = inputs.campaignMissions.some((mission) =>
    Boolean(mission.legendObjectiveHash),
  );
  return showLegend
    ? inputs.campaignMissions.length * 2
    : inputs.campaignMissions.length;
}

export function computeCampaignProgress(
  inputs: Pick<
    ExpansionProgressInputs,
    | "campaignMissions"
    | "campaignLegendaryRecordHash"
    | "campaignQuests"
    | "difficultyHunts"
    | "rotatingBossActivity"
  >,
  instances: Record<string, RecordInstance>,
  activityCompletions: Record<string, number>,
  completedQuestHashes: Record<string, boolean> = {},
  ownedItemHashes?: Set<string>,
): ExpansionCampaignProgress {
  const {
    campaignMissions,
    campaignLegendaryRecordHash,
    campaignQuests,
    difficultyHunts,
    rotatingBossActivity,
  } = inputs;

  const rotatingBosses = rotatingBossActivity?.bosses ?? [];
  const usesQuestsAndHunts =
    campaignQuests.length > 0 ||
    difficultyHunts.length > 0 ||
    rotatingBosses.length > 0;

  if (usesQuestsAndHunts) {
    let completed = 0;
    const questTotal = campaignQuests.length;
    for (const quest of campaignQuests) {
      if (
        isCampaignQuestComplete(
          quest,
          instances,
          completedQuestHashes,
          ownedItemHashes ?? undefined,
        )
      ) {
        completed += 1;
      }
    }

    const huntDiffTotal = huntDifficultySlotCount(difficultyHunts);
    for (const hunt of difficultyHunts) {
      for (const tier of getHuntDifficultyTiers(hunt)) {
        if (isHuntTierComplete(tier, activityCompletions, instances)) {
          completed += 1;
        }
      }
    }

    const bossTotal = rotatingBosses.length;
    if (ownedItemHashes) {
      for (const boss of rotatingBosses) {
        const hashes = boss.completionItemHashes?.length
          ? boss.completionItemHashes
          : boss.completionItemHash
            ? [boss.completionItemHash]
            : [];
        if (hashes.some((hash) => ownedItemHashes.has(hash))) {
          completed += 1;
        }
      }
    }

    const total = questTotal + huntDiffTotal + bossTotal;
    return {
      completed,
      total,
      label: `${completed}/${total}`,
    };
  }

  const legendInstance = instances[campaignLegendaryRecordHash];
  let normal = 0;
  let legend = 0;
  for (const mission of campaignMissions) {
    const legendDone = objectiveComplete(
      legendInstance,
      mission.legendObjectiveHash,
    );
    let normalDone: boolean | null = null;
    if (mission.normalRecordHash != null) {
      normalDone = isProfileRecordComplete(instances[mission.normalRecordHash]);
    }
    if (legendDone === true) normalDone = true;
    else if (mission.normalRecordHash == null) normalDone = legendDone;

    if (normalDone === true) normal += 1;
    if (legendDone === true) legend += 1;
  }

  const missionCount = campaignMissions.length;
  const showLegend = campaignMissions.some((mission) =>
    Boolean(mission.legendObjectiveHash),
  );

  return {
    completed: showLegend ? normal + legend : normal,
    total: showLegend ? missionCount * 2 : missionCount,
    label: showLegend
      ? `${normal}/${missionCount} N · ${legend}/${missionCount} L`
      : `${normal}/${missionCount}`,
  };
}

export function collectCampaignQuestHashes(
  quests: ExpansionCampaignQuest[],
): string[] {
  return [
    ...new Set(
      quests
        .map((quest) => quest.questHash)
        .filter((hash): hash is string => Boolean(hash)),
    ),
  ];
}

export function getCampaignQuestKey(quest: ExpansionCampaignQuest): string {
  if (quest.questHash) return quest.questHash;
  if (quest.recordHash && !quest.recordObjectiveHash) return quest.recordHash;
  return quest.name;
}

export function collectQuestCompletionTargets(
  quests: ExpansionCampaignQuest[],
): QuestCompletionTarget[] {
  return quests
    .map((quest) => {
      const questHash = quest.questHash ?? getCampaignQuestKey(quest);
      const hasQuestSteps = Boolean(quest.questHash && quest.completionStepHash);
      const hasRecordFallback = Boolean(
        quest.recordHash ||
          quest.fallbackRecordHashes?.length ||
          quest.completionItemHash ||
          quest.completionItemHashes?.length,
      );
      if (!hasQuestSteps && !hasRecordFallback) return null;

      return {
        questHash,
        completionStepHash: quest.completionStepHash ?? questHash,
        stepHashes: quest.questStepHashes,
        recordHash: quest.recordHash,
        recordObjectiveHash: quest.recordObjectiveHash,
        fallbackRecordHashes: quest.fallbackRecordHashes,
        fallbackRecordMatch: quest.fallbackRecordMatch,
        completionItemHash: quest.completionItemHash,
        completionItemHashes: quest.completionItemHashes,
        completionObjectiveHash: quest.completionObjectiveHash,
        stepObjectiveHashes: quest.stepObjectiveHashes,
      };
    })
    .filter((target) => target != null) as QuestCompletionTarget[];
}

function matchesFallbackRecords(
  quest: Pick<
    ExpansionCampaignQuest,
    "fallbackRecordHashes" | "fallbackRecordMatch"
  >,
  instances: Record<string, RecordInstance>,
): boolean {
  if (!quest.fallbackRecordHashes?.length) return false;
  const matchAny = quest.fallbackRecordMatch === "any";
  return matchAny
    ? quest.fallbackRecordHashes.some((hash) =>
        isQuestRecordComplete(instances[hash]),
      )
    : quest.fallbackRecordHashes.every((hash) =>
        isQuestRecordComplete(instances[hash]),
      );
}

function ownsCompletionItem(
  quest: Pick<
    ExpansionCampaignQuest,
    "completionItemHash" | "completionItemHashes"
  >,
  ownedItemHashes?: Set<string>,
): boolean {
  if (!ownedItemHashes?.size) return false;
  if (
    quest.completionItemHash &&
    ownedItemHashes.has(quest.completionItemHash)
  ) {
    return true;
  }
  return (
    quest.completionItemHashes?.some((hash) => ownedItemHashes.has(hash)) ??
    false
  );
}

function isQuestRecordComplete(
  instance: RecordInstance | undefined,
): boolean {
  return isProfileRecordComplete(instance);
}

function isQuestRecordObjectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean {
  if (!instance) return false;
  const objective = instance.objectives?.find(
    (entry) => entry.objectiveHash === objectiveHash,
  );
  if (!objective) return false;
  return (
    Boolean(objective.complete) ||
    objective.progress >= objective.completionValue
  );
}

export function isCampaignQuestComplete(
  quest: ExpansionCampaignQuest,
  instances: Record<string, RecordInstance>,
  completedQuestHashes: Record<string, boolean>,
  ownedItemHashes?: Set<string>,
): boolean {
  if (quest.recordHash && quest.recordObjectiveHash) {
    if (
      isQuestRecordObjectiveComplete(
        instances[quest.recordHash],
        quest.recordObjectiveHash,
      )
    ) {
      return true;
    }
  } else if (quest.recordHash && isQuestRecordComplete(instances[quest.recordHash])) {
    return true;
  }

  if (matchesFallbackRecords(quest, instances)) {
    return true;
  }

  if (ownsCompletionItem(quest, ownedItemHashes)) {
    return true;
  }

  const questKey = quest.questHash ?? getCampaignQuestKey(quest);
  if (completedQuestHashes[questKey] === true) {
    return true;
  }
  return false;
}

export function collectDifficultyHuntActivityHashes(
  hunts: ExpansionDifficultyHunt[],
): string[] {
  return [
    ...new Set(
      hunts.flatMap((hunt) =>
        getHuntDifficultyTiers(hunt).flatMap((tier) => tier.activityHashes),
      ),
    ),
  ];
}

type ComputeOverallProgressOptions = {
  ownedItemHashes: Set<string> | null;
  instances: Record<string, RecordInstance>;
  activityCompletions: Record<string, number>;
  completedQuestHashes: Record<string, boolean>;
  signedIn: boolean;
};

export function computeExpansionOverallProgress(
  inputs: ExpansionProgressInputs,
  {
    ownedItemHashes,
    instances,
    activityCompletions,
    completedQuestHashes,
    signedIn,
  }: ComputeOverallProgressOptions,
): ExpansionOverallProgress {
  if (!signedIn || ownedItemHashes == null) {
    const total =
      inputs.collectionTotal +
      (inputs.title?.records.length ?? 0) +
      getCampaignTotal(inputs) +
      inputs.lootTotal;
    return { completed: 0, total, progress: null, percent: null };
  }

  const collectionOwned = countOwnedGroups(
    inputs.collectionOwnershipGroups,
    ownedItemHashes,
  );
  const lootOwned = countOwnedGroups(
    inputs.lootOwnershipGroups,
    ownedItemHashes,
  );

  const titleProgress = inputs.title
    ? countTitleProgress(
        inputs.title,
        new Map(Object.entries(instances)),
      ).all
    : { completed: 0, total: 0 };

  const campaignProgress = computeCampaignProgress(
    inputs,
    instances,
    activityCompletions,
    completedQuestHashes,
    ownedItemHashes ?? undefined,
  );

  const completed =
    collectionOwned +
    titleProgress.completed +
    campaignProgress.completed +
    lootOwned;
  const total =
    inputs.collectionTotal +
    titleProgress.total +
    campaignProgress.total +
    inputs.lootTotal;

  if (total === 0) {
    return { completed: 0, total: 0, progress: null, percent: null };
  }

  const progress = completed / total;
  return {
    completed,
    total,
    progress,
    percent: Math.round(progress * 100),
  };
}
