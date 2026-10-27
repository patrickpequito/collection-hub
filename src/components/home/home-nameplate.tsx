"use client";

import Link from "@/components/app-link";
import { useHomeSummary } from "@/components/home/home-summary-provider";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { markOAuthPending } from "@/lib/app-navigation-stack";

function StatTile({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border border-hairline bg-void/70 px-3 py-2.5">
      <span className="ui-label truncate text-[11px]!">{label}</span>
      <span className={`font-display text-2xl leading-none ${gold ? "text-owned" : "text-bone"}`}>{value}</span>
    </div>
  );
}

function SignInWelcome({ oauthConfigured }: { oauthConfigured: boolean }) {
  return (
    <section className="border-b border-hairline bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.025)_0_2px,transparent_2px_14px)]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-end justify-between gap-5 px-4 pb-8 pt-12 sm:px-6">
        <div className="space-y-2.5">
          <p className="ui-label text-owned!">Collection Hub</p>
          <h1 className="text-4xl font-semibold uppercase leading-none tracking-[0.04em] sm:text-[52px]">
            Your Destiny 2 collection
          </h1>
          <p className="max-w-xl text-sm text-bone/70">
            Every weapon, armor set, seal and collection badge. Sign in with Bungie to see what you own and what&apos;s
            left to chase.
          </p>
        </div>
        {oauthConfigured ? (
          <a
            href="/api/auth/bungie?returnTo=%2F"
            onClick={() => markOAuthPending()}
            className="inline-flex h-11 items-center border border-owned px-5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-owned transition hover:bg-owned hover:text-void"
          >
            Sign in with Bungie
          </a>
        ) : null}
      </div>
    </section>
  );
}

/** Full-width emblem header with your name, title, clan and key numbers; a welcome band when signed out. */
export function HomeNameplate({ oauthConfigured }: { oauthConfigured: boolean }) {
  const { signedIn, ready, summary, loading, displayName } = useHomeSummary();
  if (!ready && !summary) return <div aria-hidden className="h-[200px] border-b border-hairline" />;
  if (!signedIn) return <SignInWelcome oauthConfigured={oauthConfigured} />;
  if (!summary) {
    return <div aria-hidden className={`h-[200px] border-b border-hairline bg-panel/60 ${loading ? "animate-pulse" : ""}`} />;
  }

  const { guardian } = summary;
  const background = bungieIconUrl(guardian.emblem.backgroundPath ?? "");
  const icon = bungieIconUrl(guardian.emblem.iconPath ?? "");
  const overlay = bungieIconUrl(guardian.emblem.overlayPath ?? "");
  const count = (owned: number, total: number) => `${owned.toLocaleString("en-US")} / ${total.toLocaleString("en-US")}`;

  return (
    <section className="relative overflow-hidden border-b border-hairline bg-panel">
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={background} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,16,0.88)_30%,rgba(11,13,16,0.35)),linear-gradient(0deg,#0b0d10,transparent_50%)]"
      />
      <div className="relative mx-auto flex min-h-[200px] max-w-[1360px] flex-col justify-end gap-5 px-4 pb-6 pt-8 sm:px-6 xl:flex-row xl:items-end">
        <div className="flex min-w-0 flex-1 items-end gap-5">
          {icon ? (
            <span className="relative block size-16 shrink-0 border border-white/50 sm:size-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {overlay ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={overlay} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : null}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-2">
            <span className="ui-label text-on-art text-[#c7cad0]!">Welcome back</span>
            <h1 className="text-on-art flex flex-wrap items-baseline gap-x-2 font-display text-4xl font-semibold leading-none tracking-[0.04em] text-white sm:text-[42px]">
              {summary.displayName || displayName}
              {guardian.bungieCode ? <span className="text-xl text-ash">#{guardian.bungieCode}</span> : null}
            </h1>
            <div className="flex flex-wrap gap-2">
              {guardian.title ? (
                <span className="inline-flex min-h-8 items-center border border-owned bg-owned/10 px-3 font-display text-xs uppercase tracking-[0.12em] text-owned">
                  ◆ {guardian.title}
                </span>
              ) : null}
              {guardian.clan ? (
                <span className="inline-flex min-h-8 items-center border border-white/[0.22] bg-void/50 px-3 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0]">
                  {guardian.clan.callsign ? `[${guardian.clan.callsign}] ` : ""}
                  {guardian.clan.name}
                </span>
              ) : null}
              {guardian.clan && guardian.clan.onlineCount > 0 ? (
                <Link
                  href="/profile#fireteam"
                  className="inline-flex min-h-8 items-center gap-2 border border-[#4fbf73]/60 bg-void/50 px-3 font-display text-xs uppercase tracking-[0.12em] text-[#8fe0a8] transition hover:border-[#4fbf73]"
                >
                  <span aria-hidden className="size-2 bg-[#4fbf73]" />
                  {guardian.clan.onlineCount} clanmate{guardian.clan.onlineCount === 1 ? "" : "s"} online
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:w-[540px]">
          <StatTile label="Triumph score" value={summary.triumphScore?.toLocaleString("en-US") ?? "—"} gold />
          <StatTile label="Seals" value={count(summary.titles.owned, summary.titles.total)} gold />
          <StatTile label="Collections" value={count(summary.badges.completed, summary.badges.total)} />
          <StatTile label="Exotics" value={count(summary.exotics.owned, summary.exotics.total)} />
        </div>
        <div className="flex gap-2 xl:flex-col">
          <Link
            href="/profile"
            className="inline-flex min-h-9 items-center border border-bone bg-white/[0.06] px-3.5 font-display text-[13px] uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.12]"
          >
            My profile →
          </Link>
        </div>
      </div>
    </section>
  );
}
