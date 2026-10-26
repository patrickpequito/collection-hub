import { ClientOwnership } from "@/components/client-ownership";
import { SectionHeading, SectionJumpNav } from "@/components/detail-page-parts";
import { SrlCurrentLoot } from "@/components/activities/srl-current-loot";
import { OwnedActivityCosmeticLootPanel } from "@/components/owned-activity-loot";
import { OwnershipStatBlocks } from "@/components/ownership-stat-blocks";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { SPARROW_RACING_LEAGUE_HUB } from "@/data/activities/sparrow-racing-league";
import { armorPieces, ownershipGroups } from "@/lib/activities/playlist-page";
import { playlistEyebrow, playlistSiblings } from "@/lib/activities/playlists";
import { resolveSparrowRacingLeagueLoot } from "@/lib/activities/sparrow-racing-league-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getTriumphSectionRecords, loadTriumphCatalog } from "@/lib/triumphs/load";
import { pickReferenced } from "@/lib/pick-referenced";

export const revalidate = 3600;

export default async function SparrowRacingLeaguePage() {
  const hub = SPARROW_RACING_LEAGUE_HUB;

  const [loot, catalog, allItemHrefs] = await Promise.all([
    resolveSparrowRacingLeagueLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [loot]);
  const triumphs = getTriumphSectionRecords(catalog, hub.triumphGroup, [...hub.triumphSectionPath]);
  const cosmetics = loot.cosmetics.flatMap((section) => section.items);

  const sectionLinks = [
    { id: "current-loot", label: "Current loot" },
    { id: "cosmetics", label: "Cosmetics" },
    ...(triumphs.length ? [{ id: "triumphs", label: "Triumphs" }] : []),
  ];

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="5xl"
      backLink={{ href: "/activities#playlists", label: "← Playlists" }}
      headerEyebrow={playlistEyebrow(hub.slug)}
      siblings={playlistSiblings(hub.slug)}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <OwnershipStatBlocks
            blocks={[
              { label: "Armor", groups: ownershipGroups(armorPieces(loot.armorRows)), gold: true },
              { label: "Weapons", groups: ownershipGroups(loot.weapons) },
              { label: "Cosmetics", groups: ownershipGroups(cosmetics) },
            ]}
            triumphRecords={triumphs}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="current-loot" className="scroll-mt-20">
            <SrlCurrentLoot
              circuitRows={loot.armorRows}
              circuitPreview={hub.armorSetPreviewFiles[0]}
              ornamentSets={loot.ornamentSets.filter((set) => set.name !== hub.gridSetName)}
              gridSet={loot.ornamentSets.find((set) => set.name === hub.gridSetName) ?? null}
              gridPreview={hub.gridSetPreviewFile}
              weapons={loot.weapons}
              itemHrefs={itemHrefs}
            />
          </div>

          <div id="cosmetics" className="scroll-mt-20">
            <OwnedActivityCosmeticLootPanel sections={loot.cosmetics} itemHrefs={itemHrefs} heading="Cosmetics" />
          </div>

          {triumphs.length ? (
            <section id="triumphs" className="scroll-mt-20">
              <SectionHeading title="Triumphs" note={`${triumphs.length} triumphs`} />
              <TriumphsListSection heading={null} records={triumphs} columns={2} />
            </section>
          ) : null}
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
