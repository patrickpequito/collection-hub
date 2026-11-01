import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TriumphsHub } from "@/components/triumphs/triumphs-hub";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { loadTriumphHubData } from "@/lib/triumphs/hub";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

export const metadata: Metadata = pageMetadata(
  "/triumphs",
  "Destiny 2 titles & triumphs",
  "Every Destiny 2 title and triumph category, with your progress and the closest titles to finish.",
);

export const revalidate = 3600;

export default async function TriumphsPage() {
  const catalog = await loadTriumphCatalog();
  const { seals, legacySeals, groups } = loadTriumphHubData(catalog);

  return (
    <SectionPageLayout
      title="Triumphs"
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="wide"
      headerEyebrow="Collections"
      breadcrumbs={[{ label: "Seals" }]}
    >
      <TriumphsHub seals={seals} legacySeals={legacySeals} groups={groups} />
    </SectionPageLayout>
  );
}
