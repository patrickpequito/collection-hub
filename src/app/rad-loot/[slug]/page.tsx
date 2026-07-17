import { notFound } from "next/navigation";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { ClientOwnership } from "@/components/client-ownership";
import {
  OwnedActivityArmorSection,
  OwnedLootSection,
} from "@/components/owned-activity-loot";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
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
import {
  countTitleProgress,
  countTriumphProgress,
} from "@/lib/triumphs/record-progress";
import {
  getTitleEntry,
  loadTriumphCatalog,
  resolveActivityTriumphRecords,
} from "@/lib/triumphs/load";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { enrichWeaponLootItems } from "@/lib/activities/loot-item";
import { loadCatalogHashIndex } from "@/lib/all-loot/catalog-hash-index";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

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
    buildCollectibleHrefByItemHash(`/rad-loot/${slug}`),
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
  const hasTriumphSection = triumphRecords.length > 0;
  const emptyInstances = new Map();
  const exoticItemHashes = ACTIVITY_EXOTIC_HASHES[slug] ?? new Set<string>();
  const weapons = enrichWeaponLootItems(activity.weapons, catalogByHash);
  const timelostWeapons = enrichWeaponLootItems(
    activity.timelostWeapons,
    catalogByHash,
  );
  const titleProgress = title
    ? countTitleProgress({ ...title, records: triumphRecords }, emptyInstances)
    : hasTriumphSection
      ? (() => {
          const progress = countTriumphProgress(triumphRecords, emptyInstances);
          return {
            base: progress,
            gilding: { completed: 0, total: 0 },
            all: progress,
          };
        })()
      : null;
  const panelName = title?.name ?? activity.triumphPanel?.name ?? "";
  const panelDescription =
    title?.description ?? activity.triumphPanel?.description ?? "";
  const panelGuardianTitle = title?.guardianTitle ?? null;
  const panelIconPath = title
    ? resolveTriumphIcon(title.iconPath, title.records)
    : activity.triumphPanel
      ? resolveTriumphIcon(activity.triumphPanel.iconPath, triumphRecords)
      : "";

  return (
    <SectionPageLayout
      title={activity.title}
      imageUrl={activityHeaderUrl(activity.headerImageFile)}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/rad-loot", label: "← RAD Loot" }}
    >
      <ClientOwnership>
<div className="grid min-w-0 gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-1">
          {hasTriumphSection && titleProgress ? (
            <TitleDetailPanel
              name={panelName}
              guardianTitle={panelGuardianTitle}
              description={panelDescription}
              iconPath={panelIconPath}
              baseProgress={titleProgress.base}
              overallProgress={titleProgress.all}
              hasGilding={false}
              titleTier="none"
              appearance="raid"
              raidCompletions={isRaidCompletionSlug(slug) ? null : undefined}
              showMasterCompletions={
                isRaidCompletionSlug(slug) ? raidHasMasterTier(slug) : true
              }
              completionsLabel={activity.completionsLabel}
            />
          ) : null}

          <OwnedActivityArmorSection
            activitySlug={slug}
            activityTitle={activity.title}
            rows={activity.armorSets}
            previewFiles={activity.armorSetPreviewFiles}
            itemHrefs={itemHrefs}
          />

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

          <OwnedLootSection
            title="Other"
            items={activity.other}
            exoticItemHashes={exoticItemHashes}
            itemHrefs={itemHrefs}
          />
        </div>

        {hasTriumphSection ? (
          <div className="min-w-0 lg:col-span-2">
            <TriumphsListSection records={triumphRecords} />
          </div>
        ) : null}
      </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
