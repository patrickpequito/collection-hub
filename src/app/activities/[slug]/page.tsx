import { notFound } from "next/navigation";
import { ActivityTitleDetailPanel } from "@/components/activity-title-detail-panel";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { ClientOwnership } from "@/components/client-ownership";
import {
  OwnedActivityArmorSection,
  OwnedLootSection,
} from "@/components/owned-activity-loot";
import { SectionJumpNav, SectionHeading } from "@/components/detail-page-parts";
import { SectionPageLayout } from "@/components/section-page-layout";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { ACTIVITY_ERAS, activityEraLabel } from "@/data/rad-loot/activity-eras";
import { ActivitiesProgressProvider } from "@/components/activities/activities-progress-provider";
import {
  ActivityStatBlocks,
  type ActivityExotic,
} from "@/components/activities/activity-page-parts";
import { featuredActivitySlugs } from "@/lib/rad-loot/featured-activities";
import {
  filterExpiredActivityLoot,
  filterExpiredTriumphRecords,
} from "@/lib/activity-expired-content";
import {
  isRaidCompletionSlug,
  raidHasMasterTier,
} from "@/lib/destiny-activity-stats";
import { isBungieOAuthConfigured } from "@/lib/env";
import { activityHeaderUrl } from "@/lib/page-headers";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { enrichWeaponLootItems } from "@/lib/activities/loot-item";
import { loadCatalogHashIndex } from "@/lib/all-loot/catalog-hash-index";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";
import {
  findActivityTriumphSectionRecords,
  getTitleEntry,
  loadTriumphCatalog,
  resolveActivityTriumphRecords,
} from "@/lib/triumphs/load";
import type { TriumphRecord } from "@/types/triumph";

const ALL_RAIDS = [...RAIDS, ...LEGACY_RAIDS, ...RAID_LAIRS];

/** Raid / Dungeon / Endgame — drives the breadcrumb, header line and stepper. */
function activityKind(slug: string): "Raid" | "Dungeon" | "Endgame" {
  if (slug === PANTHEON.slug) return "Endgame";
  return DUNGEONS.some((entry) => entry.slug === slug) ? "Dungeon" : "Raid";
}

/** Older / newer activity of the same kind, by release order (Z / C). */
function activitySiblings(slug: string) {
  const kind = activityKind(slug);
  if (kind === "Endgame") return undefined;
  const list = [...(kind === "Raid" ? ALL_RAIDS : DUNGEONS)].sort(
    (a, b) => (ACTIVITY_ERAS[a.slug]?.order ?? 0) - (ACTIVITY_ERAS[b.slug]?.order ?? 0),
  );
  const index = list.findIndex((entry) => entry.slug === slug);
  const link = (entry: (typeof list)[number] | undefined) =>
    entry ? { href: `/activities/${entry.slug}`, label: entry.title } : undefined;
  return { previous: link(list[index - 1]), next: link(list[index + 1]) };
}

/** Middle breadcrumb: which block of the Activities hub this page lives in. */
function activityKindCrumb(slug: string) {
  if (slug === PANTHEON.slug) return { label: "Endgame", href: "/activities#endgame" };
  if (DUNGEONS.some((entry) => entry.slug === slug)) {
    return { label: "Dungeons", href: "/activities#dungeons" };
  }
  return { label: "Raids", href: "/activities#raids" };
}

type ActivityPageProps = {
  params: Promise<{ slug: string }>;
};

