import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ClientOwnership } from "@/components/client-ownership";
import { ExoticsPage as ExoticsPageContent } from "@/components/exotics/exotics-page";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadExoticsPageData } from "@/lib/exotics/page-data";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const metadata: Metadata = pageMetadata(
  "/exotics",
  "Destiny 2 exotic weapons & armor",
  "Every Destiny 2 exotic weapon and armor piece with where it drops and catalyst status.",
);

export const revalidate = 3600;

export default async function ExoticsPage() {
  const data = await loadExoticsPageData();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Exotics"
      imageUrl={PAGE_HEADERS.exotics}
      oauthConfigured={oauthConfigured}
      maxWidth="wide"
    >
      <ClientOwnership showSignInHint={false}>
        <ExoticsPageContent data={data} />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
