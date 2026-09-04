import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { ExpansionActivityShortcuts } from "@/components/expansions/expansion-activity-shortcuts";
import { ExpansionCampaignMissionsPanel } from "@/components/expansions/expansion-campaign-missions-panel";
import { ExpansionCollectionPanel } from "@/components/expansions/expansion-collection-panel";
import { ExpansionDeepLootSection } from "@/components/expansions/expansion-deep-loot-section";
import { ExpansionDestinationPanel } from "@/components/expansions/expansion-destination-panel";
import { ExpansionLootPanel } from "@/components/expansions/expansion-loot-panel";
import { ExpansionNavBar } from "@/components/expansions/expansion-nav-bar";
import { ExpansionProgressStrip } from "@/components/expansions/expansion-progress-strip";
import { ExpansionTrailerSection } from "@/components/expansions/expansion-trailer-section";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getExpansionHub,
  getExpansionSlugs,
  PUBLISHED_EXPANSION_SLUGS,
} from "@/data/expansions";
import { localSeasonIconPathFromSlug } from "@/lib/all-loot/season-icon-path";
import { expansionHeaderUrl } from "@/lib/page-headers";
import {
  getExpansionNavAdjacent,
  getExpansionNavEntries,
  getExpansionSeasonBanners,
} from "@/lib/expansions/expansion-nav";
import { resolveExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  getTitleEntry,
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";

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

  const [loot, catalog, itemHrefs] = await Promise.all([
    resolveExpansionLoot(hub),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/expansions/${hub.slug}`),
  ]);

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
  const expansionNavEntries = getExpansionNavEntries();
  const seasonBanners = getExpansionSeasonBanners(hub.slug);

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={expansionHeaderUrl(hub.slug)}
      titleIconUrl={localSeasonIconPathFromSlug(hub.slug)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/expansions", label: "← Expansions & Seasons" }}
    >
      <ClientOwnership>
        <div className="space-y-8">
          <ExpansionNavBar
            currentSlug={hub.slug}
            currentTitle={hub.title}
            previous={previous}
            next={next}
            entries={expansionNavEntries}
          />

          {hub.trailerYoutubeId ? (
            <ExpansionTrailerSection
              youtubeId={hub.trailerYoutubeId}
              seasons={seasonBanners}
            />
          ) : null}

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

          <ExpansionCollectionPanel
            badgeName={loot.collectionMeta.badgeName}
            iconPath={loot.collectionMeta.iconPath}
            bannerIconPath={loot.collectionMeta.bannerIconPath}
            items={loot.collectionItems}
            itemHrefs={itemHrefs}
          />

          <ExpansionLootPanel
            title="Exotic weapons & armor"
            description={hub.exoticPanelDescription}
            items={loot.exoticItems}
            ownedBorder="green"
            itemHrefs={itemHrefs}
          />

          <ExpansionCampaignMissionsPanel
            missions={loot.campaignMissions}
            legendaryRecordHash={loot.campaignLegendaryRecordHash}
            quests={loot.campaignQuests}
            difficultyHunts={loot.difficultyHunts}
            difficultyHuntsTitle={loot.difficultyHuntsTitle}
            sectionTitleOverride={loot.campaignSectionTitle}
            rotatingBossActivity={loot.rotatingBossActivity}
          />

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
            lostSectorsDiscoveryRecordHash={
              loot.lostSectorsDiscoveryRecordHash
            }
            lostSectors={loot.lostSectors}
            featuredLostSectorName={null}
            wellspringNormalRecordHash={loot.wellspringNormalRecordHash}
            wellspringMasterRecordHash={loot.wellspringMasterRecordHash}
            wellspringBosses={loot.wellspringBosses}
          />

          <ExpansionActivityShortcuts
            slugs={hub.relatedRadSlugs}
            blurb={hub.raidsDungeonsBlurb}
          />

          <ExpansionTriumphsPanel
            title={title}
            triumphGroup={triumphGroup ?? null}
            triumphsGroupTitle={hub.triumphsGroupTitle}
          />

          <ExpansionDeepLootSection
            pools={loot.deepLootPools}
            itemHrefs={itemHrefs}
            emptyDescription={hub.deepLootEmptyDescription}
          />
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
