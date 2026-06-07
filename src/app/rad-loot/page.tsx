import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import {
  loadActivityBannerStats,
  type ActivityBannerStats,
} from "@/lib/rad-loot-banner-stats";
import { getSession } from "@/lib/session";
import type { ActivityEntry } from "@/types/activity-loot";

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

export default async function RadLootPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const allEntries = [...RAIDS, ...DUNGEONS, ...LEGACY_RAIDS, ...RAID_LAIRS];
  const bannerStats = await loadActivityBannerStats(allEntries, session);

  return (
    <SectionPageLayout
      title="RAD Loot"
      imageUrl={PAGE_HEADERS.radLoot}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <p className="text-sm text-zinc-400">
        Raid and dungeon loot by activity.
      </p>

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
          <ActivityBannerList
            entries={LEGACY_RAIDS}
            bannerStats={bannerStats}
          />
        </section>

        <section className="order-4 w-full min-w-0 md:order-none md:col-start-2 md:row-start-2">
          <ActivitySectionHeader>Raid Lairs</ActivitySectionHeader>
          <ActivityBannerList entries={RAID_LAIRS} bannerStats={bannerStats} />
        </section>
      </div>
    </SectionPageLayout>
  );
}
