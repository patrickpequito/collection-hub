import { ACTIVITY_BANNER_META } from "@/data/rad-loot/activity-banner-meta";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";
import type { ActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import type { RaidCompletions } from "@/lib/destiny-activity-stats";
import type { ActivityEntry } from "@/types/activity-loot";
import type { RecordInstance } from "@/types/triumph";

function buildIconOnlyStats(
  entries: ActivityEntry[],
): Record<string, ActivityBannerStats> {
  const stats: Record<string, ActivityBannerStats> = {};

  for (const entry of entries) {
    const meta = ACTIVITY_BANNER_META[entry.slug];
    stats[entry.slug] = {
      iconPath: meta?.iconPath ?? null,
      titleEarned: null,
      totalCompletions: null,
    };
  }

  return stats;
}

/** Signed-in banner stats from cached profile data (client-safe, no Bungie fetch). */
export function buildSignedInActivityBannerStatsFromProfile(
  entries: ActivityEntry[],
  raidCompletionsBySlug: Partial<Record<string, RaidCompletions>>,
  recordInstances: Record<string, RecordInstance>,
): Record<string, ActivityBannerStats> {
  const stats = buildIconOnlyStats(entries);

  for (const entry of entries) {
    const meta = ACTIVITY_BANNER_META[entry.slug];
    const completionRecordHash = meta?.completionRecordHash ?? null;

    let titleEarned: boolean | null = null;
    if (completionRecordHash) {
      titleEarned = isRecordRedeemed(
        recordInstances[completionRecordHash]?.state,
      );
    }

    let totalCompletions: number | null = null;
    const completions = raidCompletionsBySlug[entry.slug];
    if (completions) {
      totalCompletions = completions.normal + completions.master;
    }

    stats[entry.slug] = {
      iconPath: meta?.iconPath ?? null,
      titleEarned,
      totalCompletions,
    };
  }

  return stats;
}
