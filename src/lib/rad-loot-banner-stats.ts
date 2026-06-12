import type { BungieUserSession } from "@/lib/bungie";
import {
  fetchAllActivityCompletions,
  isRaidCompletionSlug,
  type RaidCompletions,
} from "@/lib/destiny-activity-stats";
import { fetchRecordInstances } from "@/lib/destiny-records";
import {
  getActivityBannerMeta,
  getStaticActivityBannerMeta,
} from "@/lib/rad-loot-banner-meta";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";
import type { ActivityEntry } from "@/types/activity-loot";
import type { RecordInstance } from "@/types/triumph";

export type ActivityBannerStats = {
  iconPath: string | null;
  /** null when signed out or the activity has no title seal. */
  titleEarned: boolean | null;
  /** null when signed out. */
  totalCompletions: number | null;
};

function buildIconOnlyStats(
  entries: ActivityEntry[],
): Record<string, ActivityBannerStats> {
  const stats: Record<string, ActivityBannerStats> = {};

  for (const entry of entries) {
    const meta = getStaticActivityBannerMeta(entry.slug);
    stats[entry.slug] = {
      iconPath: meta?.iconPath ?? null,
      titleEarned: null,
      totalCompletions: null,
    };
  }

  return stats;
}

export function buildInitialActivityBannerStats(
  entries: ActivityEntry[],
): Record<string, ActivityBannerStats> {
  return buildIconOnlyStats(entries);
}

export async function loadSignedInActivityBannerStats(
  entries: ActivityEntry[],
  session: BungieUserSession,
): Promise<Record<string, ActivityBannerStats>> {
  const stats = buildIconOnlyStats(entries);

  let completionsBySlug: Partial<Record<string, RaidCompletions>> = {};
  let recordInstances = new Map<string, RecordInstance>();

  try {
    const [completions, profileData] = await Promise.all([
      fetchAllActivityCompletions(session),
      fetchRecordInstances(session),
    ]);
    completionsBySlug = completions;
    recordInstances = profileData.instances;
  } catch {
    return stats;
  }

  for (const entry of entries) {
    const meta = getStaticActivityBannerMeta(entry.slug);
    const completionRecordHash = meta?.completionRecordHash ?? null;

    let titleEarned: boolean | null = null;
    if (completionRecordHash) {
      titleEarned = isRecordRedeemed(
        recordInstances.get(completionRecordHash)?.state,
      );
    }

    let totalCompletions: number | null = null;
    if (isRaidCompletionSlug(entry.slug)) {
      const completions = completionsBySlug[entry.slug];
      if (completions) {
        totalCompletions = completions.normal + completions.master;
      }
    }

    stats[entry.slug] = {
      iconPath: meta?.iconPath ?? null,
      titleEarned,
      totalCompletions,
    };
  }

  return stats;
}

/** @deprecated Prefer buildInitialActivityBannerStats + loadSignedInActivityBannerStats */
export async function loadActivityBannerStats(
  entries: ActivityEntry[],
  session: BungieUserSession | null,
): Promise<Record<string, ActivityBannerStats>> {
  if (!session) {
    return buildInitialActivityBannerStats(entries);
  }

  return loadSignedInActivityBannerStats(entries, session);
}
