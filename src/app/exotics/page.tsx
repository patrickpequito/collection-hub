import { ExoticsCatalog } from "@/components/exotics-catalog";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadCatalystCatalog } from "@/lib/catalysts/load";
import { loadExoticCatalog } from "@/lib/exotics/load";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function ExoticsPage() {
  const session = await getSession();
  const [catalog, catalystCatalog] = await Promise.all([
    loadExoticCatalog(),
    loadCatalystCatalog(),
  ]);
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Exotics"
      imageUrl={PAGE_HEADERS.exotics}
      session={session}
      oauthConfigured={oauthConfigured}
    >
      {!session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight exotics you already own.
        </p>
      ) : null}

      <ExoticsCatalog
        items={catalog.items}
        catalysts={catalystCatalog.items}
        signedIn={Boolean(session)}
      />
    </SectionPageLayout>
  );
}
