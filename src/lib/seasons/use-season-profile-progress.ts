"use client";

import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  computeSeasonOverallProgress,
  type SeasonOverallProgress,
  type SeasonProgressInputs,
} from "@/lib/seasons/season-progress";

export function useSeasonProfileProgress(
  progressInputs: readonly SeasonProgressInputs[],
): Map<string, SeasonOverallProgress> {
  const signedIn = useSignedIn();
  const { ownedItemHashes } = useOwnership();

  return useMemo(() => {
    const map = new Map<string, SeasonOverallProgress>();
    const ownership = signedIn ? ownedItemHashes : null;

    for (const inputs of progressInputs) {
      map.set(
        inputs.slug,
        computeSeasonOverallProgress(inputs, ownership, signedIn),
      );
    }

    return map;
  }, [ownedItemHashes, progressInputs, signedIn]);
}
