import Image from "next/image";
import { AppVersionLabel } from "@/components/app-version-label";
import { HomeAuthSection } from "@/components/home-auth-section";
import { HomeFeaturedActivityBanner } from "@/components/home-featured-activity-banner";
import { HomeTriumphScores } from "@/components/home-triumph-scores";
import { HomeUpdatesNotice } from "@/components/home-updates-notice";
import { HubBanner } from "@/components/hub-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { isBungieOAuthConfigured } from "@/lib/env";
import { featuredActivityEntries } from "@/lib/rad-loot/featured-activities";
import { getSession } from "@/lib/session";
import siteLogo from "../../public/icon.png";

type HomeProps = {
  searchParams: Promise<{
    error?: string;
    login?: string;
    logout?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await getSession();
  const params = await searchParams;
  const oauthConfigured = isBungieOAuthConfigured();
  const featured = await featuredActivityEntries();

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <SiteNav />

      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl flex-col px-6 py-10 sm:py-14">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
              <Image
                src={siteLogo}
                alt=""
                className="h-8 w-auto shrink-0 sm:h-10"
                priority
                unoptimized
              />
              <span>Destiny 2 Collection Hub</span>
            </h1>
            <AppVersionLabel className="mt-1" />

            <HomeAuthSection
              session={session}
              oauthConfigured={oauthConfigured}
              error={params.error}
              loginSuccess={params.login === "success"}
              logoutSuccess={params.logout === "success"}
            />
          </div>

          <HomeTriumphScores signedIn={Boolean(session)} />
        </header>

        <div className="mb-6 sm:mb-8">
          <HomeUpdatesNotice />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-5 sm:gap-8">
          <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/30 via-zinc-900/50 to-zinc-900/20 p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90 sm:text-xs">
                Featured
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <HubBanner
                size="featured"
                href="/rad-loot/the-pantheon"
                title="Pantheon 2.0"
                description="Endgame raid challenges, loot, and triumphs."
                imageUrl="/images/rad-loot/activities/the-pantheon.webp"
              />
              <HubBanner
                size="featured"
                href="/triumphs/group/monument-of-triumph"
                title="Monument of Triumph"
                description="The final triumphs and loot to chase in one place."
                imageFile="monument-of-triumph.webp"
              />
            </div>

            {featured.raids.length > 0 || featured.dungeons.length > 0 ? (
              <div className="mt-3 sm:mt-4">
                <div className="mb-2 flex items-center gap-1.5 sm:mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/rad-loot/featured.png"
                    alt=""
                    width={14}
                    height={14}
                    className="shrink-0 object-contain"
                    style={{ width: 14, height: 14 }}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#24b4b3] sm:text-xs">
                    RAD featured this week
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {featured.raids.map((entry) => (
                      <HomeFeaturedActivityBanner
                        key={entry.slug}
                        entry={entry}
                        kind="raid"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {featured.dungeons.map((entry) => (
                      <HomeFeaturedActivityBanner
                        key={entry.slug}
                        entry={entry}
                        kind="dungeon"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3 sm:space-y-5">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
                Catalogs
              </p>
              <div className="h-px flex-1 bg-zinc-800" aria-hidden />
            </div>
            <HubBanner
              href="/all-loot"
              title="Loot Collector"
              description="Search the full collectible catalog."
              imageFile="loot-collector.webp"
            />
            <HubBanner
              href="/triumphs"
              title="Triumphs"
              description="Track triumph groups and title progress."
              imageFile="triumphs.webp"
            />
          </section>
        </div>

        <SiteFooter>
          Catalogs work without signing in. Bungie login highlights owned items.
        </SiteFooter>
      </div>
    </main>
  );
}
