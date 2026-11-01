import type { Metadata } from "next";
import { ClientOwnership } from "@/components/client-ownership";
import { HomeContinue } from "@/components/home/home-continue";
import { HomeExplore } from "@/components/home/home-explore";
import { HomeNameplate } from "@/components/home/home-nameplate";
import { HomeSpotlight } from "@/components/home/home-spotlight";
import { HomeSummaryProvider } from "@/components/home/home-summary-provider";
import { HomeThisWeek } from "@/components/home/home-this-week";
import { HomeTimelineStrip } from "@/components/home/home-timeline-strip";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { isBungieOAuthConfigured } from "@/lib/env";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Cacheable homepage — session-dependent pieces hydrate on the client. */
export const revalidate = 1800;

export default function Home() {
  const oauthConfigured = isBungieOAuthConfigured();

  return (
    <main className="min-h-dvh bg-void text-bone">
      <SiteNav oauthConfigured={oauthConfigured} />

      <HomeSummaryProvider>
        <ClientOwnership showSignInHint={false}>
        <HomeNameplate oauthConfigured={oauthConfigured} />
        <HomeSpotlight />
        <HomeThisWeek />
        <HomeExplore />
        <HomeContinue />
        <HomeTimelineStrip />
        <div className="mx-auto max-w-[1360px] px-4 pb-16 sm:px-6">
          <SiteFooter>Catalogs work without signing in.</SiteFooter>
        </div>
        </ClientOwnership>
      </HomeSummaryProvider>
    </main>
  );
}
