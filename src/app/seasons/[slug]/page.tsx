import type { Metadata } from "next";
import { NOT_FOUND_METADATA, pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { EververseSection } from "@/components/eververse-section";
import { ExpansionLootPanel } from "@/components/expansions/expansion-loot-panel";
import {
  SeasonArmorSection,
  SeasonWeaponsSection,
} from "@/components/seasons/season-loot-section";
import { SeasonPlayableActivities } from "@/components/seasons/season-playable-activities";
import { SeasonProgressStrip } from "@/components/seasons/season-progress-strip";
import { SeasonTrailerSection } from "@/components/seasons/season-trailer-section";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import { SectionJumpNav, SectionHeading } from "@/components/detail-page-parts";
import { loadAvailableActivityHashes } from "@/lib/seasons/available-activities";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getSeasonHub,
  getSeasonSlugs,
  PUBLISHED_SEASON_SLUGS,
} from "@/data/seasons";
import { getExpansionHub, PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { localSeasonIconPath } from "@/lib/all-loot/season-icon-path";
import { isBungieOAuthConfigured } from "@/lib/env";
import { seasonHeaderUrl } from "@/lib/page-headers";
import { getSeasonNavAdjacent } from "@/lib/seasons/season-nav";
import { findTimelineEntry, formatTimelineMonth } from "@/lib/home/timeline";
import { resolveSeasonLoot } from "@/lib/seasons/resolve-season-loot";
import { pickReferenced } from "@/lib/pick-referenced";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hub = getSeasonHub(slug);
  if (!hub || !PUBLISHED_SEASON_SLUGS.has(hub.slug)) return NOT_FOUND_METADATA;
  return pageMetadata(
    `/seasons/${slug}`,
    `${hub.title} · Destiny 2 ${hub.isUpdate ? "update" : "season"} loot`,
    hub.isUpdate
      ? `Everything from Destiny 2's ${hub.title} update: weapons, armor, exotics, cosmetics and activities.`
      : `Everything from Destiny 2's ${hub.title}: season pass, weapons, armor, exotics, activities and Eververse.`,
  );
}

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

  const [loot, allItemHrefs] = await Promise.all([
    resolveSeasonLoot(hub),
    buildCollectibleHrefByItemHash(`/seasons/${hub.slug}`),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [loot]);

  const trailerVideo = hub.videos.find((video) => video.id === "trailer");
  const cutsceneVideo = hub.videos.find(
    (video) => video.id === "cutscene-archive",
  );
  const { previous, next } = getSeasonNavAdjacent(hub.slug);
  const parentExpansion = getExpansionHub(hub.parentExpansionSlug);
  const timeline = findTimelineEntry(hub.slug);
  const parentTimeline = parentExpansion ? findTimelineEntry(parentExpansion.slug) : null;
  const eyebrow = [
    hub.isUpdate ? "Update" : `Season ${hub.seasonNumber}`,
    timeline?.year.label,
    parentExpansion?.title,
  ]
    .filter(Boolean)
    .join(" · ");
  const ownershipGroups = (items: { itemHash: string; ownershipHashes?: string[] }[]) =>
    items.map((item) => item.ownershipHashes ?? [item.itemHash]);

  const sectionLinks = [
    { id: "overview", label: "Overview", show: true },
    { id: "armor", label: "Armor", show: loot.armorGroups.length > 0 },
    { id: "weapons", label: "Weapons", show: loot.weaponPools.length > 0 },
    { id: "exotics", label: "Exotics", show: loot.exoticItems.length > 0 },
    { id: "cosmetics", label: "Cosmetics", show: loot.cosmeticItems.length > 0 },
    { id: "activities", label: "Activities", show: hub.playableActivities.length > 0 },
    { id: "eververse", label: "Eververse", show: Boolean(loot.eververse) },
  ].filter((link) => link.show);

  // Rotating activities (e.g. expeditions): mark this week's pick; none when Bungie doesn't say.
  const rotating = hub.playableActivities.filter((activity) => activity.rotationActivityHashes?.length);
  const available = rotating.length ? await loadAvailableActivityHashes() : new Set<string>();
  const activeActivityIds = rotating
    .filter((activity) => activity.rotationActivityHashes!.some((hash) => available.has(hash)))
    .map((activity) => activity.id);

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={seasonHeaderUrl(hub.slug)}
      titleIconUrl={localSeasonIconPath(hub.seasonLabel)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/expansions", label: "← Expansions & Seasons" }}
      headerEyebrow={eyebrow}
      siblings={{
        previous: previous ? { href: previous.href, label: previous.title } : undefined,
        next: next ? { href: next.href, label: next.title } : undefined,
      }}
      breadcrumbs={
        parentExpansion
          ? [
              {
                label: parentExpansion.title,
                href: PUBLISHED_EXPANSION_SLUGS.has(parentExpansion.slug)
                  ? `/expansions/${parentExpansion.slug}`
                  : undefined,
              },
            ]
          : undefined
      }
    >
      <ClientOwnership>
        <div className="space-y-9">
          <SeasonProgressStrip
            total={loot.progressTotal}
            ownershipGroups={loot.progressOwnershipGroups}
            exoticOwnershipGroups={ownershipGroups(loot.exoticItems)}
            cosmeticOwnershipGroups={ownershipGroups(loot.cosmeticItems)}
            isUpdate={hub.isUpdate}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="overview" className="scroll-mt-20">
            <SeasonTrailerSection
              youtubeId={trailerVideo?.youtubeId}
              titleIconPath={hub.titleIconPath}
              parent={
                parentExpansion
                  ? {
                      title: parentExpansion.title,
                      tag: parentTimeline
                        ? `Expansion · ${formatTimelineMonth(parentTimeline.entry.date)}`
                        : "Expansion",
                      imageUrl: parentTimeline?.entry.imageUrl,
                      href: PUBLISHED_EXPANSION_SLUGS.has(parentExpansion.slug)
                        ? `/expansions/${parentExpansion.slug}`
                        : undefined,
                    }
                  : null
              }
              seal={hub.seal}
            />
          </div>

          <div id="armor" className="scroll-mt-20">
            <SeasonArmorSection armorGroups={loot.armorGroups} itemHrefs={itemHrefs} />
          </div>

          <div id="weapons" className="scroll-mt-20">
            <SeasonWeaponsSection weaponPools={loot.weaponPools} itemHrefs={itemHrefs} />
          </div>

          <div id="exotics" className="scroll-mt-20">
            <ExpansionLootPanel
              title="Exotic loot"
              items={loot.exoticItems}
              ownedBorder="green"
              itemHrefs={itemHrefs}
            />
          </div>

          <div id="cosmetics" className="scroll-mt-20">
            <ExpansionLootPanel
              title="Cosmetic rewards"
              items={loot.cosmeticItems}
              itemHrefs={itemHrefs}
            />
            {loot.seasonalRewardItems.length > 0 ? (
              <div className="mt-6">
                <ExpansionLootPanel
                  title="Seasonal rewards"
                  note="Not obtainable"
                  items={loot.seasonalRewardItems}
                  itemHrefs={itemHrefs}
                />
              </div>
            ) : null}
          </div>

          <div id="activities" className="scroll-mt-20">
            <SeasonPlayableActivities
              activities={hub.playableActivities}
              activeIds={activeActivityIds}
              isUpdate={hub.isUpdate}
            />
          </div>

          {loot.eververse ? (
            <div id="eververse" className="scroll-mt-20">
              <EververseSection eververse={loot.eververse} itemHrefs={itemHrefs} description={null} />
            </div>
          ) : null}

          {cutsceneVideo ? (
            <section className="min-w-0 space-y-3">
              <SectionHeading title="Cutscene archive" />
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
