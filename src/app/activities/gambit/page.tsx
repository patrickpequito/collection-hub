import { ClientOwnership } from "@/components/client-ownership";
import { SectionJumpNav } from "@/components/detail-page-parts";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLegacyArmorSetsSection,
} from "@/components/owned-activity-loot";
import { OwnershipStatBlocks } from "@/components/ownership-stat-blocks";
import { SectionPageLayout } from "@/components/section-page-layout";
import { GAMBIT_HUB } from "@/data/activities/gambit";
import { filterExpiredTriumphRecords } from "@/lib/activity-expired-content";
import { resolveGambitLoot } from "@/lib/activities/gambit-loot";
import { armorPieces, ownershipGroups } from "@/lib/activities/playlist-page";
import { playlistEyebrow, playlistSiblings } from "@/lib/activities/playlists";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";

export const revalidate = 3600;

export default async function GambitActivityPage() {
  const hub = GAMBIT_HUB;
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs] = await Promise.all([
    resolveGambitLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
  ]);

  const titleEntry = getTitleEntry(catalog, hub.titleSlug);
  if (!titleEntry) {
    throw new Error(`Missing triumph title catalog entry: ${hub.titleSlug}`);
  }
  const title = {
    ...titleEntry,
    records: filterExpiredTriumphRecords(hub.titleSlug, titleEntry.records),
  };

  const armorPanels = loot.currentArmorPanels ?? [
    { armorRows: loot.currentArmorRows, previewFiles: hub.armorSetPreviewFiles },
  ];
  const weapons = loot.currentWeapons ?? [];
  const currentLoot = [...armorPanels.flatMap((panel) => armorPieces(panel.armorRows)), ...weapons];
  const legacyArmor = loot.legacyArmorGroups.flatMap((group) => armorPieces(group.rows));
  const cosmetics = loot.currentOtherSections.flatMap((section) => section.items);

  const sectionLinks = [
    { id: "current-loot", label: "Current loot" },
    { id: "cosmetics", label: "Cosmetics" },
    { id: "legacy-armor", label: "Legacy armor" },
    { id: "triumphs", label: "Triumphs" },
  ];

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/activities#playlists", label: "← Playlists" }}
      headerEyebrow={playlistEyebrow(hub.slug)}
      siblings={playlistSiblings(hub.slug)}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <OwnershipStatBlocks
            title={title}
            blocks={[
              { label: "Current loot", groups: ownershipGroups(currentLoot), gold: true },
              { label: "Legacy armor", groups: ownershipGroups(legacyArmor) },
              { label: "Cosmetics", groups: ownershipGroups(cosmetics) },
            ]}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="current-loot" className="scroll-mt-20 space-y-3">
            {armorPanels.map((panel, index) => (
              <OwnedActivityCurrentLootPanelFull
                key={hub.currentArmorSetHashes[index] ?? index}
                activitySlug={hub.slug}
                activityTitle={hub.title}
                armorRows={panel.armorRows}
                previewFiles={panel.previewFiles}
                weapons={index === armorPanels.length - 1 ? weapons : undefined}
                itemHrefs={itemHrefs}
                heading={index === 0 ? "Current loot" : undefined}
              />
            ))}
          </div>

          <div id="cosmetics" className="scroll-mt-20">
            <OwnedActivityCosmeticLootPanel
              sections={loot.currentOtherSections}
              itemHrefs={itemHrefs}
              heading="Cosmetics"
            />
          </div>

          <div id="legacy-armor" className="scroll-mt-20">
            <OwnedLegacyArmorSetsSection
              groups={loot.legacyArmorGroups}
              itemHrefs={itemHrefs}
              heading="Legacy armor"
            />
          </div>

          <div id="triumphs" className="scroll-mt-20">
            <ExpansionTriumphsPanel title={title} triumphGroup={null} triumphsGroupTitle="" />
          </div>
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
