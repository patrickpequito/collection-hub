import { ClientOwnership } from "@/components/client-ownership";
import { HomeContinue } from "@/components/home/home-continue";
import { HomeExplore } from "@/components/home/home-explore";
import { HomeNameplate } from "@/components/home/home-nameplate";
import { HomeSpotlight } from "@/components/home/home-spotlight";
import { HomeSummaryProvider } from "@/components/home/home-summary-provider";
import { HomeThisWeek } from "@/components/home/home-this-week";
import { HomeTimelineStrip } from "@/components/home/home-timeline-strip";
import { SiteNav } from "@/components/site-nav";
import { isBungieOAuthConfigured } from "@/lib/env";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

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
        <section className="mx-auto max-w-[1360px] px-4 pb-16 pt-10 sm:px-6">
          <div className="ui-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <a
              href={X_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] text-bone transition hover:text-white"
            >
              {X_PROFILE_HANDLE} on X
            </a>
            <p className="text-sm text-ash">Catalogs work without signing in. Not affiliated with Bungie.</p>
          </div>
        </section>
        </ClientOwnership>
      </HomeSummaryProvider>
    </main>
  );
}