const ACTIVITY_EXOTIC_HASHES: Record<string, Set<string>> = {
  "vault-of-glass": new Set(["4289226715", "2907216422"]),
  "crotas-end": new Set(["1034055198", "1934481780", "2091889892"]),
  "kings-fall": new Set(["1802135586", "528682407", "3889064943"]),
  "last-wish": new Set(["2069224589"]),
  "deep-stone-crypt": new Set(["2399110176"]),
  "vow-of-the-disciple": new Set(["3505113722"]),
  "root-of-nightmares": new Set(["3371017761"]),
  "salvations-edge": new Set(["3284383335"]),
  "the-desert-perpetual": new Set(["1202007252"]),
  leviathan: new Set(["3580904580"]),
  "spire-of-stars": new Set(["530754878"]),
  "scourge-of-the-past": new Set(["2376481550", "3317837688"]),
  "crown-of-sorrow": new Set(["3110698812"]),
  prophecy: new Set(["732682038", "2232750624"]),
  "pit-of-heresy": new Set(["1395261499"]),
  "the-shattered-throne": new Set(["814876684"]),
  duality: new Set(["3664831848"]),
  "spire-of-the-watcher": new Set(["4174431791"]),
  "ghosts-of-the-deep": new Set(["1441805468", "2274944459"]),
  "warlords-ruin": new Set(["3886719505", "4141762315"]),
  "vespers-host": new Set(["1111334348", "3031600404"]),
  "sundered-doctrine": new Set(["331231237", "2993751041"]),
  equilibrium: new Set(["1685137410", "2043430167", "4104431769"]),
};

export const revalidate = 3600;

