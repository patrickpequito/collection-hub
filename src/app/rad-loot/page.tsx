import Link from "next/link";
import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";

export default function RadLootPage() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium tracking-[0.25em] text-zinc-400">
            COLLECTION HUB
          </p>
          <h1 className="mt-1 text-2xl font-semibold">RAD Loot</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Raid and dungeon loot by activity.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            ← Home
          </Link>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Raids
            </h2>
            <div className="space-y-2">
              {RAIDS.map((entry) => (
                <ActivityBannerSmall key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Dungeons
            </h2>
            <div className="space-y-2">
              {DUNGEONS.map((entry) => (
                <ActivityBannerSmall key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
