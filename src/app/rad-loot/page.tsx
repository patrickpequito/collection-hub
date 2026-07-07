import Image from "next/image";
import { RadLootPageContent } from "@/components/rad-loot-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { buildInitialActivityBannerStats } from "@/lib/rad-loot-banner-stats";
import {
  FEATURED_TIER_ICON_PATH,
  featuredActivitySlugs,
} from "@/lib/rad-loot/featured-activities";
import { getSession } from "@/lib/session";

export default async function RadLootPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const allEntries = [PANTHEON, ...RAIDS, ...DUNGEONS, ...LEGACY_RAIDS, ...RAID_LAIRS];
  const initialBannerStats = buildInitialActivityBannerStats(allEntries);
  const featuredSlugs = [...(await featuredActivitySlugs())];

  return (
    <SectionPageLayout
      title="RAD Loot"
      imageUrl={PAGE_HEADERS.radLoot}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <p className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Image
          src={FEATURED_TIER_ICON_PATH}
          alt=""
          width={14}
          height={14}
          className="shrink-0 object-contain"
          unoptimized
        />
        <span>This week&apos;s featured raids and dungeons</span>
      </p>

      <RadLootPageContent
        signedIn={Boolean(session)}
        initialBannerStats={initialBannerStats}
        featuredSlugs={featuredSlugs}
        featuredIconPath={FEATURED_TIER_ICON_PATH}
      />
    </SectionPageLayout>
  );
}
