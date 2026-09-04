import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { ExpansionLootPanel } from "@/components/expansions/expansion-loot-panel";
import { SeasonLootSection } from "@/components/seasons/season-loot-section";
import { SeasonNavBar } from "@/components/seasons/season-nav-bar";
import { SeasonPlayableActivities } from "@/components/seasons/season-playable-activities";
import { SeasonProgressStrip } from "@/components/seasons/season-progress-strip";
import { SeasonTrailerSection } from "@/components/seasons/season-trailer-section";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getSeasonHub,
  getSeasonSlugs,
  PUBLISHED_SEASON_SLUGS,
} from "@/data/seasons";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { localSeasonIconPath } from "@/lib/all-loot/season-icon-path";
import { isBungieOAuthConfigured } from "@/lib/env";
import { seasonHeaderUrl } from "@/lib/page-headers";
import {
  getSeasonNavAdjacent,
  getSeasonNavGroups,
} from "@/lib/seasons/season-nav";
import { resolveSeasonLoot } from "@/lib/seasons/resolve-season-loot";

export const revalidate = 3600;

type SeasonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getSeasonSlugs()
    .filter((slug) => PUBLISHED_SEASON_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

export default async function SeasonHubPage({ params }: SeasonPageProps) {
  const { slug } = await params;
  const hub = getSeasonHub(slug);
  if (!hub || !PUBLISHED_SEASON_SLUGS.has(hub.slug)) notFound();

  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, itemHrefs] = await Promise.all([
    resolveSeasonLoot(hub),
    buildCollectibleHrefByItemHash(`/seasons/${hub.slug}`),
  ]);

  const trailerVideo = hub.videos.find((video) => video.id === "trailer");
  const cutsceneVideo = hub.videos.find(
    (video) => video.id === "cutscene-archive",
  );
  const { previous, next } = getSeasonNavAdjacent(hub.slug);
  const seasonNavGroups = getSeasonNavGroups();

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={seasonHeaderUrl(hub.slug)}
      titleIconUrl={localSeasonIconPath(hub.seasonLabel)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/expansions", label: "← Expansions & Seasons" }}
    >
      <ClientOwnership>
        <div className="space-y-8">
          <SeasonNavBar
            currentSlug={hub.slug}
            currentTitle={hub.title}
            previous={previous}
            next={next}
            groups={seasonNavGroups}
          />

          {trailerVideo ? (
            <SeasonTrailerSection
              youtubeId={trailerVideo.youtubeId}
              titleIconPath={hub.titleIconPath}
            />
          ) : null}

          <SeasonProgressStrip
            total={loot.progressTotal}
            ownershipGroups={loot.progressOwnershipGroups}
          />

          <SeasonLootSection
            armorGroups={loot.armorGroups}
            weaponPools={loot.weaponPools}
            itemHrefs={itemHrefs}
          />

          <ExpansionLootPanel
            title="Exotic loot"
            description={hub.exoticPanelDescription}
            items={loot.exoticItems}
            ownedBorder="green"
            itemHrefs={itemHrefs}
          />

          <ExpansionLootPanel
            title="Cosmetic rewards"
            description={
              hub.cosmeticPanelDescription ??
              "Season Pass cosmetics reclaimable from the Season Archive in the Tower."
            }
            items={loot.cosmeticItems}
            itemHrefs={itemHrefs}
          />

          <SeasonPlayableActivities activities={hub.playableActivities} />

          {cutsceneVideo ? (
            <section className="min-w-0 space-y-3">
              <h2 className="text-lg font-semibold text-zinc-100">
                Cutscene archive
              </h2>
              <div className="max-w-xl">
                <YouTubeEmbed
                  youtubeId={cutsceneVideo.youtubeId}
                  title={cutsceneVideo.label}
                />
              </div>
            </section>
          ) : null}
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
