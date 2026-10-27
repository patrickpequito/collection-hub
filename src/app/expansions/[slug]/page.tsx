import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { EververseSection } from "@/components/eververse-section";
import { ExpansionActivityShortcuts } from "@/components/expansions/expansion-activity-shortcuts";
import { ExpansionCampaignMissionsPanel } from "@/components/expansions/expansion-campaign-missions-panel";
import { ExpansionCollectionPanel } from "@/components/expansions/expansion-collection-panel";
import { ExpansionDeepLootSection } from "@/components/expansions/expansion-deep-loot-section";
import { ExpansionDestinationPanel } from "@/components/expansions/expansion-destination-panel";
import { ExpansionLootPanel } from "@/components/expansions/expansion-loot-panel";
import { ExpansionProgressStrip } from "@/components/expansions/expansion-progress-strip";
import { ExpansionTrailerSection } from "@/components/expansions/expansion-trailer-section";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import { SectionJumpNav } from "@/components/detail-page-parts";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getExpansionHub,
  getExpansionSlugs,
  PUBLISHED_EXPANSION_SLUGS,
} from "@/data/expansions";
import { localSeasonIconPathFromSlug } from "@/lib/all-loot/season-icon-path";
import { expansionHeaderUrl } from "@/lib/page-headers";
import { getExpansionNavAdjacent } from "@/lib/expansions/expansion-nav";
import { findTimelineEntry, formatTimelineMonth } from "@/lib/home/timeline";
import { buildSeasonProgressInputs } from "@/lib/seasons/build-season-progress-inputs";
import { PUBLISHED_SEASON_SLUGS } from "@/data/seasons";
import { resolveExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  getTitleEntry,
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import { pickReferenced } from "@/lib/pick-referenced";

export const revalidate = 3600;

type ExpansionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getExpansionSlugs()
    .filter((slug) => PUBLISHED_EXPANSION_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

export default async function ExpansionHubPage({ params }: ExpansionPageProps) {
  const { slug } = await params;
  const hub = getExpansionHub(slug);
  if (!hub || !PUBLISHED_EXPANSION_SLUGS.has(hub.slug)) notFound();

  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, allItemHrefs] = await Promise.all([
    resolveExpansionLoot(hub),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/expansions/${hub.slug}`),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [loot]);

  const title = hub.titleSlug
    ? (getTitleEntry(catalog, hub.titleSlug) ?? null)
    : null;
  if (hub.titleSlug && !title) {
    throw new Error(`Missing triumph title catalog entry: ${hub.titleSlug}`);
  }

  const triumphGroup = hub.triumphGroupSlug
    ? getTriumphGroup(catalog, hub.triumphGroupSlug)
    : null;
  if (hub.triumphGroupSlug && !triumphGroup) {
    throw new Error(`Missing triumph group: ${hub.triumphGroupSlug}`);
  }

  const collectionOwnershipGroups = loot.collectionItems.map(
    (item) => item.ownershipHashes ?? [item.itemHash],
  );

  const lootOwnershipGroups = [
    ...collectionOwnershipGroups,
    ...loot.exoticItems.map((item) => item.ownershipHashes ?? [item.itemHash]),
    ...loot.destinationWeapons.map(
      (item) => item.ownershipHashes ?? [item.itemHash],
    ),
    ...loot.deepLootPools.flatMap((pool) => [
      ...pool.armorGroups.flatMap((group) =>
        group.rows.flatMap((row) =>
          Object.values(row.pieces)
            .filter(Boolean)
            .map((piece) => piece!.ownershipHashes ?? [piece!.itemHash]),
        ),
      ),
      ...pool.weapons.map((item) => item.ownershipHashes ?? [item.itemHash]),
      ...pool.otherSections.flatMap((section) =>
        section.items.map((item) => item.ownershipHashes ?? [item.itemHash]),
      ),
    ]),
    ...loot.destinationArmorRows.flatMap((row) =>
      Object.values(row.pieces)
        .filter(Boolean)
        .map((piece) => piece!.ownershipHashes ?? [piece!.itemHash]),
    ),
  ];

  const { previous, next } = getExpansionNavAdjacent(hub.slug);
  const timeline = findTimelineEntry(hub.slug);
  const yearSeasons = timeline
    ? timeline.year.entries.filter((entry) => entry.kind === "season")
    : [];
  const seasonProgressInputs = await Promise.all(
    yearSeasons
      .filter((entry) => PUBLISHED_SEASON_SLUGS.has(entry.slug))
      .map((entry) => buildSeasonProgressInputs(entry.slug)),
  );
  const eyebrow = [
    "Expansion",
    timeline?.year.label,
    timeline ? formatTimelineMonth(timeline.entry.date) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasTriumphs = Boolean(title || triumphGroup);
  const hasActivities = hub.relatedRadSlugs.length > 0;
  const sectionLinks = [
    { id: "overview", label: "Overview", show: Boolean(hub.trailerYoutubeId) || yearSeasons.length > 0 },
    { id: "collection", label: "Collection", show: true },
    { id: "exotics", label: "Exotics", show: loot.exoticItems.length > 0 },
    { id: "destination", label: "Destination", show: true },
    { id: "campaign", label: "Campaign & Activities", show: true },
    { id: "eververse", label: "Eververse", show: Boolean(loot.eververse) },
    { id: "raids-dungeons", label: "Raids & dungeons", show: hasActivities },
    { id: "deep-loot", label: "Deep loot", show: true },
    { id: "triumphs", label: "Triumphs", show: hasTriumphs },
  ].filter((link) => link.show);

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={expansionHeaderUrl(hub.slug)}
      titleIconUrl={localSeasonIconPathFromSlug(hub.slug)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/expansions", label: "← Expansions & Seasons" }}
      headerEyebrow={eyebrow}
      siblings={{
        previous: previous ? { href: previous.href, label: previous.title } : undefined,
        next: next ? { href: next.href, label: next.title } : undefined,
      }}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <ExpansionProgressStrip
            collectionTotal={loot.collectionItems.length}
            collectionOwnershipGroups={collectionOwnershipGroups}
            title={title}
            campaignMissions={loot.campaignMissions}
            campaignLegendaryRecordHash={loot.campaignLegendaryRecordHash}
            campaignQuests={loot.campaignQuests}
            difficultyHunts={loot.difficultyHunts}
            rotatingBossActivity={loot.rotatingBossActivity}
            lootTotal={lootOwnershipGroups.length}
            lootOwnershipGroups={lootOwnershipGroups}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="overview" className="scroll-mt-20">
            <ExpansionTrailerSection
              youtubeId={hub.trailerYoutubeId}
              seasons={yearSeasons}
              seasonProgressInputs={seasonProgressInputs}
            />
          </div>

          <div id="collection" className="scroll-mt-20">
            <ExpansionCollectionPanel
              badgeName={loot.collectionMeta.badgeName}
              iconPath={loot.collectionMeta.iconPath}
              bannerIconPath={loot.collectionMeta.bannerIconPath}
              items={loot.collectionItems}
              itemHrefs={itemHrefs}
            />
          </div>

          <div id="exotics" className="scroll-mt-20">
            <ExpansionLootPanel
              title="Exotic weapons & armor"
              items={loot.exoticItems}
              ownedBorder="green"
              itemHrefs={itemHrefs}
            />
          </div>

          <div id="destination" className="scroll-mt-20">
            <ExpansionDestinationPanel
              destinationTitle={hub.destinationTitle}
              destinationActivityTitle={hub.destinationActivityTitle}
              destinationActivitySlug={hub.destinationActivitySlug}
              armorRows={loot.destinationArmorRows}
              weapons={loot.destinationWeapons}
              previewFiles={
                hub.destinationArmorPreviewFiles
                  ? [...hub.destinationArmorPreviewFiles]
                  : undefined
              }
              itemHrefs={itemHrefs}
              regionChestsChecklistHash={loot.regionChestsChecklistHash}
              regionChests={loot.regionChests}
              lostSectorsChecklistHash={loot.lostSectorsChecklistHash}
              lostSectorsDiscoveryRecordHash={loot.lostSectorsDiscoveryRecordHash}
              lostSectors={loot.lostSectors}
              featuredLostSectorName={null}
            />
          </div>

          <div id="campaign" className="scroll-mt-20">
            <ExpansionCampaignMissionsPanel
              missions={loot.campaignMissions}
              legendaryRecordHash={loot.campaignLegendaryRecordHash}
              quests={loot.campaignQuests}
              difficultyHunts={loot.difficultyHunts}
              difficultyHuntsTitle={loot.difficultyHuntsTitle}
              rotatingBossActivity={loot.rotatingBossActivity}
              wellspringNormalRecordHash={loot.wellspringNormalRecordHash}
              wellspringMasterRecordHash={loot.wellspringMasterRecordHash}
              wellspringBosses={loot.wellspringBosses}
            />
          </div>

          {loot.eververse ? (
            <div id="eververse" className="scroll-mt-20">
              <EververseSection
                eververse={loot.eververse}
                itemHrefs={itemHrefs}
                description={null}
              />
            </div>
          ) : null}

          {hasActivities ? (
            <div id="raids-dungeons" className="scroll-mt-20">
              <ExpansionActivityShortcuts
                slugs={hub.relatedRadSlugs}
              />
            </div>
          ) : null}

          <div id="deep-loot" className="scroll-mt-20">
            <ExpansionDeepLootSection
              pools={loot.deepLootPools}
              itemHrefs={itemHrefs}
              emptyDescription={hub.deepLootEmptyDescription}
            />
          </div>

          {hasTriumphs ? (
            <div id="triumphs" className="scroll-mt-20">
              <ExpansionTriumphsPanel
                title={title}
                triumphGroup={triumphGroup ?? null}
                triumphsGroupTitle={hub.triumphsGroupTitle}
              />
            </div>
          ) : null}

        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
