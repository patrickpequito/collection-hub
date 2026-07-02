import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArmorDetailContent } from "@/components/armor-detail-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { resolveArmorSetForItem } from "@/lib/armor-sets/from-all-loot";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import {
  loadArmorSetBonusCatalog,
  resolveArmorSetBonuses,
  resolveEquipableItemSetHash,
} from "@/lib/armor/set-bonuses";
import { isBungieOAuthConfigured } from "@/lib/env";
import { parseArmorReturnPath } from "@/lib/armor/paths";
import { backLabelForPath } from "@/lib/weapons/paths";
import { getSession } from "@/lib/session";

type ArmorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({
  params,
}: ArmorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await loadAllLootCatalog();
  const armor = catalog.items.find(
    (item) => item.type === "Armor" && item.slug === slug,
  );

  if (!armor) {
    return { title: "Armor not found" };
  }

  return {
    title: armor.name,
    description: armor.description ?? armor.source,
  };
}

export default async function ArmorPage({
  params,
  searchParams,
}: ArmorPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const [catalog, setBonusCatalog] = await Promise.all([
    loadAllLootCatalog(),
    loadArmorSetBonusCatalog(),
  ]);
  const armor = catalog.items.find(
    (item) => item.type === "Armor" && item.slug === slug,
  );
  if (!armor) notFound();

  const fallbackHref = parseArmorReturnPath(from);
  const currentPath = from
    ? `/armor/${slug}?from=${encodeURIComponent(from)}`
    : `/armor/${slug}`;
  const itemHrefs = await buildCollectibleHrefByItemHash(currentPath);

  const { setName, twoPiece, fourPiece } = resolveArmorSetBonuses(
    setBonusCatalog,
    resolveEquipableItemSetHash(armor, setBonusCatalog),
  );

  const armorSetMatch = resolveArmorSetForItem(
    catalog.items,
    setBonusCatalog,
    armor,
  );

  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      showHeader={false}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{
        useHistory: true,
        label: backLabelForPath(fallbackHref),
        fallbackHref,
      }}
    >
      <ArmorDetailContent
        armor={armor}
        setName={setName}
        twoPieceBonus={twoPiece}
        fourPieceBonus={fourPiece}
        armorSet={armorSetMatch?.set ?? null}
        primaryGuardianClass={armorSetMatch?.primaryClass ?? null}
        itemHrefs={itemHrefs}
        isSignedIn={Boolean(session)}
      />
    </SectionPageLayout>
  );
}
