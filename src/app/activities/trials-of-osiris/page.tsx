import { ClientOwnership } from "@/components/client-ownership";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLegacyArmorSetsSection,
  OwnedTrialsWeaponsBySeasonSection,
} from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { TrialsFeaturedMapsSection } from "@/components/trials-featured-maps-section";
import { TRIALS_OF_OSIRIS_HUB } from "@/data/activities/trials-of-osiris";
import { filterExpiredTriumphRecords } from "@/lib/activity-expired-content";
import { resolveTrialsFeaturedMaps } from "@/lib/activities/trials-featured-maps";
import { resolveTrialsOfOsirisLoot } from "@/lib/activities/trials-of-osiris-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  countTitleProgress,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

export const revalidate = 3600;

export default async function TrialsOfOsirisActivityPage() {
  const hub = TRIALS_OF_OSIRIS_HUB;
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs, featuredMaps] = await Promise.all([
    resolveTrialsOfOsirisLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
    resolveTrialsFeaturedMaps(),
  ]);

  const title = getTitleEntry(catalog, hub.titleSlug);
  if (!title) {
    throw new Error(`Missing triumph title catalog entry: ${hub.titleSlug}`);
  }

  const triumphRecords = filterExpiredTriumphRecords(
    hub.titleSlug,
    title.records,
  );
  const emptyInstances = new Map();
  const { base, all } = countTitleProgress(
    { ...title, records: triumphRecords },
    emptyInstances,
  );
  const { gildingRecords } = splitTitleRecords(triumphRecords);
  const iconPath = resolveTriumphIcon(title.iconPath, triumphRecords);

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/pvp-activities", label: "← PvP Activities" }}
    >
      <ClientOwnership>
        <div className="space-y-8">
          <OwnedActivityCurrentLootPanelFull
            activitySlug={hub.slug}
            activityTitle={hub.title}
            armorRows={loot.currentArmorRows}
            previewFiles={hub.armorSetPreviewFiles}
            itemHrefs={itemHrefs}
          />

          <OwnedTrialsWeaponsBySeasonSection
            groups={loot.weaponSeasonGroups ?? []}
            weaponPools={loot.currentWeaponPools}
            activityTitle={hub.title}
            footerNote="All Trials weapons can drop every weekend. Bonus focus pools rotate on a three-week schedule; the Lighthouse pool is for flawless chest rewards. Use weapon attunement in your inventory to target a specific drop."
            itemHrefs={itemHrefs}
          />

          <TrialsFeaturedMapsSection featuredMaps={featuredMaps} />

          <OwnedActivityCosmeticLootPanel
            sections={loot.currentOtherSections}
            itemHrefs={itemHrefs}
          />

          <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            <TriumphsListSection
              heading="Trials of Osiris // Triumphs"
              records={triumphRecords}
            />

            <TitleDetailPanel
              name={title.name}
              guardianTitle={title.guardianTitle}
              description={title.description}
              iconPath={iconPath}
              baseProgress={base}
              overallProgress={all}
              hasGilding={gildingRecords.length > 0}
              titleTier="none"
            />
          </div>

          <OwnedLegacyArmorSetsSection
            groups={loot.legacyArmorGroups}
            itemHrefs={itemHrefs}
          />
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
