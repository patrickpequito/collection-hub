import { PvpActivitiesPageContent } from "@/components/pvp-activities-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function PvpActivitiesPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="PvP Activities"
      imageUrl={PAGE_HEADERS.pvpActivities}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <PvpActivitiesPageContent />
    </SectionPageLayout>
  );
}
