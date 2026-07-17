import { notFound } from "next/navigation";
import { TitleDetailPanel } from "@/components/title-detail-panel";
import { TriumphsListSection } from "@/components/triumphs-list-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import {
  countTitleProgress,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import {
  getTitleEntry,
  loadTriumphCatalog,
} from "@/lib/triumphs/load";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";

type TitlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const catalog = await loadTriumphCatalog();
  const title = getTitleEntry(catalog, slug);
  if (!title) notFound();

  const oauthConfigured = isBungieOAuthConfigured();
  const emptyInstances = new Map();
  const { base, all } = countTitleProgress(title, emptyInstances);
  const { gildingRecords } = splitTitleRecords(title.records);
  const iconPath = resolveTriumphIcon(title.iconPath, title.records);

  return (
    <SectionPageLayout
      title={title.name}
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/triumphs", label: "← Triumphs" }}
    >
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TitleDetailPanel
            name={title.name}
            guardianTitle={title.guardianTitle}
            description={title.description}
            iconPath={iconPath}
            baseProgress={base}
            overallProgress={all}
            hasGilding={gildingRecords.length > 0}
            titleTier="none"
          />
        </div>

        <div className="lg:col-span-2">
          <TriumphsListSection records={title.records} />
        </div>
      </div>
    </SectionPageLayout>
  );
}
