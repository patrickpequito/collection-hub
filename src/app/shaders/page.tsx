import type { Metadata } from "next";
import { SectionPageLayout } from "@/components/section-page-layout";
import { ShadersCatalog } from "@/components/shaders-catalog";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import {
  buildShaderCatalogItems,
  loadShaderItems,
} from "@/lib/shaders/group-shaders";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shaders | Destiny 2 Collection Hub",
  description:
    "Every Destiny 2 shader, grouped by expansion, season, event, or activity.",
};

export default async function ShadersPage() {
  const catalog = await loadAllLootCatalog();
  const shaders = loadShaderItems(catalog.items);
  const items = buildShaderCatalogItems(shaders);
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Shaders"
      imageUrl={PAGE_HEADERS.shaders}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/all-loot", label: "← Loot Collector" }}
    >
      <p className="text-sm text-zinc-400">
        All {shaders.length} shaders in the game. Switch how they are grouped
        and toggle subgroups per section.
      </p>

      <ShadersCatalog
        items={items}
        facetSeasons={catalog.facets.seasons}
        totalCount={shaders.length}
      />
    </SectionPageLayout>
  );
}
