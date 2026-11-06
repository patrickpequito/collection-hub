import type { Metadata } from "next";
import { formatShareWeek, loadResetShareData } from "@/lib/share/reset";
import { resolveTrialsFeaturedMaps } from "@/lib/activities/trials-featured-maps";
import { ironBannerWeek } from "@/lib/share/iron-banner";
import { loadXur } from "@/lib/xur";
import { XurGearButton } from "@/app/share/xur-gear-button";

/** Share kit: this week's X images + post text, with warnings for anything not confirmed yet. Not linked anywhere. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share kit",
  robots: { index: false, follow: false },
};

export default async function ShareKitPage() {
  const [data, xur, trials] = await Promise.all([loadResetShareData(), loadXur(), resolveTrialsFeaturedMaps()]);
  const week = formatShareWeek(data.weekStart, data.weekEnd);
  const names = (kind: string) => data.rows.filter((row) => row.kind === kind).map((row) => row.title);
  const both = (items: string[]) => items.join(" and ");
  const bosses = both(data.bosses.map((boss) => boss.boss));
  const raids = both(names("Raid"));
  const dungeons = names("Dungeon").join(" + ");
  // A different wording each week (picked by week number) so the posts don't read the same.
  const weekNumber = Math.floor(Date.parse(data.weekStart) / (7 * 24 * 60 * 60 * 1000));
  const pick = <T,>(options: T[], offset = 0) => options[(weekNumber + offset) % options.length];
  const comment = pick(["Nostalgic week.", "Solid rotation.", "Not a bad week at all.", "Plenty to farm.", "Busy week ahead."]);
  const question = pick(
    ["What are you running this week? 👇", "Which one are you running first? 👇", "What's first on your list? 👇", "Where are you spending your week? 👇"],
    1,
  );
  // Missing pieces (bosses or dungeons not detected yet) drop out instead of leaving gaps.
  const opening = pick(
    [
      [bosses && `${bosses} in the same Pantheon week, plus ${raids} featured. ${comment}`, dungeons && `And ${dungeons} for dungeons.`],
      [bosses && `Pantheon brings ${bosses}, and ${raids} are the featured raids. ${comment}`, dungeons && `On the dungeon side: ${dungeons}.`],
      [`${raids} featured this week${bosses ? `, with ${bosses} in the Pantheon` : ""}. ${comment}`, dungeons && `Dungeons: ${dungeons}.`],
    ],
    2,
  );
  const lead = opening[0] || `${raids} featured this week. ${comment}`;
  const postText = [lead, ...(opening[1] ? ["", opening[1]] : []), "", question, "", "#Destiny2 #DestinyTheGame"].join("\n");
  const replyText = "Full loot tables for every featured raid and dungeon, plus this week's destination rotations:\nd2collector.site";
  const fileDate = data.weekStart.slice(0, 10);
  const ironBanner = ironBannerWeek();
  const ironBannerDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(ironBanner.startMs),
  );
  // Same shape as the reset post: the image carries the full list, the text picks out the highlights.
  const list = (items: { name: string }[]) =>
    items.length > 1 ? `${items.slice(0, -1).map((item) => item.name).join(", ")} and ${items.at(-1)!.name}` : (items[0]?.name ?? "");
  const xurWeapons = xur?.gear ? list(xur.gear.weapons) : "";
  const xurCatalysts = xur?.gear ? list(xur.gear.catalysts) : "";
  const xurOpening = pick(
    [
      [`Xûr is in the Tower until reset with ${xurWeapons}.`, `Catalysts this week: ${xurCatalysts}.`],
      [`Xûr's back until Tuesday's reset. On the weapon side: ${xurWeapons}.`, `And ${xurCatalysts} for catalysts.`],
      [`This weekend Xûr brings ${xurWeapons}, plus the ${xurCatalysts} catalysts.`, "Full armor list in the image."],
    ],
    3,
  );
  const xurQuestion = pick(
    ["What are you picking up first? 👇", "Anything worth your Strange Coins this week? 👇", "Which one is going home with you? 👇", "Hit or miss this week? 👇"],
    1,
  );
  const xurText = xur?.gear
    ? [xurOpening[0], "", xurOpening[1], "", xurQuestion, "", "#Destiny2 #DestinyTheGame"].join("\n")
    : null;
  const xurReplyText = "Check which of these you're still missing:\nd2collector.site";

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
            rows={9}
            className="w-full resize-y border border-white/[0.16] bg-panel p-3 font-mono text-[13px] leading-relaxed text-bone"
          />
          <p className="text-[12.5px] text-ash">Wording changes every week: tweak the comment so it fits the rotation.</p>
          <h2 className="ui-label mt-2 text-bone!">Reply (with the link)</h2>
          <textarea
            readOnly
            defaultValue={replyText}
            rows={3}
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
              <>
                <p className="border border-[#e07a3f]/60 bg-[#e07a3f]/10 px-4 py-3 text-sm text-bone">
                  ⚠ Xûr&apos;s weapons and catalysts aren&apos;t loaded yet: sign in, then load them from your account.
                </p>
                <XurGearButton />
              </>
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
              <p className="text-[12.5px] text-ash">Wording changes every week: add a highlight (a fan favourite or a standout armor piece) before posting.</p>
              <h2 className="ui-label mt-2 text-bone!">Reply (with the link)</h2>
              <textarea
                readOnly
                defaultValue={xurReplyText}
                rows={3}
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
