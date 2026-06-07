import { HomeAuthSection } from "@/components/home-auth-section";
import { HomeTriumphScores } from "@/components/home-triumph-scores";
import { HubBanner } from "@/components/hub-banner";
import { SiteNav } from "@/components/site-nav";
import { fetchTriumphScores } from "@/lib/destiny-records";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getSession } from "@/lib/session";

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

  let triumphScores = null;
  let scoresError: string | null = null;

  if (session) {
    try {
      triumphScores = await fetchTriumphScores(session);
    } catch (error) {
      scoresError =
        error instanceof Error ? error.message : "Failed to load triumph scores";
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <SiteNav />

      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl flex-col px-6 py-10 sm:py-14">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Destiny 2 Collection Hub
            </h1>
            <p className="mt-2 max-w-lg text-sm text-zinc-400">
              Track exotic gear and legendary armor sets. Sign in with Bungie to
              highlight what you already own.
            </p>

            <HomeAuthSection
              session={session}
              oauthConfigured={oauthConfigured}
              error={params.error}
              loginSuccess={params.login === "success"}
              logoutSuccess={params.logout === "success"}
            />
          </div>

          <HomeTriumphScores
            scores={triumphScores}
            signedIn={Boolean(session)}
            error={scoresError}
          />
        </header>

        <div className="flex flex-1 flex-col justify-center gap-3 sm:gap-6">
          <HubBanner
            title="Monument of Triumph"
            description="Seasonal and event triumphs in one place."
            imageFile="monument-of-triumph.webp"
            comingSoon
          />
          <HubBanner
            href="/rad-loot"
            title="RAD Loot"
            description="Raid and dungeon loot organized by activity."
            imageFile="rad-loot.webp"
          />
          <HubBanner
            href="/triumphs"
            title="Triumphs"
            description="Track triumph groups and title progress."
            imageFile="triumphs.webp"
          />
          <HubBanner
            href="/sets"
            title="Armor sets"
            description="Legendary sets from raids, dungeons, seasons, and more."
            imageFile="armor-sets.webp"
          />
          <HubBanner
            href="/exotics"
            title="Exotics"
            description="Weapons and armor. Browse by slot and class."
            imageFile="exotics.webp"
          />
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-600">
          Catalogs work without signing in. Bungie login highlights owned items.
        </footer>
      </div>
    </main>
  );
}
