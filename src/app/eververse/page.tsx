import { EverversePageContent } from "@/components/eververse-page-content";
import { EververseResetCountdown } from "@/components/eververse-reset-countdown";
import { SectionPageLayout } from "@/components/section-page-layout";
import { isBungieOAuthConfigured } from "@/lib/env";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

export default async function EverversePage() {
  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <SectionPageLayout
      title="Eververse Rotation"
      imageUrl={PAGE_HEADERS.eververse}
      session={session}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <EververseResetCountdown />

      {!session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight items you already own.
        </p>
      ) : null}

      <EverversePageContent signedIn={Boolean(session)} />
    </SectionPageLayout>
  );
}
