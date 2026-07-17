import { ClientOwnership } from "@/components/client-ownership";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanel,
  OwnedActivityWeaponsLootPanel,
  OwnedLegacyArmorSetsSection,
} from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import {
  VANGUARD_OPS_HUB,
  VANGUARD_OPS_TRIUMPH_COLUMNS,
  VANGUARD_OPS_TRIUMPH_GROUP,
} from "@/data/activities/vanguard-ops";
import { YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE } from "@/data/activities/year-of-prophecy-armor";
import { resolveVanguardOpsLoot } from "@/lib/activities/vanguard-ops-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  getTriumphSectionRecords,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";

export const revalidate = 3600;

export default async function VanguardOpsActivityPage() {
  const hub = VANGUARD_OPS_HUB;
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs] = await Promise.all([
    resolveVanguardOpsLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
  ]);

  const triumphColumns = VANGUARD_OPS_TRIUMPH_COLUMNS.map((column) => ({
    ...column,
    records: getTriumphSectionRecords(
      catalog,
      VANGUARD_OPS_TRIUMPH_GROUP,
      [...column.sectionPath],
    ),
  }));

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/pve-activities", label: "← PvE Activities" }}
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
          {triumphColumns.map((column) => (
            <TriumphsListSection
              key={column.heading}
              heading={column.heading}
              records={column.records}
            />
          ))}
        </div>

        {loot.yearOfProphecyArmorGroups?.length ? (
          <OwnedLegacyArmorSetsSection
            heading={YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE}
            groups={loot.yearOfProphecyArmorGroups}
            itemHrefs={itemHrefs}
          />
        ) : null}

        <OwnedLegacyArmorSetsSection
          groups={loot.legacyArmorGroups}
          itemHrefs={itemHrefs}
        />
      </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
