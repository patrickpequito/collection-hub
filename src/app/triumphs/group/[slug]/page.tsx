import { notFound } from "next/navigation";
import { SectionPageLayout } from "@/components/section-page-layout";
import { TriumphGroupBrowser } from "@/components/triumphs/triumph-group-browser";
import { TRIUMPH_GROUP_BANDS, triumphGroupBand } from "@/data/triumphs/seal-categories";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getTriumphGroup, loadTriumphCatalog } from "@/lib/triumphs/load";

type TriumphGroupPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export default async function TriumphGroupPage({ params }: TriumphGroupPageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const group = getTriumphGroup(catalog, slug);
  if (!group) notFound();

  // Z / C follow the hub's left column order.
  const ordered = TRIUMPH_GROUP_BANDS.flatMap((band) =>
    catalog.groups.filter((entry) => triumphGroupBand(entry.slug) === band),
  );
  const index = ordered.findIndex((entry) => entry.slug === slug);
  const link = (entry: (typeof ordered)[number] | undefined) =>
    entry ? { href: `/triumphs/group/${entry.slug}`, label: entry.name } : undefined;

  return (
    <SectionPageLayout
      title={group.name}
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={isBungieOAuthConfigured()}
      maxWidth="wide"
      headerEyebrow={`Triumphs · ${triumphGroupBand(group.slug)}`}
      siblings={{ previous: link(ordered[index - 1]), next: link(ordered[index + 1]) }}
    >
      <TriumphGroupBrowser group={group} />
    </SectionPageLayout>
  );
}
