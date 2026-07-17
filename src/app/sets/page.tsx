import { ArmorSetCatalog } from "@/components/armor-set-catalog";
import { SectionPlaceholderNotice } from "@/components/section-placeholder-notice";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export default async function SetsPage() {
  const [catalog, itemHrefs] = await Promise.all([
    loadArmorSetCatalog(),
    buildCollectibleHrefByItemHash("/sets"),
  ]);
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Armor sets"
      imageUrl={PAGE_HEADERS.armorSetsHeader}
      oauthConfigured={oauthConfigured}
    >
      <SectionPlaceholderNotice />

      <p className="text-sm text-zinc-400">
        Legendary armor sets by activity type ({catalog.sets.length} sets).
      </p>

      <ArmorSetCatalog sets={catalog.sets} itemHrefs={itemHrefs} />
    </SectionPageLayout>
  );
}
