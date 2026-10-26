import type { Metadata } from "next";
import { Suspense } from "react";
import { AllLootPageContent } from "@/components/all-loot-page-content";
import { CollectionSummaryBlocks } from "@/components/collection-summary-blocks";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Loot Collector | Destiny 2 Collection Hub",
  description: "Search the full Destiny 2 collectible catalog.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AllLootPage() {
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Loot Collector"
      imageUrl={PAGE_HEADERS.lootCollectorHeader}
      oauthConfigured={oauthConfigured}
      maxWidth="wide"
    >
      <div className="space-y-9">
        <CollectionSummaryBlocks />

        {/* Suspense: the content reads ?q= from the address (useSearchParams). */}
        <Suspense fallback={null}>
          <AllLootPageContent />
        </Suspense>
      </div>
    </SectionPageLayout>
  );
}
