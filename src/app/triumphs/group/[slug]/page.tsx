import { notFound } from "next/navigation";
import { TriumphGroupView } from "@/components/triumph-group-view";
import { SectionPageLayout } from "@/components/section-page-layout";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import { countTriumphProgress } from "@/lib/triumphs/record-progress";
import {
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";

import type { RecordInstance, TriumphStringVariables } from "@/types/triumph";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

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
  let stringVariables: TriumphStringVariables = EMPTY_TRIUMPH_STRING_VARIABLES;
  let recordsError: string | null = null;

  if (session) {
    try {
      const profileData = await fetchRecordInstances(session);
      recordInstances = profileData.instances;
      stringVariables = profileData.stringVariables;
    } catch (error) {
      recordsError =
        error instanceof Error ? error.message : "Failed to load triumph progress";
    }
  }

  const showProgress = Boolean(session && !recordsError);
  const progress = countTriumphProgress(group.records, recordInstances);

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
      ) : null}

      <TriumphGroupView
        group={group}
        progress={progress}
        recordInstances={Object.fromEntries(recordInstances)}
        showProgress={showProgress}
        stringVariables={stringVariables}
        signInMessage={!session ? "Sign in to see triumph progress." : undefined}
      />
    </SectionPageLayout>
  );
}
