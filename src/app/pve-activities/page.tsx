import { PveActivitiesPageContent } from "@/components/pve-activities-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function PveActivitiesPage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="PvE Activities"
      imageUrl={PAGE_HEADERS.pveActivities}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <PveActivitiesPageContent />
    </SectionPageLayout>
  );
}
