import { ExpansionsIndexContent } from "@/components/expansions/expansions-index-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";

export const revalidate = 3600;

export default async function ExpansionsPage() {
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Expansions & Seasons"
      imageUrl="/images/banners/expansions-seasons.webp"
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <ExpansionsIndexContent />
    </SectionPageLayout>
  );
}
