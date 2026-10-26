import { ClientOwnership } from "@/components/client-ownership";
import { SectionHeading, SectionJumpNav } from "@/components/detail-page-parts";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLegacyArmorSetsSection,
} from "@/components/owned-activity-loot";
import { OwnershipStatBlocks } from "@/components/ownership-stat-blocks";
import { PlaylistTriumphColumns } from "@/components/playlist-triumph-columns";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  VANGUARD_OPS_CURRENT_ARMOR_SETS,
  VANGUARD_OPS_HUB,
  VANGUARD_OPS_TRIUMPH_COLUMNS,
  VANGUARD_OPS_TRIUMPH_GROUP,
} from "@/data/activities/vanguard-ops";
import { YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE } from "@/data/activities/year-of-prophecy-armor";
import { armorPieces, ownershipGroups } from "@/lib/activities/playlist-page";
import { playlistEyebrow, playlistSiblings } from "@/lib/activities/playlists";
import { resolveVanguardOpsLoot, resolveVanguardOpsWeaponPools } from "@/lib/activities/vanguard-ops-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getTriumphSectionRecords, loadTriumphCatalog } from "@/lib/triumphs/load";

export const revalidate = 3600;

export default async function VanguardOpsActivityPage() {
  const hub = VANGUARD_OPS_HUB;
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, weaponPools, catalog, itemHrefs] = await Promise.all([
    resolveVanguardOpsLoot(),
    resolveVanguardOpsWeaponPools(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
  ]);

  const triumphColumns = VANGUARD_OPS_TRIUMPH_COLUMNS.map((column) => ({
    heading: column.heading,
    records: getTriumphSectionRecords(catalog, VANGUARD_OPS_TRIUMPH_GROUP, [...column.sectionPath]),
  }));

  const armorPanels = loot.currentArmorPanels ?? [
    { armorRows: loot.currentArmorRows, previewFiles: hub.armorSetPreviewFiles },
  ];
  const weapons = loot.currentWeapons ?? [];
  const yopGroups = loot.yearOfProphecyArmorGroups ?? [];
  const currentLoot = [
    ...armorPanels.flatMap((panel) => armorPieces(panel.armorRows)),
    ...weapons,
    ...weaponPools.flatMap((pool) => pool.items),
  ];
  const legacyArmor = [...yopGroups, ...loot.legacyArmorGroups].flatMap((group) => armorPieces(group.rows));
  const cosmetics = loot.currentOtherSections.flatMap((section) => section.items);

  const sectionLinks = [
    { id: "current-loot", label: "Current loot" },
    { id: "cosmetics", label: "Cosmetics" },
    ...(yopGroups.length ? [{ id: "year-of-prophecy", label: "Year of Prophecy" }] : []),
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
                weaponSubgroups={index === armorPanels.length - 1 ? weaponPools : undefined}
                armorNote={VANGUARD_OPS_CURRENT_ARMOR_SETS[index]?.source}
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

          {yopGroups.length ? (
            <div id="year-of-prophecy" className="scroll-mt-20">
              <OwnedLegacyArmorSetsSection
                heading={YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE}
                groups={yopGroups}
                itemHrefs={itemHrefs}
              />
            </div>
          ) : null}

          <div id="legacy-armor" className="scroll-mt-20">
            <OwnedLegacyArmorSetsSection
              groups={loot.legacyArmorGroups}
              itemHrefs={itemHrefs}
              heading="Legacy armor"
            />
          </div>

          <div id="triumphs" className="scroll-mt-20">
            <SectionHeading title="Triumphs" />
            <PlaylistTriumphColumns columns={triumphColumns} />
          </div>
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
