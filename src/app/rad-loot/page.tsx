import { RadLootPageContent } from "@/components/rad-loot-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { buildInitialActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import { getSession } from "@/lib/session";

export default async function RadLootPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const allEntries = [...RAIDS, ...DUNGEONS, ...LEGACY_RAIDS, ...RAID_LAIRS];
  const initialBannerStats = buildInitialActivityBannerStats(allEntries);

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

      <RadLootPageContent
        signedIn={Boolean(session)}
        initialBannerStats={initialBannerStats}
      />
    </SectionPageLayout>
  );
}
