import Link from "@/components/app-link";
import { ArmorSetsPage } from "@/components/armor-sets/armor-sets-page";
import { ClientOwnership } from "@/components/client-ownership";
import { SectionPageLayout } from "@/components/section-page-layout";
import { loadArmorSetCollection } from "@/lib/armor-sets/collection";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";

export const revalidate = 3600;

export default async function SetsPage() {
  const { sets } = await loadArmorSetCollection();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Armor sets"
      imageUrl={PAGE_HEADERS.armorSetsHeader}
      oauthConfigured={oauthConfigured}
      maxWidth="wide"
    >
      <Link
        href="/sets/bonuses"
        className="ui-panel mb-6 flex items-center gap-4 border-owned/45! px-4 py-3 transition hover:border-owned!"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">
            Armor set bonuses guide
          </span>
          <span className="block text-[13px] text-ash">Search every 2 and 4-piece bonus by effect and see what you can wear.</span>
        </span>
        <span className="font-display text-xs uppercase tracking-[0.14em] text-bone">Open →</span>
      </Link>
      <ClientOwnership>
        <ArmorSetsPage sets={sets} />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
