import Image from "next/image";
import { notFound } from "next/navigation";
import { TriumphRecordList } from "@/components/triumph-record-list";
import { SectionPageLayout } from "@/components/section-page-layout";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import {
  countTriumphProgress,
  progressPercent,
} from "@/lib/triumphs/record-progress";
import {
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

import type { RecordInstance } from "@/types/triumph";

type TriumphGroupPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TriumphGroupPage({ params }: TriumphGroupPageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const group = getTriumphGroup(catalog, slug);
  if (!group) notFound();

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
  const progress = countTriumphProgress(group.records, recordInstances);
  const iconPath = resolveTriumphIcon(group.iconPath, group.records);
  const iconUrl = bungieIconUrl(iconPath);

  return (
    <SectionPageLayout
      title={group.name}
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
      ) : !session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to see triumph progress.
        </p>
      ) : null}

      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              fill
              className="object-contain"
              sizes="56px"
              unoptimized
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Triumph group
          </p>
          <p className="text-lg font-semibold text-zinc-100">{group.name}</p>
        </div>
        <p className="shrink-0 tabular-nums text-sm text-zinc-300">
          {progress.completed} / {progress.total}
        </p>
      </div>

      <div className="relative mb-6 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-600"
          style={{ width: `${progressPercent(progress)}%` }}
        />
      </div>

      <TriumphRecordList
        records={group.records}
        recordInstances={recordInstances}
        showProgress={showProgress}
      />
    </SectionPageLayout>
  );
}
