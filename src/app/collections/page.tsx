import type { Metadata } from "next";
import { ClientOwnership } from "@/components/client-ownership";
import { CollectionsIndex } from "@/components/collections/collections-index";
import { SectionPageLayout } from "@/components/section-page-layout";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { loadCollections } from "@/lib/collections/load";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections | Destiny 2 Collection Hub",
  description: "Every active Destiny 2 Collections badge, with completion tracked for Hunter, Titan and Warlock.",
};

export default async function CollectionsPage() {
  const [groups, itemHrefs] = await Promise.all([loadCollections(), buildCollectibleHrefByItemHash("/collections")]);

  return (
    <SectionPageLayout
      title="Collections"
      imageUrl={PAGE_HEADERS.collections}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="5xl"
      backLink={{ href: "/all-loot", label: "← Loot Collector" }}
      headerEyebrow="Collections · Badges"
    >
      <ClientOwnership>
        <CollectionsIndex groups={groups} itemHrefs={itemHrefs} />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
