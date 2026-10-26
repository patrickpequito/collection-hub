import { notFound } from "next/navigation";
import { SectionPageLayout } from "@/components/section-page-layout";
import { SealDetail } from "@/components/triumphs/seal-detail";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { orderedSeals, summarizeSeal } from "@/lib/triumphs/hub";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";

type TitlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const title = getTitleEntry(catalog, slug);
  if (!title) notFound();

  const seal = summarizeSeal(title);
  // Z / C walk the seals in hub order (legacy seals among themselves).
  const list = title.isLegacy ? (catalog.legacyTitles ?? []).map(summarizeSeal) : orderedSeals(catalog);
  const index = list.findIndex((entry) => entry.slug === slug);
  const link = (entry: (typeof list)[number] | undefined) =>
    entry ? { href: `/triumphs/title/${entry.slug}`, label: entry.name } : undefined;

  return (
    <SectionPageLayout
      title={title.name}
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="wide"
      headerEyebrow={title.isLegacy ? "Legacy seal" : `Seal · ${seal.category}`}
      breadcrumbs={[{ label: title.isLegacy ? "Legacy seals" : "Seals", href: "/triumphs" }]}
      siblings={{ previous: link(list[index - 1]), next: link(list[index + 1]) }}
    >
      <SealDetail title={title} seal={seal} />
    </SectionPageLayout>
  );
}
