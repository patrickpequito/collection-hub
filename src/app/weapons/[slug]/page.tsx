import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionPageLayout } from "@/components/section-page-layout";
import { WeaponDetailContent } from "@/components/weapon-detail-content";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getSession } from "@/lib/session";
import {
  loadWeaponGodRollIndex,
  resolveGodRollsForWeapon,
} from "@/lib/weapons/god-rolls";
import { getWeaponBySlug } from "@/lib/weapons/lookup";
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
  const [catalog, godRollIndex] = await Promise.all([
    loadAllLootCatalog(),
    loadWeaponGodRollIndex(),
  ]);
  const weapon = catalog.items.find(
    (item) => item.type === "Weapon" && item.slug === slug,
  );
  if (!weapon) notFound();

  const godRollsByHash = resolveGodRollsForWeapon(weapon, godRollIndex);

  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  const fallbackHref = parseWeaponReturnPath(from);

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
      <WeaponDetailContent
        weapon={weapon}
        plugIndex={catalog.plugIndex ?? {}}
        godRollsByHash={godRollsByHash}
        isSignedIn={Boolean(session)}
      />
    </SectionPageLayout>
  );
}
