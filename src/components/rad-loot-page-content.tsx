"use client";

import { useEffect, useState } from "react";
import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import type { ActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import type { ActivityEntry } from "@/types/activity-loot";

type RadLootPageContentProps = {
  signedIn: boolean;
  initialBannerStats: Record<string, ActivityBannerStats>;
};

function ActivityBannerList({
  entries,
  bannerStats,
}: {
  entries: ActivityEntry[];
  bannerStats: Record<string, ActivityBannerStats>;
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
          />
        );
      })}
    </div>
  );
}

export function RadLootPageContent({
  signedIn,
  initialBannerStats,
}: RadLootPageContentProps) {
  const [bannerStats, setBannerStats] = useState(initialBannerStats);

  useEffect(() => {
    if (!signedIn) return;

    let cancelled = false;

    fetch("/api/rad-loot/banner-stats", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          bannerStats: Record<string, ActivityBannerStats> | null;
          error: string | null;
        };
        if (cancelled || !payload.bannerStats) return;
        setBannerStats(payload.bannerStats);
      })
      .catch(() => {
        // Keep icon-only stats from the server shell.
      });

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:grid-rows-[auto_auto]">
      <section className="order-1 w-full min-w-0 md:order-none md:col-start-1 md:row-start-1">
        <ActivitySectionHeader>Raids</ActivitySectionHeader>
        <ActivityBannerList entries={RAIDS} bannerStats={bannerStats} />
      </section>

      <section className="order-2 w-full min-w-0 md:order-none md:col-start-2 md:row-start-1">
        <ActivitySectionHeader>Dungeons</ActivitySectionHeader>
        <ActivityBannerList entries={DUNGEONS} bannerStats={bannerStats} />
      </section>

      <section className="order-3 w-full min-w-0 md:order-none md:col-start-1 md:row-start-2">
        <ActivitySectionHeader>Legacy Raids</ActivitySectionHeader>
        <ActivityBannerList entries={LEGACY_RAIDS} bannerStats={bannerStats} />
      </section>

      <section className="order-4 w-full min-w-0 md:order-none md:col-start-2 md:row-start-2">
        <ActivitySectionHeader>Raid Lairs</ActivitySectionHeader>
        <ActivityBannerList entries={RAID_LAIRS} bannerStats={bannerStats} />
      </section>
    </div>
  );
}
