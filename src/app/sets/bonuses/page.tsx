import { SetBonusesGuide } from "@/components/armor-sets/set-bonuses-guide";
import { ClientOwnership } from "@/components/client-ownership";
import { SectionPageLayout } from "@/components/section-page-layout";
import { loadBonusGuideSets } from "@/lib/armor-sets/bonus-guide";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { pickReferenced } from "@/lib/pick-referenced";

export const revalidate = 3600;

export default async function SetBonusesPage() {
  const [sets, allItemHrefs] = await Promise.all([loadBonusGuideSets(), buildCollectibleHrefByItemHash("/sets/bonuses")]);
  // Links for the armor pieces shown when a set is opened.
  const itemHrefs = pickReferenced(allItemHrefs, sets.map((set) => set.rows));

  return (
    <SectionPageLayout
      title="Armor set bonuses"
      imageUrl={PAGE_HEADERS.armorSetsHeader}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="wide"
      headerEyebrow="Collections · Armor"
      breadcrumbs={[{ label: "Armor sets", href: "/sets" }]}
    >
      <ClientOwnership>
        <SetBonusesGuide sets={sets} itemHrefs={itemHrefs} />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
