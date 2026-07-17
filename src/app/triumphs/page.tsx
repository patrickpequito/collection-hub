import { TriumphsIndex } from "@/components/triumphs-index";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

export const revalidate = 3600;

export default async function TriumphsPage() {
  const catalog = await loadTriumphCatalog();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Triumphs"
      imageUrl={PAGE_HEADERS.triumphs}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <p className="text-sm text-zinc-400">
        Triumph groups and titles. Sign in to track your progress.
      </p>

      <TriumphsIndex catalog={catalog} />
    </SectionPageLayout>
  );
}
