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
import { originCrumbs, resolveItemOrigin } from "@/lib/items/origin";

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

  const oauthConfigured = isBungieOAuthConfigured();
  const matchedOrigin = resolveItemOrigin(armor);
  // Exotics come from their own source (focusing, quests…), not their season's expansion.
  const origin =
    armor.rarity === "Exotic" && matchedOrigin && (matchedOrigin.section === "season" || matchedOrigin.section === "expansion")
      ? null
      : matchedOrigin;

  // Z / C: other pieces of the same set (same class), or other exotics of the class.
  const slotOrder = ["helmet", "gauntlets", "chest", "legs", "classItem"] as const;
  const siblingItems =
    armor.rarity === "Exotic"
      ? catalog.items
          .filter(
            (item) =>
              item.type === "Armor" &&
              item.rarity === "Exotic" &&
              item.slug &&
              item.classOrWeaponType === armor.classOrWeaponType,
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      : armorSetMatch?.primaryClass
        ? slotOrder
            .map((slot) => armorSetMatch.set.classes[armorSetMatch.primaryClass!]?.[slot])
            .map((piece) =>
              piece
                ? catalog.items.find(
                    (item) =>
                      item.type === "Armor" &&
                      item.slug &&
                      [piece.itemHash, ...(piece.itemHashes ?? [])].includes(item.itemHash),
                  )
                : undefined,
            )
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
        : [];
  const siblingIndex = siblingItems.findIndex((item) => item.slug === slug);
  const siblingLink = (item: (typeof siblingItems)[number] | undefined) =>
    item?.slug ? { href: `/armor/${item.slug}`, label: item.name } : undefined;
  const siblings =
    siblingIndex >= 0
      ? { previous: siblingLink(siblingItems[siblingIndex - 1]), next: siblingLink(siblingItems[siblingIndex + 1]) }
      : undefined;
  const trail =
    armor.rarity === "Exotic"
      ? [{ label: "Collections", href: "/all-loot" }, { label: "Exotics", href: "/exotics" }]
      : originCrumbs(origin);

  return (
    <SectionPageLayout
      showHeader={false}
      oauthConfigured={oauthConfigured}
      recentVisit={{
        title: armor.name,
        imageUrl: `https://www.bungie.net${armor.iconPath}`,
      }}
      maxWidth="5xl"
      title={armor.name}
      breadcrumbs={trail}
      hideSectionCrumb={trail.length > 0}
      siblings={siblings}
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
        origin={origin}
      />
    </SectionPageLayout>
  );
}
