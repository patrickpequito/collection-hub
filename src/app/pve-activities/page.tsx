import { PveActivitiesPageContent } from "@/components/pve-activities-page-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export default async function PveActivitiesPage() {
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="PvE Activities"
      imageUrl={PAGE_HEADERS.pveActivities}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <PveActivitiesPageContent />
    </SectionPageLayout>
  );
}
