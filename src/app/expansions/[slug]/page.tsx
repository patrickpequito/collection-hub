import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { ExpansionActivityShortcuts } from "@/components/expansions/expansion-activity-shortcuts";
import { ExpansionCampaignMissionsPanel } from "@/components/expansions/expansion-campaign-missions-panel";
import { ExpansionCollectionPanel } from "@/components/expansions/expansion-collection-panel";
import { ExpansionDeepLootSection } from "@/components/expansions/expansion-deep-loot-section";
import { ExpansionDestinationPanel } from "@/components/expansions/expansion-destination-panel";
import { ExpansionLootPanel } from "@/components/expansions/expansion-loot-panel";
import { ExpansionProgressStrip } from "@/components/expansions/expansion-progress-strip";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getExpansionHub,
  getExpansionSlugs,
} from "@/data/expansions";
import { expansionHeaderUrl } from "@/lib/page-headers";
import { resolveExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  countTitleProgress,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import {
  getTitleEntry,
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

export const revalidate = 3600;

type ExpansionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getExpansionSlugs().map((slug) => ({ slug }));
}

export default async function ExpansionHubPage({ params }: ExpansionPageProps) {
  const { slug } = await params;
  const hub = getExpansionHub(slug);
  if (!hub) notFound();

  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs] = await Promise.all([
    resolveExpansionLoot(hub),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/expansions/${hub.slug}`),
  ]);

  const title = hub.titleSlug
    ? getTitleEntry(catalog, hub.titleSlug)
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

  const triumphRecords = title?.records ?? [];
  const emptyInstances = new Map();
  const titleProgress = title
    ? countTitleProgress({ ...title, records: triumphRecords }, emptyInstances)
    : { base: { completed: 0, total: 0 }, all: { completed: 0, total: 0 } };
  const { gildingRecords } = splitTitleRecords(triumphRecords);
  const iconPath = title
    ? resolveTriumphIcon(title.iconPath, triumphRecords)
    : "";

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

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={expansionHeaderUrl(hub.slug)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/expansions", label: "← Expansions & Seasons" }}
    >
      <ClientOwnership>
        <div className="space-y-8">
          <ExpansionProgressStrip
            collectionTotal={loot.collectionItems.length}
            collectionOwnershipGroups={collectionOwnershipGroups}
            titleRecords={triumphRecords}
            campaignMissions={loot.campaignMissions}
            campaignLegendaryRecordHash={loot.campaignLegendaryRecordHash}
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
            titleName={title?.name ?? ""}
            guardianTitle={title?.guardianTitle ?? null}
            titleDescription={title?.description ?? ""}
            titleIconPath={iconPath}
            baseProgress={titleProgress.base}
            overallProgress={titleProgress.all}
            hasGilding={gildingRecords.length > 0}
            titleTier="none"
            titleRecords={triumphRecords}
            triumphGroup={triumphGroup ?? null}
            triumphsGroupTitle={hub.triumphsGroupTitle}
            showTitleSeal={Boolean(hub.titleSlug && title)}
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
