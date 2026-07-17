import type { Metadata } from "next";
import { AllLootPageContent } from "@/components/all-loot-page-content";
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
      maxWidth="5xl"
    >
      <p className="text-sm text-zinc-400">
        Search the full collectible catalog. Duplicate names show only the most
        recent version.
      </p>

      <AllLootPageContent />
    </SectionPageLayout>
  );
}
