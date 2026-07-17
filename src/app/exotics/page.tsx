import { ExoticsCatalog } from "@/components/exotics-catalog";
import { SectionPlaceholderNotice } from "@/components/section-placeholder-notice";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadCatalystCatalog } from "@/lib/catalysts/load";
import { loadExoticCatalog } from "@/lib/exotics/load";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";

export const revalidate = 3600;

export default async function ExoticsPage() {
  const [catalog, catalystCatalog, itemHrefs] = await Promise.all([
    loadExoticCatalog(),
    loadCatalystCatalog(),
    buildCollectibleHrefByItemHash("/exotics"),
  ]);
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Exotics"
      imageUrl={PAGE_HEADERS.exotics}
      oauthConfigured={oauthConfigured}
    >
      <SectionPlaceholderNotice />

      <ExoticsCatalog
        items={catalog.items}
        catalysts={catalystCatalog.items}
        itemHrefs={itemHrefs}
      />
    </SectionPageLayout>
  );
}
