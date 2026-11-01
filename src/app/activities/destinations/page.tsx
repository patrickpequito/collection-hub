import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ClientOwnership } from "@/components/client-ownership";
import { DestinationsIndex } from "@/components/destinations/destinations-index";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadDestinationsIndex } from "@/lib/destinations/load";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const metadata: Metadata = pageMetadata(
  "/activities/destinations",
  "Destiny 2 destinations & weekly rotations",
  "Every Destiny 2 destination with this week's rotations, loot, reputation and triumphs.",
);

export const revalidate = 3600;

export default async function DestinationsPage() {
  const destinations = await loadDestinationsIndex();

  return (
    <SectionPageLayout
      title="Destinations"
      imageUrl={PAGE_HEADERS.destinations}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="wide"
      headerEyebrow="Activities"
    >
      <ClientOwnership>
        <DestinationsIndex destinations={destinations} />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
