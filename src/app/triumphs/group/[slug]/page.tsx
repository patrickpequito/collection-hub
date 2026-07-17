import { notFound } from "next/navigation";
import { TriumphGroupView } from "@/components/triumph-group-view";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import {
  getTriumphGroup,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";

type TriumphGroupPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export default async function TriumphGroupPage({ params }: TriumphGroupPageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const group = getTriumphGroup(catalog, slug);
  if (!group) notFound();

  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title={group.name}
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/triumphs", label: "← Triumphs" }}
    >
      <TriumphGroupView group={group} />
    </SectionPageLayout>
  );
}
