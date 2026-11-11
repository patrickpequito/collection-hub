import type { Metadata } from "next";
import { NOT_FOUND_METADATA, pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { ClientOwnership } from "@/components/client-ownership";
import { SectionHeading, SectionJumpNav } from "@/components/detail-page-parts";
import { CurseBar } from "@/components/destinations/curse-bar";
import { DestinationActivitiesSection } from "@/components/destinations/destination-activities";
import { getDestinationActivities } from "@/lib/destinations/activities-data";
import { PathfinderCard } from "@/components/destinations/pathfinder-card";
import { loadPathfinderBoard } from "@/lib/destinations/pathfinder";
import { DestinationWeekCards } from "@/components/destinations/destination-week-cards";
import { DestinationReputation } from "@/components/destinations/destination-reputation";
import {
  DestinationStatBlocks,
  DestinationTriumphs,
} from "@/components/destinations/destination-progress";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLootBox,
} from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { DESTINATIONS, destinationImageUrl } from "@/data/destinations";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import {
  destinationReputation,
  destinationSeal,
  destinationTriumphSections,
  loadDestinationLoot,
} from "@/lib/destinations/load";
import { loadDestinationCurse, loadDestinationWeekly } from "@/lib/destinations/weekly";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadTriumphCatalog } from "@/lib/triumphs/load";
import { pickReferenced } from "@/lib/pick-referenced";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const destination = DESTINATIONS.find((entry) => entry.slug === slug && entry.built);
  if (!destination) return NOT_FOUND_METADATA;
  return pageMetadata(
    `/activities/destinations/${slug}`,
    `${destination.name} · Destiny 2 weekly rotations & loot`,
    `This week in ${destination.name} (Destiny 2): rotations, destination loot, armor set, reputation, activities and triumphs.`,
  );
}

type DestinationPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

const BUILT = DESTINATIONS.filter((destination) => destination.built);

export function generateStaticParams() {
  return BUILT.map((destination) => ({ slug: destination.slug }));
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = BUILT.find((entry) => entry.slug === slug);
  if (!destination) notFound();

  const [loot, triumphCatalog, allItemHrefs] = await Promise.all([
    loadDestinationLoot(destination),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/destinations/${destination.slug}`),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [loot]);
  const sections = destinationTriumphSections(triumphCatalog, destination);
  const seal = destinationSeal(triumphCatalog, destination);
  const weekly = await loadDestinationWeekly(destination);
  const pathfinder = destination.slug === "the-pale-heart" ? await loadPathfinderBoard() : null;
  const curse = loadDestinationCurse(destination);
  const reputation = destinationReputation(destination);
  const activities = getDestinationActivities(destination.slug);

  const lootItems = [
    ...loot.armorSets.flatMap((set) =>
      set.rows.flatMap((row) => Object.values(row.pieces).filter((piece) => piece !== undefined)),
    ),
    ...loot.weapons,
    ...loot.looseArmor,
    ...loot.cosmetics.flatMap((section) => section.items),
  ];
  const lootGroups = lootItems.map((item) => item.ownershipHashes ?? [item.itemHash]);

  // Z / C between built destinations in index order.
  const index = BUILT.findIndex((entry) => entry.slug === slug);
  const link = (entry: (typeof BUILT)[number] | undefined) =>
    entry ? { href: `/activities/destinations/${entry.slug}`, label: entry.name } : undefined;

  const sectionLinks = [
    ...(weekly.length || pathfinder ? [{ id: "this-week", label: "This week" }] : []),
    ...(reputation ? [{ id: "reputation", label: "Reputation" }] : []),
    { id: "loot", label: "Loot" },
    ...(loot.cosmetics.length ? [{ id: "cosmetics", label: "Cosmetics" }] : []),
    ...(activities ? [{ id: "activities", label: "Activities" }] : []),
    ...(sections.length ? [{ id: "triumphs", label: "Triumphs" }] : []),
  ];

  return (
    <SectionPageLayout
      title={destination.name}
      imageUrl={destinationImageUrl(destination)}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="5xl"
      headerEyebrow={`Destination · ${destination.era}`}
      breadcrumbs={[{ label: "Destinations", href: "/activities/destinations" }]}
      // DESTINATIONS is newest first: previous (left, Z) = older, next (right, X) = newer — same as expansions.
      siblings={{ previous: link(BUILT[index + 1]), next: link(BUILT[index - 1]) }}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <DestinationStatBlocks lootGroups={lootGroups} sections={sections} seal={seal} activities={activities} />

          {sectionLinks.length > 1 ? <SectionJumpNav links={sectionLinks} /> : null}

          {weekly.length || pathfinder ? (
            <section id="this-week" className="scroll-mt-20">
              <SectionHeading title="This week" />
              {curse ? <div className="mb-3"><CurseBar curse={curse} /></div> : null}
              {weekly.length ? <DestinationWeekCards slug={destination.slug} activities={weekly} /> : null}
              {pathfinder ? <PathfinderCard board={pathfinder} /> : null}
            </section>
          ) : null}

          {reputation ? (
            <section id="reputation" className="scroll-mt-20">
              <SectionHeading title="Reputation" />
              <DestinationReputation slug={destination.slug} info={reputation} />
            </section>
          ) : null}

          <div id="loot" className="scroll-mt-20 space-y-3">
            <OwnedActivityCurrentLootPanelFull
              activitySlug={destination.slug}
              activityTitle={destination.name}
              armorRows={loot.armorSets.flatMap((set) => set.rows)}
              previewFiles={loot.armorSets.map((set) => set.previewFile)}
              weapons={loot.weapons}
              itemHrefs={itemHrefs}
              heading="Loot"
              headingNote={`${lootGroups.length} items`}
            />
            {loot.looseArmor.length ? (
              <OwnedLootBox title="Adventure armor" items={loot.looseArmor} itemHrefs={itemHrefs} />
            ) : null}
          </div>

          {loot.cosmetics.length ? (
            <div id="cosmetics" className="scroll-mt-20">
              <OwnedActivityCosmeticLootPanel sections={loot.cosmetics} itemHrefs={itemHrefs} heading="Cosmetics" />
            </div>
          ) : null}

          {activities ? <DestinationActivitiesSection slug={destination.slug} activities={activities} /> : null}

          {sections.length ? (
            <section id="triumphs" className="scroll-mt-20">
              <SectionHeading title="Triumphs" />
              <DestinationTriumphs sections={sections} seal={seal} />
            </section>
          ) : null}
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
