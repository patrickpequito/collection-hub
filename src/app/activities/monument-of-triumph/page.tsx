import {
  MonumentActivities,
  MonumentGuideBanner,
  MonumentRewards,
  MonumentStatBlocks,
  MonumentWeapons,
} from "@/components/activities/monument-of-triumph";
import { ClientOwnership } from "@/components/client-ownership";
import { SectionHeading, SectionJumpNav } from "@/components/detail-page-parts";
import { DestinationTriumphs } from "@/components/destinations/destination-progress";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import { OwnedActivityCurrentLootPanel } from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { MONUMENT_OF_TRIUMPH_HUB } from "@/data/activities/monument-of-triumph";
import { PANTHEON } from "@/data/rad-loot/activities";
import { resolveMonumentOfTriumph } from "@/lib/activities/monument-of-triumph";
import { armorPieces, ownershipGroups } from "@/lib/activities/playlist-page";
import { loadBonusGuideSets } from "@/lib/armor-sets/bonus-guide";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { summarizeSeal } from "@/lib/triumphs/hub";
import { getTitleEntry, getTriumphGroup, loadTriumphCatalog } from "@/lib/triumphs/load";
import { collectLeafSections, leafSectionId } from "@/lib/triumphs/sections";
import { pickReferenced } from "@/lib/pick-referenced";

export const revalidate = 3600;

export default async function MonumentOfTriumphPage() {
  const hub = MONUMENT_OF_TRIUMPH_HUB;

  const [data, catalog, bonusSets, allItemHrefs] = await Promise.all([
    resolveMonumentOfTriumph(),
    loadTriumphCatalog(),
    loadBonusGuideSets(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [data]);

  const group = getTriumphGroup(catalog, hub.triumphGroup);
  const title = getTitleEntry(catalog, hub.titleSlug);
  const seal = title ? summarizeSeal(title) : null;
  const triumphSections = group
    ? group.sections.flatMap((section) =>
        collectLeafSections([section]).map((leaf) => ({
          name: leaf.name,
          parent: section.name,
          href: `/triumphs/group/${group.slug}#${leafSectionId(section.name, leaf.name)}`,
          records: leaf.records,
        })),
      )
    : [];
  const triumphRecords = triumphSections.flatMap((section) => section.records);

  const armorRows = data.armorSets.flatMap((set) => set.rows);
  const rewardGroups = ownershipGroups([
    ...armorPieces(data.ornamentSets.flatMap((set) => set.rows)),
    ...Object.values(data.singles).flat(),
    ...armorPieces(data.rewardsPassSets.flatMap((set) => set.rows)),
    ...data.cosmetics.flatMap((section) => section.items),
  ]);
  const reissuedSets = bonusSets.filter((set) => set.monumentReissue).length;

  const sectionLinks = [
    { id: "armor-sets", label: "Armor sets" },
    ...(data.weapons.length ? [{ id: "weapons", label: "Weapons" }] : []),
    { id: "rewards", label: "Monument rewards" },
    { id: "activities", label: "Activities" },
    ...(triumphSections.length ? [{ id: "triumphs", label: "Triumphs" }] : []),
    ...(title ? [{ id: "seal", label: "Seal" }] : []),
  ];

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="5xl"
      backLink={{ href: "/activities#endgame", label: "← Activities" }}
      headerEyebrow="Endgame · Renegades"
    >
      <ClientOwnership>
        <div className="space-y-9">
          <MonumentStatBlocks
            armorGroups={ownershipGroups(armorPieces(armorRows))}
            weaponGroups={ownershipGroups(data.weapons)}
            rewardGroups={rewardGroups}
            triumphRecords={triumphRecords}
            seal={seal}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="armor-sets" className="scroll-mt-20">
            <OwnedActivityCurrentLootPanel
              activitySlug={hub.slug}
              activityTitle={hub.title}
              armorRows={armorRows}
              previewFiles={data.armorSets.map((set) => set.previewFile)}
              itemHrefs={itemHrefs}
              heading="Armor sets"
              headingNote="Playlist armor · this season"
            />
          </div>

          {data.weapons.length ? (
            <div id="weapons" className="scroll-mt-20">
              <MonumentWeapons weapons={data.weapons} itemHrefs={itemHrefs} />
            </div>
          ) : null}

          <div id="rewards" className="scroll-mt-20">
            <MonumentRewards
              ornamentSets={data.ornamentSets}
              singles={data.singles}
              rewardsPassSets={data.rewardsPassSets}
              cosmetics={data.cosmetics}
              itemHrefs={itemHrefs}
            />
          </div>

          <MonumentGuideBanner
            imageUrl={PAGE_HEADERS.armorSetsHeader}
            reissuedSets={reissuedSets}
            totalSets={bonusSets.length}
          />

          <div id="activities" className="scroll-mt-20">
            <MonumentActivities
              cards={[
                {
                  href: "/activities/sparrow-racing-league",
                  title: "Sparrow Racing League",
                  label: "Playlist · Racing",
                  imageUrl: "/images/pve-activities/activities/sparrow-racing-league.webp",
                  groups: data.activities.srl,
                },
                {
                  href: `/activities/${PANTHEON.slug}`,
                  title: "Pantheon",
                  label: "Endgame · Raid boss rush",
                  imageUrl: `/images/rad-loot/activities/${PANTHEON.wideImageFile ?? PANTHEON.imageFile}`,
                  imagePosition: "72% center",
                  groups: data.activities.pantheon,
                },
              ]}
            />
          </div>

          {triumphSections.length ? (
            <section id="triumphs" className="scroll-mt-20">
              <SectionHeading title="Triumphs · Monument of Triumph" note={`${triumphRecords.length} triumphs`} />
              <DestinationTriumphs sections={triumphSections} seal={null} />
            </section>
          ) : null}

          {title ? (
            <div id="seal" className="scroll-mt-20">
              <ExpansionTriumphsPanel title={title} triumphGroup={null} triumphsGroupTitle="" titleColumns={2} />
            </div>
          ) : null}
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
