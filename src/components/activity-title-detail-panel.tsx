"use client";

import { useMemo } from "react";
import {
  useProfileRaidCompletions,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { isRaidCompletionSlug } from "@/lib/destiny-activity-stats";
import { useSignedIn } from "@/lib/use-signed-in";
import {
  countTitleProgress,
  countTriumphProgress,
  getTitleCompletionTier,
} from "@/lib/triumphs/record-progress";
import type { TitleEntry, TriumphRecord } from "@/types/triumph";

type ActivityTitleDetailPanelProps = {
  slug: string;
  title: TitleEntry | null;
  triumphRecords: TriumphRecord[];
  name: string;
  guardianTitle: string | null;
  description: string;
  iconPath: string;
  showMasterCompletions: boolean;
  completionsLabel?: string;
};

export function ActivityTitleDetailPanel({
  slug,
  title,
  triumphRecords,
  name,
  guardianTitle,
  description,
  iconPath,
  showMasterCompletions,
  completionsLabel,
}: ActivityTitleDetailPanelProps) {
  const signedIn = useSignedIn();
  const hydratedInstances = useProfileRecordInstances();
  const raidCompletionsBySlug = useProfileRaidCompletions();

  const instanceMap = useMemo(
    () => new Map(Object.entries(signedIn ? hydratedInstances : {})),
    [hydratedInstances, signedIn],
  );

  const titleProgress = useMemo(() => {
    if (title) {
      return countTitleProgress(
        { ...title, records: triumphRecords },
        instanceMap,
      );
    }
    const progress = countTriumphProgress(triumphRecords, instanceMap);
    return {
      base: progress,
      gilding: { completed: 0, total: 0 },
      all: progress,
    };
  }, [instanceMap, title, triumphRecords]);

  const titleTier = useMemo(() => {
    if (!title || !signedIn) return "none" as const;
    return getTitleCompletionTier(
      { ...title, records: triumphRecords },
      instanceMap,
    );
  }, [instanceMap, signedIn, title, triumphRecords]);

  const raidCompletions = useMemo(() => {
    if (!isRaidCompletionSlug(slug)) return undefined;
    if (!signedIn) return undefined;
    return raidCompletionsBySlug[slug] ?? null;
  }, [raidCompletionsBySlug, signedIn, slug]);

  return (
    <TitleDetailPanel
      name={name}
      guardianTitle={guardianTitle}
      description={description}
      iconPath={iconPath}
      baseProgress={titleProgress.base}
      overallProgress={titleProgress.all}
      hasGilding={false}
      titleTier={titleTier}
      appearance="raid"
      raidCompletions={raidCompletions}
      showMasterCompletions={showMasterCompletions}
      completionsLabel={completionsLabel}
    />
  );
}
