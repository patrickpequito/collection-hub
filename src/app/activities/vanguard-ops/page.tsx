import {
  ActivityCosmeticLootPanel,
  ActivityCurrentLootPanel,
  ActivityWeaponsLootPanel,
} from "@/components/activity-current-loot-panel";
import { LegacyArmorSetsSection } from "@/components/legacy-armor-sets-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import {
  VANGUARD_OPS_HUB,
  VANGUARD_OPS_TRIUMPH_COLUMNS,
  VANGUARD_OPS_TRIUMPH_GROUP,
} from "@/data/activities/vanguard-ops";
import { YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE } from "@/data/activities/year-of-prophecy-armor";
import { resolveVanguardOpsLoot } from "@/lib/activities/vanguard-ops-loot";
import { loadCatalogHashIndex } from "@/lib/all-loot/catalog-hash-index";
import { isLootHashOwned } from "@/lib/all-loot/loot-ownership";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getSession } from "@/lib/session";
import {
  getTriumphSectionRecords,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import type { RecordInstance, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

export default async function VanguardOpsActivityPage() {
  const hub = VANGUARD_OPS_HUB;
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs, catalogByHash] = await Promise.all([
    resolveVanguardOpsLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
    loadCatalogHashIndex(),
  ]);

  const triumphColumns = VANGUARD_OPS_TRIUMPH_COLUMNS.map((column) => ({
    ...column,
    records: getTriumphSectionRecords(
      catalog,
      VANGUARD_OPS_TRIUMPH_GROUP,
      [...column.sectionPath],
    ),
  }));

  let ownedItemHashes = new Set<string>();
  let inventoryError: string | null = null;
  let recordInstances = new Map<string, RecordInstance>();
  let stringVariables: TriumphStringVariables = EMPTY_TRIUMPH_STRING_VARIABLES;
  let recordsError: string | null = null;

  if (session) {
    const [inventoryResult, recordsResult] = await Promise.allSettled([
      fetchOwnedItemHashes(session),
      fetchRecordInstances(session),
    ]);

    if (inventoryResult.status === "fulfilled") {
      ownedItemHashes = inventoryResult.value;
    } else {
      inventoryError =
        inventoryResult.reason instanceof Error
          ? inventoryResult.reason.message
          : "Failed to load inventory";
    }

    if (recordsResult.status === "fulfilled") {
      recordInstances = recordsResult.value.instances;
      stringVariables = recordsResult.value.stringVariables;
    } else {
      recordsError =
        recordsResult.reason instanceof Error
          ? recordsResult.reason.message
          : "Failed to load triumph progress";
    }
  }

  const showOwnership = Boolean(session && !inventoryError);
  const resolveItemOwned = (itemHash: string) =>
    isLootHashOwned(itemHash, ownedItemHashes, catalogByHash);
  const showTriumphProgress = Boolean(session && !recordsError);

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/pve-activities", label: "← PvE Activities" }}
    >
      {inventoryError ? (
        <p className="text-xs text-zinc-500">
          Collection unavailable: {inventoryError}
        </p>
      ) : !session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight items you own.
        </p>
      ) : null}

      {recordsError ? (
        <p className="text-xs text-amber-200/80">
          Triumph progress unavailable: {recordsError}
        </p>
      ) : null}

      <div className="space-y-8">
        {(loot.currentArmorPanels ?? [
          {
            armorRows: loot.currentArmorRows,
            previewFiles: hub.armorSetPreviewFiles,
          },
        ]).map((panel, index) => (
          <ActivityCurrentLootPanel
            key={hub.currentArmorSetHashes[index] ?? index}
            activitySlug={hub.slug}
            activityTitle={hub.title}
            armorRows={panel.armorRows}
            previewFiles={panel.previewFiles}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            resolveItemOwned={resolveItemOwned}
            itemHrefs={itemHrefs}
          />
        ))}

        <ActivityWeaponsLootPanel
          weapons={loot.currentWeapons ?? []}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          itemHrefs={itemHrefs}
        />

        <ActivityCosmeticLootPanel
          sections={loot.currentOtherSections}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          itemHrefs={itemHrefs}
        />

        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
          {triumphColumns.map((column) => (
            <TriumphsListSection
              key={column.heading}
              heading={column.heading}
              records={column.records}
              recordInstances={Object.fromEntries(recordInstances)}
              showProgress={showTriumphProgress}
              stringVariables={stringVariables}
              signInMessage={
                !session ? "Sign in to see triumph progress." : undefined
              }
            />
          ))}
        </div>

        {loot.yearOfProphecyArmorGroups?.length ? (
          <LegacyArmorSetsSection
            heading={YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE}
            groups={loot.yearOfProphecyArmorGroups}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            resolveItemOwned={resolveItemOwned}
            itemHrefs={itemHrefs}
          />
        ) : null}

        <LegacyArmorSetsSection
          groups={loot.legacyArmorGroups}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          itemHrefs={itemHrefs}
        />
      </div>
    </SectionPageLayout>
  );
}
