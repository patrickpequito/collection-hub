import { notFound } from "next/navigation";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import {
  countTitleProgress,
  getTitleCompletionTier,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import {
  getTitleEntry,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

import type { RecordInstance } from "@/types/triumph";

type TitlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const title = getTitleEntry(catalog, slug);
  if (!title) notFound();

  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  let recordInstances = new Map<string, RecordInstance>();
  let recordsError: string | null = null;

  if (session) {
    try {
      recordInstances = await fetchRecordInstances(session);
    } catch (error) {
      recordsError =
        error instanceof Error ? error.message : "Failed to load triumph progress";
    }
  }

  const showProgress = Boolean(session && !recordsError);
  const { base, all } = countTitleProgress(title, recordInstances);
  const titleTier = showProgress
    ? getTitleCompletionTier(title, recordInstances)
    : "none";
  const { gildingRecords } = splitTitleRecords(title.records);
  const iconPath = resolveTriumphIcon(title.iconPath, title.records);

  return (
    <SectionPageLayout
      title={title.name}
      imageUrl={PAGE_HEADERS.triumphs}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/triumphs", label: "← Triumphs" }}
    >
      {recordsError ? (
        <p className="text-xs text-amber-200/80">
          Progress unavailable: {recordsError}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TitleDetailPanel
            name={title.name}
            guardianTitle={title.guardianTitle}
            description={title.description}
            iconPath={iconPath}
            baseProgress={base}
            overallProgress={all}
            hasGilding={gildingRecords.length > 0}
            titleTier={titleTier}
          />
        </div>

        <div className="lg:col-span-2">
          <TriumphsListSection
            records={title.records}
            recordInstances={Object.fromEntries(recordInstances)}
            showProgress={showProgress}
            signInMessage={
              !session ? "Sign in to see title progress." : undefined
            }
          />
        </div>
      </div>
    </SectionPageLayout>
  );
}
