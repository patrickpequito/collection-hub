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
  computeExpansionOverallProgress,
  type ExpansionOverallProgress,
  type ExpansionProgressInputs,
} from "@/lib/expansions/expansion-progress";

export function useExpansionProfileProgress(
  progressInputs: readonly ExpansionProgressInputs[],
): Map<string, ExpansionOverallProgress> {
  const signedIn = useSignedIn();
  const { ownedItemHashes } = useOwnership();
  const instances = useProfileRecordInstances();

  const huntActivityHashes = useMemo(
    () =>
      collectDifficultyHuntActivityHashes(
        progressInputs.flatMap((inputs) => inputs.difficultyHunts),
      ),
    [progressInputs],
  );

  const campaignQuestTargets = useMemo(
    () =>
      collectQuestCompletionTargets(
        progressInputs.flatMap((inputs) => inputs.campaignQuests),
      ),
    [progressInputs],
  );

  const activityCompletions = useProfileActivityCompletions(huntActivityHashes);
  const completedQuestHashes = useProfileQuestCompletions(campaignQuestTargets);

  return useMemo(() => {
    const map = new Map<string, ExpansionOverallProgress>();
    const ownership = signedIn ? ownedItemHashes : null;

    for (const inputs of progressInputs) {
      map.set(
        inputs.slug,
        computeExpansionOverallProgress(inputs, {
          ownedItemHashes: ownership,
          instances: signedIn ? instances : {},
          activityCompletions: signedIn ? activityCompletions : {},
          completedQuestHashes: signedIn ? completedQuestHashes : {},
          signedIn,
        }),
      );
    }

    return map;
  }, [
    activityCompletions,
    completedQuestHashes,
    instances,
    ownedItemHashes,
    progressInputs,
    signedIn,
  ]);
}