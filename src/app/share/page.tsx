import type { Metadata } from "next";
import { formatShareWeek, loadResetShareData } from "@/lib/share/reset";
import { resolveTrialsFeaturedMaps } from "@/lib/activities/trials-featured-maps";
import { ironBannerWeek } from "@/lib/share/iron-banner";
import { loadXur } from "@/lib/xur";

/** Share kit: this week's X images + post text, with warnings for anything not confirmed yet. Not linked anywhere. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share kit",
  robots: { index: false, follow: false },
};

export default async function ShareKitPage() {
  const [data, xur, trials] = await Promise.all([loadResetShareData(), loadXur(), resolveTrialsFeaturedMaps()]);
  const week = formatShareWeek(data.weekStart, data.weekEnd);
  const titles = (kind: string) =>
    data.rows
      .filter((row) => row.kind === kind)
      .map((row) => row.title)
      .join(" · ");
  const postText = [
    `Destiny 2 weekly reset · ${week}`,
    "",
    data.bosses.length ? `Pantheon: ${data.bosses.map((boss) => `${boss.boss} (${boss.pool})`).join(" · ")}` : null,
    `Raids: ${titles("Raid")}`,
    `Dungeons: ${titles("Dungeon")}`,
    "Tier 5 loot in every featured activity.",
    "",
    "Loot, rotations & destinations 👉 d2collector.site",
  ]
    .filter((line) => line !== null)
    .join("\n");
  const fileDate = data.weekStart.slice(0, 10);
  const ironBanner = ironBannerWeek();
  const ironBannerDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(ironBanner.startMs),
  );
  const xurText = xur?.gear
    ? [
        "Xûr is in the Tower until the weekly reset 🎒",
        "",
        `Catalysts: ${xur.gear.catalysts.map((item) => item.name).join(" · ")}`,
        `Exotic weapons: ${xur.gear.weapons.map((item) => item.name).join(" · ")}`,
        `Exotic armor: ${xur.armor.map((item) => item.name).join(" · ")}`,
        "",
        "See what you're missing 👉 d2collector.site",
      ].join("\n")
    : null;

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Share kit</h1>
      <p className="ui-label mt-1 text-seasonal!">Weekly reset · {week}</p>

      {data.warnings.length ? (
        <ul className="mt-5 flex flex-col gap-1.5 border border-[#e07a3f]/60 bg-[#e07a3f]/10 px-4 py-3 text-sm text-bone">
          {data.warnings.map((warning) => (
            <li key={warning}>⚠ {warning}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 border border-seasonal/50 bg-seasonal/10 px-4 py-3 text-sm text-bone">
          Everything is confirmed for this week.
        </p>
      )}

      <section className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <h2 className="ui-label text-bone!">1 · Weekly reset</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/share/reset" alt="Weekly reset image" className="w-full border border-white/[0.16]" />
          <a
            href="/share/reset"
            download={`d2-weekly-reset-${fileDate}.jpg`}
            className="ui-label self-start border border-white/30 px-3 py-2 text-bone! transition hover:border-bone"
          >
            Download image
          </a>
          <h2 className="ui-label mt-4 text-bone!">2 · Destinations (same post)</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/share/destinations" alt="Destinations image" className="w-full border border-white/[0.16]" />
          <a
            href="/share/destinations"
            download={`d2-destinations-${fileDate}.jpg`}
            className="ui-label self-start border border-white/30 px-3 py-2 text-bone! transition hover:border-bone"
          >
            Download image
          </a>
          <h2 className="ui-label mt-4 text-bone!">
            3 · Iron Banner (same post, {ironBanner.live ? "this week" : `next one ${ironBannerDay} — preview`})
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/share/iron-banner" alt="Iron Banner image" className="w-full border border-white/[0.16]" />
          <a
            href="/share/iron-banner"
            download={`d2-iron-banner-${new Date(ironBanner.startMs).toISOString().slice(0, 10)}.jpg`}
            className="ui-label self-start border border-white/30 px-3 py-2 text-bone! transition hover:border-bone"
          >
            Download image
          </a>
          {!ironBanner.live ? (
            <p className="text-[12.5px] text-ash">Only post it on Iron Banner weeks. Check the focus weapons in game first.</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="ui-label text-bone!">Post text</h2>
          <textarea
            readOnly
            defaultValue={postText}
            rows={10}
            className="w-full resize-y border border-white/[0.16] bg-panel p-3 font-mono text-[13px] leading-relaxed text-bone"
          />
                  </div>
      </section>

      {xur ? (
        <section className="mt-10 grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3">
            <h2 className="ui-label text-bone!">4 · Xûr (Friday post)</h2>
            {xur.gear ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/share/xur" alt="Xûr image" className="w-full border border-white/[0.16]" />
                <a
                  href="/share/xur"
                  download={`d2-xur-${fileDate}.jpg`}
                  className="ui-label self-start border border-white/30 px-3 py-2 text-bone! transition hover:border-bone"
                >
                  Download image
                </a>
              </>
            ) : (
              <p className="border border-[#e07a3f]/60 bg-[#e07a3f]/10 px-4 py-3 text-sm text-bone">
                ⚠ Xûr&apos;s weapons and catalysts aren&apos;t loaded yet: open the home page while signed in, then reload this page.
              </p>
            )}
          </div>
          {xurText ? (
            <div className="flex flex-col gap-3">
              <h2 className="ui-label text-bone!">Post text</h2>
              <textarea
                readOnly
                defaultValue={xurText}
                rows={9}
                className="w-full resize-y border border-white/[0.16] bg-panel p-3 font-mono text-[13px] leading-relaxed text-bone"
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {trials.maps.length ? (
        <section className="mt-10 flex flex-col gap-3 md:w-1/2 md:pr-3">
          <h2 className="ui-label text-bone!">5 · Trials of Osiris (Friday post)</h2>
          {trials.source === "rotation" ? (
            <p className="border border-[#e07a3f]/60 bg-[#e07a3f]/10 px-4 py-3 text-sm text-bone">
              ⚠ These maps are the site&apos;s rotation guess, not confirmed by Bungie: check them in game before posting.
            </p>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/share/trials" alt="Trials of Osiris image" className="w-full border border-white/[0.16]" />
          <a
            href="/share/trials"
            download={`d2-trials-${trials.weekStart.slice(0, 10)}.jpg`}
            className="ui-label self-start border border-white/30 px-3 py-2 text-bone! transition hover:border-bone"
          >
            Download image
          </a>
        </section>
      ) : null}
    </main>
  );
}
