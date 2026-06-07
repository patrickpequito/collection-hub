import { notFound } from "next/navigation";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { LootSection } from "@/components/loot-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import {
  filterExpiredActivityLoot,
  filterExpiredTriumphRecords,
} from "@/lib/activity-expired-content";
import {
  fetchRaidCompletions,
  isRaidCompletionSlug,
  raidHasMasterTier,
  type RaidCompletions,
} from "@/lib/destiny-activity-stats";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { activityHeaderUrl } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import {
  countTitleProgress,
  countTriumphProgress,
  getTitleCompletionTier,
} from "@/lib/triumphs/record-progress";
import {
  getTitleEntry,
  loadTriumphCatalog,
  resolveActivityTriumphRecords,
} from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

import type { RecordInstance, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

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

export default async function ActivityLootPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const rawActivity = getActivityLootPage(slug);

  if (!rawActivity) {
    notFound();
  }

  const activity = filterExpiredActivityLoot(rawActivity);
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const catalog = await loadTriumphCatalog();
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

  let ownedItemHashes = new Set<string>();
  let inventoryError: string | null = null;
  let recordInstances = new Map<string, RecordInstance>();
  let stringVariables: TriumphStringVariables = EMPTY_TRIUMPH_STRING_VARIABLES;
  let recordsError: string | null = null;
  let raidCompletions: RaidCompletions | null | undefined = isRaidCompletionSlug(
    slug,
  )
    ? null
    : undefined;
  let raidCompletionsError: string | null = null;

  if (session) {
    try {
      ownedItemHashes = await fetchOwnedItemHashes(session);
    } catch (error) {
      inventoryError =
        error instanceof Error ? error.message : "Failed to load inventory";
    }

    if (hasTriumphSection) {
      try {
        const profileData = await fetchRecordInstances(session);
        recordInstances = profileData.instances;
        stringVariables = profileData.stringVariables;
      } catch (error) {
        recordsError =
          error instanceof Error ? error.message : "Failed to load triumph progress";
      }
    }

    if (isRaidCompletionSlug(slug)) {
      try {
        raidCompletions = await fetchRaidCompletions(session, slug);
      } catch (error) {
        raidCompletionsError =
          error instanceof Error
            ? error.message
            : "Failed to load raid completions";
      }
    }
  }

  const showOwnership = Boolean(session && !inventoryError);
  const showTriumphProgress = Boolean(hasTriumphSection && session && !recordsError);
  const exoticItemHashes = ACTIVITY_EXOTIC_HASHES[slug] ?? new Set<string>();
  const titleProgress = title
    ? countTitleProgress({ ...title, records: triumphRecords }, recordInstances)
    : hasTriumphSection
      ? (() => {
          const progress = countTriumphProgress(triumphRecords, recordInstances);
          return { base: progress, gilding: { completed: 0, total: 0 }, all: progress };
        })()
      : null;
  const titleTier =
    title && showTriumphProgress
      ? getTitleCompletionTier(
          { ...title, records: triumphRecords },
          recordInstances,
        )
      : "none";
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
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/rad-loot", label: "← RAD Loot" }}
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

      {hasTriumphSection && recordsError ? (
        <p className="text-xs text-amber-200/80">
          Triumph progress unavailable: {recordsError}
        </p>
      ) : null}

      {raidCompletionsError ? (
        <p className="text-xs text-amber-200/80">
          Raid completions unavailable: {raidCompletionsError}
        </p>
      ) : null}

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
              titleTier={titleTier}
              appearance="raid"
              raidCompletions={raidCompletions}
              showMasterCompletions={
                isRaidCompletionSlug(slug) ? raidHasMasterTier(slug) : true
              }
              completionsLabel={activity.completionsLabel}
            />
          ) : null}

          <ActivityArmorSection
            activitySlug={slug}
            activityTitle={activity.title}
            rows={activity.armorSets}
            previewFiles={activity.armorSetPreviewFiles}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
          />

          <LootSection
            title="Weapons"
            items={activity.weapons}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            exoticItemHashes={exoticItemHashes}
          />

          {activity.timelostWeapons.length > 0 ? (
            <LootSection
              title={activity.timelostWeaponsTitle ?? "Timelost Weapons"}
              items={activity.timelostWeapons}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
            />
          ) : null}

          <LootSection
            title="Other"
            items={activity.other}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            exoticItemHashes={exoticItemHashes}
          />
        </div>

        {hasTriumphSection ? (
          <div className="min-w-0 lg:col-span-2">
            <TriumphsListSection
              records={triumphRecords}
              recordInstances={Object.fromEntries(recordInstances)}
              showProgress={showTriumphProgress}
              stringVariables={stringVariables}
              signInMessage={
                !session ? "Sign in to see triumph progress." : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </SectionPageLayout>
  );
}
