import { ArmorSetCatalog } from "@/components/armor-set-catalog";
import { SectionPlaceholderNotice } from "@/components/section-placeholder-notice";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function SetsPage() {
  const session = await getSession();
  const catalog = await loadArmorSetCatalog();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Armor sets"
      imageUrl={PAGE_HEADERS.armorSetsHeader}
      session={session}
      oauthConfigured={oauthConfigured}
    >
      <SectionPlaceholderNotice />

      <p className="text-sm text-zinc-400">
        Legendary armor sets by activity type ({catalog.sets.length} sets).
      </p>

      {session ? (
        <p className="text-xs text-zinc-500">
          Signed in as {session.displayName}.
        </p>
      ) : (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight pieces you already own.
        </p>
      )}

      <ArmorSetCatalog sets={catalog.sets} signedIn={Boolean(session)} />
    </SectionPageLayout>
  );
}
