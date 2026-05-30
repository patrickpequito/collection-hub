import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { SectionPageLayout } from "@/components/section-page-layout";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function RadLootPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

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

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Raids
          </h2>
          <div className="space-y-2">
            {RAIDS.map((entry) => (
              <ActivityBannerSmall key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Dungeons
          </h2>
          <div className="space-y-2">
            {DUNGEONS.map((entry) => (
              <ActivityBannerSmall key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </SectionPageLayout>
  );
}
