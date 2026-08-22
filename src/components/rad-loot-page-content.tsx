"use client";

import { useMemo } from "react";
import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import {
  useProfileRaidCompletions,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import {
  buildSignedInActivityBannerStatsFromProfile,
} from "@/lib/rad-loot/banner-stats-from-profile";
import type { ActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import { useSignedIn } from "@/lib/use-signed-in";
import type { ActivityEntry } from "@/types/activity-loot";

const ALL_ENTRIES = [
  PANTHEON,
  ...RAIDS,
  ...DUNGEONS,
  ...LEGACY_RAIDS,
  ...RAID_LAIRS,
];

type RadLootPageContentProps = {
  signedIn?: boolean;
  initialBannerStats: Record<string, ActivityBannerStats>;
  featuredSlugs: string[];
  featuredIconPath: string;
};

function ActivityBannerList({
  entries,
  bannerStats,
  featuredSlugs,
  featuredIconPath,
}: {
  entries: ActivityEntry[];
  bannerStats: Record<string, ActivityBannerStats>;
  featuredSlugs: Set<string>;
  featuredIconPath: string;
}) {
  return (
    <div className="w-full space-y-2">
      {entries.map((entry) => {
        const stats = bannerStats[entry.slug];
        return (
          <ActivityBannerSmall
            key={entry.slug}
            entry={entry}
            iconPath={stats?.iconPath}
            titleEarned={stats?.titleEarned}
            totalCompletions={stats?.totalCompletions}
            featured={featuredSlugs.has(entry.slug)}
            featuredIconPath={featuredIconPath}
          />
        );
      })}
    </div>
  );
}

export function RadLootPageContent({
  signedIn: signedInProp,
  initialBannerStats,
  featuredSlugs,
  featuredIconPath,
}: RadLootPageContentProps) {
  const signedInHook = useSignedIn();
  const signedIn = signedInProp ?? signedInHook;
  const raidCompletionsBySlug = useProfileRaidCompletions();
  const recordInstances = useProfileRecordInstances();
  const featuredSlugSet = new Set(featuredSlugs);

  const bannerStats = useMemo(() => {
    if (!signedIn) return initialBannerStats;
    return buildSignedInActivityBannerStatsFromProfile(
      ALL_ENTRIES,
      raidCompletionsBySlug,
      recordInstances,
    );
  }, [initialBannerStats, raidCompletionsBySlug, recordInstances, signedIn]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
      <section className="order-1 w-full min-w-0 md:col-span-2 md:row-start-1">
        <ActivityBannerSmall
          entry={PANTHEON}
          iconPath={bannerStats[PANTHEON.slug]?.iconPath}
          titleEarned={bannerStats[PANTHEON.slug]?.titleEarned}
          totalCompletions={bannerStats[PANTHEON.slug]?.totalCompletions}
          featured={featuredSlugSet.has(PANTHEON.slug)}
          featuredIconPath={featuredIconPath}
        />
      </section>

      <section className="order-2 w-full min-w-0 md:col-start-1 md:row-start-2">
        <ActivitySectionHeader>Raids</ActivitySectionHeader>
        <ActivityBannerList
          entries={RAIDS}
          bannerStats={bannerStats}
          featuredSlugs={featuredSlugSet}
          featuredIconPath={featuredIconPath}
        />
      </section>

      <section className="order-3 w-full min-w-0 md:col-start-2 md:row-start-2">
        <ActivitySectionHeader>Dungeons</ActivitySectionHeader>
        <ActivityBannerList
          entries={DUNGEONS}
          bannerStats={bannerStats}
          featuredSlugs={featuredSlugSet}
          featuredIconPath={featuredIconPath}
        />
      </section>

      <section className="order-4 w-full min-w-0 md:col-start-1 md:row-start-3">
        <ActivitySectionHeader>Legacy Raids</ActivitySectionHeader>
        <ActivityBannerList
          entries={LEGACY_RAIDS}
          bannerStats={bannerStats}
          featuredSlugs={featuredSlugSet}
          featuredIconPath={featuredIconPath}
        />
      </section>

      <section className="order-5 w-full min-w-0 md:col-start-2 md:row-start-3">
        <ActivitySectionHeader>Raid Lairs</ActivitySectionHeader>
        <ActivityBannerList
          entries={RAID_LAIRS}
          bannerStats={bannerStats}
          featuredSlugs={featuredSlugSet}
          featuredIconPath={featuredIconPath}
        />
      </section>
    </div>
  );
}
