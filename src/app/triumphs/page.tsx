import { TriumphsIndex } from "@/components/triumphs-index";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  fetchRecordInstances,
  serializeTriumphProfileData,
} from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

export default async function TriumphsPage() {
  const session = await getSession();
  const catalog = await loadTriumphCatalog();
  const oauthConfigured = isBungieOAuthConfigured();

  let recordInstances = {};
  let recordsError: string | null = null;

  if (session) {
    try {
      const profileData = serializeTriumphProfileData(
        await fetchRecordInstances(session),
      );
      recordInstances = profileData.recordInstances;
    } catch (error) {
      recordsError =
        error instanceof Error ? error.message : "Failed to load triumph progress";
    }
  }

  const showProgress = Boolean(session && !recordsError);

  return (
    <SectionPageLayout
      title="Triumphs"
      imageUrl={PAGE_HEADERS.triumphs}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <p className="text-sm text-zinc-400">
        Triumph groups and titles. Sign in to track your progress.
      </p>

      {recordsError ? (
        <p className="text-xs text-amber-200/80">
          Progress unavailable: {recordsError}
        </p>
      ) : !session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to see triumph and title progress.
        </p>
      ) : null}

      <TriumphsIndex
        catalog={catalog}
        recordInstances={recordInstances}
        showProgress={showProgress}
      />
    </SectionPageLayout>
  );
}
