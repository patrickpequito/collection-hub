import { ClientOwnership } from "@/components/client-ownership";
import { SectionJumpNav } from "@/components/detail-page-parts";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLegacyArmorSetsSection,
  OwnedTrialsWeaponsBySeasonSection,
} from "@/components/owned-activity-loot";
import { OwnershipStatBlocks } from "@/components/ownership-stat-blocks";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TrialsFeaturedMapsSection } from "@/components/trials-featured-maps-section";
import { TRIALS_OF_OSIRIS_HUB } from "@/data/activities/trials-of-osiris";
import { filterExpiredTriumphRecords } from "@/lib/activity-expired-content";
import { armorPieces, ownershipGroups, trialsHeaderBadge } from "@/lib/activities/playlist-page";
import { playlistEyebrow, playlistSiblings } from "@/lib/activities/playlists";
import { resolveTrialsFeaturedMaps } from "@/lib/activities/trials-featured-maps";
import { resolveTrialsOfOsirisLoot } from "@/lib/activities/trials-of-osiris-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import { poolScheduleNow, trialsPoolOccurrences } from "@/lib/activities/pool-rotation";

export const revalidate = 3600;

export default async function TrialsOfOsirisActivityPage() {
  const hub = TRIALS_OF_OSIRIS_HUB;
  const poolSchedule = poolScheduleNow(trialsPoolOccurrences, ["pool-1", "pool-2", "pool-3"] as const);
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, itemHrefs, featuredMaps] = await Promise.all([
    resolveTrialsOfOsirisLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
    resolveTrialsFeaturedMaps(),
  ]);

  const titleEntry = getTitleEntry(catalog, hub.titleSlug);
  if (!titleEntry) {
    throw new Error(`Missing triumph title catalog entry: ${hub.titleSlug}`);
  }
  const title = {
    ...titleEntry,
    records: filterExpiredTriumphRecords(hub.titleSlug, titleEntry.records),
  };

  const currentArmor = armorPieces(loot.currentArmorRows);
  // Every Trials weapon once (pools, Lighthouse, vendor exclusive, Adept, legacy).
  const weapons = [
    ...new Map(
      [
        ...(loot.currentWeaponPools ?? []).flatMap((pool) => pool.items),
        ...(loot.vendorExclusiveWeapons ?? []),
        ...(loot.adeptWeapons ?? []),
        ...(loot.currentWeapons ?? []),
      ].map((item) => [item.itemHash, item]),
    ).values(),
  ];
  const legacyArmor = loot.legacyArmorGroups.flatMap((group) => armorPieces(group.rows));
  const cosmetics = [...loot.currentOtherSections, ...(loot.legacyOtherSections ?? [])].flatMap(
    (section) => section.items,
  );

  const badge = trialsHeaderBadge(featuredMaps);

  const sectionLinks = [
    { id: "current-loot", label: "Current loot" },
    { id: "weapons", label: "Weapons" },
    { id: "maps", label: "Featured maps" },
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
      headerBadge={badge}
      siblings={playlistSiblings(hub.slug)}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <OwnershipStatBlocks
            title={title}
            blocks={[
              { label: "Current armor", groups: ownershipGroups(currentArmor), gold: true },
              { label: "Weapons", groups: ownershipGroups(weapons) },
              { label: "Legacy armor", groups: ownershipGroups(legacyArmor) },
              { label: "Cosmetics", groups: ownershipGroups(cosmetics) },
            ]}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="current-loot" className="scroll-mt-20 space-y-3">
            <OwnedActivityCurrentLootPanelFull
              activitySlug={hub.slug}
              activityTitle={hub.title}
              armorRows={loot.currentArmorRows}
              previewFiles={hub.armorSetPreviewFiles}
              itemHrefs={itemHrefs}
              heading="Current loot"
            />
          <div id="weapons" className="scroll-mt-20">
            <OwnedTrialsWeaponsBySeasonSection
              groups={[]}
              weaponSubgroups={[
                { title: "Vendor exclusive · Saint-14", items: loot.vendorExclusiveWeapons ?? [] },
                { title: "Adept · flawless rewards", items: loot.adeptWeapons ?? [] },
                { title: "Legacy Trials weapons", items: loot.currentWeapons ?? [] },
              ]}
              weaponPools={loot.currentWeaponPools}
              poolOccurrences={poolSchedule.occurrences}
              poolsNowMs={poolSchedule.nowMs}
              activityTitle={hub.title}
              itemHrefs={itemHrefs}
              boxTitle="Weapons"
            />
          </div>
          </div>

          <div id="maps" className="scroll-mt-20">
            <TrialsFeaturedMapsSection featuredMaps={featuredMaps} />
          </div>

          <div id="cosmetics" className="scroll-mt-20">
            <OwnedActivityCosmeticLootPanel
              sections={loot.currentOtherSections}
              legacySections={loot.legacyOtherSections}
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
