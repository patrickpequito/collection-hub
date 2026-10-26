import { ClientOwnership } from "@/components/client-ownership";
import { DestinationsIndex } from "@/components/destinations/destinations-index";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadDestinationsIndex } from "@/lib/destinations/load";
import { PAGE_HEADERS } from "@/lib/page-headers";

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
