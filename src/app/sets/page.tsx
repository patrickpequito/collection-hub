import { ArmorSetCatalog } from "@/components/armor-set-catalog";
import { SectionPageLayout } from "@/components/section-page-layout";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function SetsPage() {
  const session = await getSession();
  const catalog = await loadArmorSetCatalog();
  const oauthConfigured = isBungieOAuthConfigured();

  let ownedItemHashes: string[] = [];
  let inventoryError: string | null = null;

  if (session) {
    try {
      const owned = await fetchOwnedItemHashes(session);
      ownedItemHashes = [...owned];
    } catch (error) {
      inventoryError =
        error instanceof Error ? error.message : "Failed to load inventory";
    }
  }

  return (
    <SectionPageLayout
      title="Armor sets"
      imageUrl={PAGE_HEADERS.armorSets}
      session={session}
      oauthConfigured={oauthConfigured}
    >
      <p className="text-sm text-zinc-400">
        Legendary armor sets by activity type ({catalog.sets.length} sets).
      </p>

      {session ? (
        <p className="text-xs text-zinc-500">
          Signed in as {session.displayName}.
          {inventoryError
            ? ` Collection unavailable: ${inventoryError}`
            : ` Tracking ${ownedItemHashes.length} acquired items.`}
        </p>
      ) : (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight pieces you already own.
        </p>
      )}

      <ArmorSetCatalog
        sets={catalog.sets}
        ownedItemHashes={ownedItemHashes}
        showOwnership={Boolean(session && !inventoryError)}
      />
    </SectionPageLayout>
  );
}
