import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionPageLayout } from "@/components/section-page-layout";
import { WeaponDetailContent } from "@/components/weapon-detail-content";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { isBungieOAuthConfigured } from "@/lib/env";
import {
  loadWeaponGodRollIndex,
  resolveGodRollsForWeapon,
} from "@/lib/weapons/god-rolls";
import { getWeaponBySlug } from "@/lib/weapons/lookup";
import { aegisRecommendedPerks, loadWeaponAegisRollIndex } from "@/lib/weapons/aegis-rolls";
import { collectWeaponItemHashes } from "@/lib/weapons/item-hashes";
import { loadCatalystsForWeapon } from "@/lib/exotics/page-data";
import { originCrumbs, resolveItemOrigin } from "@/lib/items/origin";
import {
  backLabelForPath,
  parseWeaponReturnPath,
} from "@/lib/weapons/paths";

type WeaponPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateStaticParams() {
  const catalog = await loadAllLootCatalog();

  return catalog.items
    .filter((item) => item.type === "Weapon" && item.slug)
    .map((item) => ({ slug: item.slug! }));
}

export async function generateMetadata({
  params,
}: WeaponPageProps): Promise<Metadata> {
  const { slug } = await params;
  const weapon = await getWeaponBySlug(slug);

  if (!weapon) {
    return { title: "Weapon not found" };
  }

  return {
    title: weapon.name,
    description: weapon.description ?? weapon.source,
  };
}

export default async function WeaponPage({
  params,
  searchParams,
}: WeaponPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const [catalog, godRollIndex, aegisIndex] = await Promise.all([
    loadAllLootCatalog(),
    loadWeaponGodRollIndex(),
    loadWeaponAegisRollIndex(),
  ]);
  const weapon = catalog.items.find(
    (item) => item.type === "Weapon" && item.slug === slug,
  );
  if (!weapon) notFound();

  const godRollsByHash = resolveGodRollsForWeapon(weapon, godRollIndex);

  const oauthConfigured = isBungieOAuthConfigured();
  const fallbackHref = parseWeaponReturnPath(from);
  const isExotic = weapon.rarity === "Exotic";

  // Recommendations are per exact version: never borrow another version's rolls.
  const aegisPerksByHash: Record<string, string[]> = {};
  for (const hash of collectWeaponItemHashes(weapon)) {
    const perks = aegisRecommendedPerks(hash, aegisIndex);
    if (perks.length) aegisPerksByHash[hash] = perks;
  }
  const catalysts = isExotic ? await loadCatalystsForWeapon(weapon.name) : [];

  const matchedOrigin = resolveItemOrigin(weapon);
  const origin =
    isExotic && matchedOrigin && (matchedOrigin.section === "season" || matchedOrigin.section === "expansion")
      ? null
      : matchedOrigin;

  // Z / C: other weapons from the same origin, or other exotics of the slot.
  const siblingItems = catalog.items
    .filter((item) => {
      if (item.type !== "Weapon" || !item.slug) return false;
      if (isExotic) return item.rarity === "Exotic" && item.slot === weapon.slot;
      if (!origin) return false;
      const other = resolveItemOrigin(item);
      return other?.label === origin.label && item.rarity === weapon.rarity;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const siblingIndex = siblingItems.findIndex((item) => item.slug === slug);
  const siblingLink = (item: (typeof siblingItems)[number] | undefined) =>
    item?.slug ? { href: `/weapons/${item.slug}`, label: item.name } : undefined;
  const siblings =
    siblingIndex >= 0 && siblingItems.length > 1
      ? { previous: siblingLink(siblingItems[siblingIndex - 1]), next: siblingLink(siblingItems[siblingIndex + 1]) }
      : undefined;
  const trail = isExotic
    ? [{ label: "Collections", href: "/all-loot" }, { label: "Exotics", href: "/exotics" }]
    : originCrumbs(origin);

  return (
    <SectionPageLayout
      showHeader={false}
      oauthConfigured={oauthConfigured}
      recentVisit={{
        title: weapon.name,
        imageUrl: `https://www.bungie.net${weapon.iconPath}`,
      }}
      maxWidth="5xl"
      title={weapon.name}
      breadcrumbs={trail}
      hideSectionCrumb={trail.length > 0}
      siblings={siblings}
      backLink={{
        useHistory: true,
        label: backLabelForPath(fallbackHref),
        fallbackHref,
      }}
    >
      <WeaponDetailContent
        weapon={weapon}
        plugIndex={catalog.plugIndex ?? {}}
        godRollsByHash={godRollsByHash}
        origin={origin}
        aegisPerksByHash={aegisPerksByHash}
        catalysts={catalysts}
      />
    </SectionPageLayout>
  );
}