export default async function ActivityLootPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const rawActivity = getActivityLootPage(slug);

  if (!rawActivity) {
    notFound();
  }

  const activity = filterExpiredActivityLoot(rawActivity);
  const oauthConfigured = isBungieOAuthConfigured();
  const [catalog, itemHrefs, catalogByHash] = await Promise.all([
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${slug}`),
    loadCatalogHashIndex(),
  ]);
  const title = getTitleEntry(catalog, slug);
  const triumphRecords = filterExpiredTriumphRecords(
    slug,
    title
      ? title.records
      : activity.triumphPanel
        ? [
            ...resolveActivityTriumphRecords(
              catalog,
              activity.triumphPanel.recordHashes,
            ),
            ...(activity.triumphPanel.records ?? []),
          ]
        : [],
  );
  // Full list for the activity (title records + the rest), each record once.
  const allTriumphRecords = filterExpiredTriumphRecords(slug, [
    ...new Map(
      [...findActivityTriumphSectionRecords(catalog, activity.title), ...triumphRecords].map(
        (record): [string, TriumphRecord] => [record.recordHash, record],
      ),
    ).values(),
  ]);
  const hasTriumphSection = allTriumphRecords.length > 0;
  const exoticItemHashes = ACTIVITY_EXOTIC_HASHES[slug] ?? new Set<string>();
  const exotics: ActivityExotic[] = [
    ...new Map(
      // Weapons only — exotic ships / sparrows stay in Cosmetics.
      [...activity.weapons, ...activity.timelostWeapons]
        .filter((item) => exoticItemHashes.has(item.itemHash))
        .map((item): [string, ActivityExotic] => [
          item.name,
          {
            name: item.name,
            iconPath: item.iconPath,
            hashes: [item.itemHash, ...(item.ownershipHashes ?? [])],
          },
        ]),
    ).values(),
  ];
  const weapons = enrichWeaponLootItems(activity.weapons, catalogByHash);
  const timelostWeapons = enrichWeaponLootItems(
    activity.timelostWeapons,
    catalogByHash,
  );
  const cosmetics = enrichWeaponLootItems(activity.other, catalogByHash);
  const armorSets = activity.armorSets.map((row) => ({
    ...row,
    pieces: Object.fromEntries(
      Object.entries(row.pieces).map(([slot, piece]) => [
        slot,
        piece ? enrichWeaponLootItems([piece], catalogByHash)[0] : piece,
      ]),
    ) as typeof row.pieces,
  }));
  const panelName = title?.name ?? activity.triumphPanel?.name ?? "";
  const panelDescription =
    title?.description ?? activity.triumphPanel?.description ?? "";
  const panelGuardianTitle = title?.guardianTitle ?? null;
  const panelIconPath = title
    ? resolveTriumphIcon(title.iconPath, title.records)
    : activity.triumphPanel
      ? resolveTriumphIcon(activity.triumphPanel.iconPath, triumphRecords)
      : "";

  const kind = activityKind(slug);
  const era = activityEraLabel(slug);
  const featured = (await featuredActivitySlugs()).has(slug);
  const sectionLinks = [
    { id: "weapons", label: "Weapons" },
    { id: "armor", label: "Armor" },
    ...(activity.other.length > 0 ? [{ id: "cosmetics", label: "Cosmetics" }] : []),
    ...(hasTriumphSection ? [{ id: "triumphs", label: "Triumphs" }] : []),
  ];

  return (
    <SectionPageLayout
      title={activity.title}
      imageUrl={activityHeaderUrl(activity.headerImageFile)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/activities", label: "← Activities" }}
      breadcrumbs={[activityKindCrumb(slug)]}
      siblings={activitySiblings(slug)}
      headerEyebrow={[kind, era].filter(Boolean).join(" · ")}
      headerBadge={featured ? "Featured this week" : undefined}
    >
      <ClientOwnership>
        <ActivitiesProgressProvider>
          <div className="space-y-9">
            <ActivityStatBlocks
              slug={slug}
              title={title ?? null}
              titleRecords={triumphRecords}
              titleLabel={
                panelGuardianTitle ? `Title · ${panelGuardianTitle}` : "Triumphs"
              }
              showClears={isRaidCompletionSlug(slug)}
              hasMasterTier={isRaidCompletionSlug(slug) && raidHasMasterTier(slug)}
              exotics={exotics}
            />

            <SectionJumpNav links={sectionLinks} />

            <div id="weapons" className="scroll-mt-20 space-y-4">
              <OwnedLootSection
                title="Weapons"
                items={weapons}
                exoticItemHashes={exoticItemHashes}
                itemHrefs={itemHrefs}
              />
              {activity.timelostWeapons.length > 0 ? (
                <OwnedLootSection
                  title={activity.timelostWeaponsTitle ?? "Timelost Weapons"}
                  items={timelostWeapons}
                  itemHrefs={itemHrefs}
                />
              ) : null}
            </div>

            <div id="armor" className="scroll-mt-20">
              <OwnedActivityArmorSection
                layout="wide"
                activitySlug={slug}
                activityTitle={activity.title}
                rows={armorSets}
                previewFiles={activity.armorSetPreviewFiles}
                itemHrefs={itemHrefs}
              />
            </div>

            {activity.other.length > 0 ? (
              <div id="cosmetics" className="scroll-mt-20">
                <OwnedLootSection
                  title="Cosmetics"
                  items={cosmetics}
                  exoticItemHashes={exoticItemHashes}
                  itemHrefs={itemHrefs}
                />
              </div>
            ) : null}

            {hasTriumphSection ? (
              <section id="triumphs" className="scroll-mt-20">
              <SectionHeading
                title={panelGuardianTitle ? `Triumphs · ${panelGuardianTitle}` : "Triumphs"}
                note={`${allTriumphRecords.length} triumphs`}
              />
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
                <div className="ui-panel p-5 lg:sticky lg:top-20">
                  <ActivityTitleDetailPanel
                    slug={slug}
                    title={title ?? null}
                    triumphRecords={triumphRecords}
                    name={panelName}
                    guardianTitle={panelGuardianTitle}
                    description={panelDescription}
                    iconPath={panelIconPath}
                    showMasterCompletions={
                      isRaidCompletionSlug(slug) ? raidHasMasterTier(slug) : true
                    }
                    completionsLabel={activity.completionsLabel}
                  />
                </div>
                <TriumphsListSection
                  heading={null}
                  records={allTriumphRecords}
                  titleRecordHashes={
                    title ? triumphRecords.map((record) => record.recordHash) : undefined
                  }
                />
              </div>
              </section>
            ) : null}
          </div>
        </ActivitiesProgressProvider>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
