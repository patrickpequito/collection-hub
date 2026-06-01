import { notFound } from "next/navigation";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { LootSection } from "@/components/loot-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphRecordList } from "@/components/triumph-record-list";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { activityHeaderUrl } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import { countTitleProgress, getTitleCompletionTier } from "@/lib/triumphs/record-progress";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

import type { RecordInstance } from "@/types/triumph";

type ActivityPageProps = {
  params: Promise<{ slug: string }>;
};

const ACTIVITY_EXOTIC_HASHES: Record<string, Set<string>> = {
  "vault-of-glass": new Set(["4289226715", "2907216422"]),
  "crotas-end": new Set(["1034055198", "1934481780", "2091889892"]),
};

export default async function ActivityLootPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const activity = getActivityLootPage(slug);

  if (!activity) {
    notFound();
  }

  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const catalog = await loadTriumphCatalog();
  const title = getTitleEntry(catalog, slug);

  let ownedItemHashes = new Set<string>();
  let inventoryError: string | null = null;
  let recordInstances = new Map<string, RecordInstance>();
  let recordsError: string | null = null;

  if (session) {
    try {
      ownedItemHashes = await fetchOwnedItemHashes(session);
    } catch (error) {
      inventoryError =
        error instanceof Error ? error.message : "Failed to load inventory";
    }

    if (title) {
      try {
        recordInstances = await fetchRecordInstances(session);
      } catch (error) {
        recordsError =
          error instanceof Error ? error.message : "Failed to load triumph progress";
      }
    }
  }

  const showOwnership = Boolean(session && !inventoryError);
  const showTitleProgress = Boolean(title && session && !recordsError);
  const exoticItemHashes = ACTIVITY_EXOTIC_HASHES[slug] ?? new Set<string>();
  const titleProgress = title ? countTitleProgress(title, recordInstances) : null;
  const titleTier =
    title && showTitleProgress
      ? getTitleCompletionTier(title, recordInstances)
      : "none";
  const titleIconPath = title
    ? resolveTriumphIcon(title.iconPath, title.records)
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

      {title && recordsError ? (
        <p className="text-xs text-amber-200/80">
          Title progress unavailable: {recordsError}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {title && titleProgress ? (
            <TitleDetailPanel
              name={title.name}
              guardianTitle={title.guardianTitle}
              description={title.description}
              iconPath={titleIconPath}
              baseProgress={titleProgress.base}
              overallProgress={titleProgress.all}
              hasGilding={false}
              titleTier={titleTier}
              appearance="raid"
            />
          ) : null}

          <ActivityArmorSection
            rows={activity.armorSets}
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

          <LootSection
            title={activity.timelostWeaponsTitle ?? "Timelost Weapons"}
            items={activity.timelostWeapons}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
          />

          <LootSection
            title="Other"
            items={activity.other}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            exoticItemHashes={exoticItemHashes}
          />
        </div>

        {title ? (
          <div className="space-y-6 lg:col-span-2">
            {!session ? (
              <p className="text-xs text-amber-200/80">
                Sign in to see title progress.
              </p>
            ) : null}

            <TriumphRecordList
              records={title.records}
              recordInstances={recordInstances}
              showProgress={showTitleProgress}
              strictCompletion
              variant="title"
            />
          </div>
        ) : null}
      </div>
    </SectionPageLayout>
  );
}
