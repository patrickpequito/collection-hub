import { PvpActivitiesPageContent } from "@/components/pvp-activities-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export default async function PvpActivitiesPage() {
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="PvP Activities"
      imageUrl={PAGE_HEADERS.pvpActivities}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <PvpActivitiesPageContent />
    </SectionPageLayout>
  );
}
