import { ClientOwnership } from "@/components/client-ownership";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanel,
  OwnedActivityWeaponsLootPanel,
  OwnedLegacyArmorSetsSection,
} from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { CRUCIBLE_HUB } from "@/data/activities/crucible";
import { filterExpiredTriumphRecords } from "@/lib/activity-expired-content";
import { resolveCrucibleLoot } from "@/lib/activities/crucible-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  countTitleProgress,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

export const revalidate = 3600;

export default async function CrucibleActivityPage() {
  const hub = CRUCIBLE_HUB;
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs] = await Promise.all([
    resolveCrucibleLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
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
        {(loot.currentArmorPanels ?? [
          {
            armorRows: loot.currentArmorRows,
            previewFiles: hub.armorSetPreviewFiles,
          },
        ]).map((panel, index) => (
          <OwnedActivityCurrentLootPanel
            key={hub.currentArmorSetHashes[index] ?? index}
            activitySlug={hub.slug}
            activityTitle={hub.title}
            armorRows={panel.armorRows}
            previewFiles={panel.previewFiles}
            itemHrefs={itemHrefs}
          />
        ))}

        <OwnedActivityWeaponsLootPanel
          weapons={loot.currentWeapons ?? []}
          itemHrefs={itemHrefs}
        />

        <OwnedActivityCosmeticLootPanel
          sections={loot.currentOtherSections}
          itemHrefs={itemHrefs}
        />

        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
          <TriumphsListSection
            heading="Crucible // Triumphs"
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
