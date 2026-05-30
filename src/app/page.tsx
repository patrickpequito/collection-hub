import { HubBanner } from "@/components/hub-banner";
import { SiteNav } from "@/components/site-nav";
import { BungieLoginButton } from "@/components/bungie-login-button";
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

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <SiteNav />

      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl flex-col px-6 py-10 sm:py-14">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Destiny 2 Collection Hub
            </h1>
            <p className="mt-2 max-w-lg text-sm text-zinc-400">
              Track exotic gear and legendary armor sets. Sign in with Bungie to
              highlight what you already own.
            </p>
          </div>

          <div className="w-full min-w-[260px] max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:w-auto">
            {params.error ? (
              <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
                Sign-in error: {decodeURIComponent(params.error)}
              </div>
            ) : null}

            {params.login === "success" ? (
              <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                Signed in successfully.
              </div>
            ) : null}

            {params.logout === "success" ? (
              <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-950/40 p-2.5 text-xs text-zinc-300">
                You have signed out.
              </div>
            ) : null}

            {session ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Signed in as
                  </p>
                  <p className="mt-0.5 font-semibold">{session.displayName}</p>
                </div>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <BungieLoginButton configured={oauthConfigured} />
                {!oauthConfigured ? (
                  <p className="text-xs text-zinc-500">
                    Configure OAuth in{" "}
                    <code className="text-zinc-300">.env.local</code> to enable
                    sign-in.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-5 sm:gap-6">
          <HubBanner
            href="/rad-loot"
            title="RAD Loot"
            description="Raid and dungeon loot organized by activity."
            imageFile="rad-loot.webp"
          />
          <HubBanner
            href="/exotics"
            title="Exotics"
            description="Weapons and armor. Browse by slot and class."
            imageFile="exotics.webp"
          />
          <HubBanner
            href="/sets"
            title="Armor sets"
            description="Legendary sets from raids, dungeons, seasons, and more."
            imageFile="armor-sets.webp"
          />
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-600">
          Catalogs work without signing in. Bungie login highlights owned items.
        </footer>
      </div>
    </main>
  );
}
