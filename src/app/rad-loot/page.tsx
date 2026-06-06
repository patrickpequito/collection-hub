import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { ActivitySectionHeader } from "@/components/activity-section-header";
import { SectionPageLayout } from "@/components/section-page-layout";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { loadActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import { getSession } from "@/lib/session";

export default async function RadLootPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const allEntries = [...RAIDS, ...DUNGEONS];
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

      <div className="grid items-start gap-8 md:grid-cols-2">
        <section className="min-w-0 self-start">
          <ActivitySectionHeader>Raids</ActivitySectionHeader>
          <div className="space-y-2">
            {RAIDS.map((entry) => {
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
        </section>

        <section className="min-w-0 self-start">
          <ActivitySectionHeader>Dungeons</ActivitySectionHeader>
          <div className="space-y-2">
            {DUNGEONS.map((entry) => {
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
        </section>
      </div>
    </SectionPageLayout>
  );
}
