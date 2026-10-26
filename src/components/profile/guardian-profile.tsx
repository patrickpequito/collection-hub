"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SectionHeading, StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { ProgressBar } from "@/components/home/progress-bar";
import { CLASS_LABELS } from "@/lib/armor-sets/constants";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ClearsRow, FavoriteEntry, GuardianProfile, WeaponFavorite } from "@/lib/profile/guardian-profile";
import { Compare, Fireteam } from "@/components/profile/fireteam";
import { readSnapshot, writeSnapshot } from "@/lib/local-snapshot";
import { useSession } from "@/lib/use-session";

const number = (value: number) => Math.round(value).toLocaleString("en-US");
const hours = (seconds: number) => number(seconds / 3600);

function duration(ms: number) {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function relativeDay(iso: string | null) {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gold" | "online" }) {
  const toneClass = {
    default: "border-white/[0.22] text-[#c7cad0]",
    gold: "border-owned bg-owned/10 text-owned",
    online: "border-[#4fbf73]/60 text-[#8fe0a8]",
  }[tone];
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 border bg-void/50 px-3 font-display text-xs uppercase tracking-[0.12em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

function Hero({ profile, eyebrow, canCompare }: { profile: GuardianProfile; eyebrow: string; canCompare: boolean }) {
  const [copied, setCopied] = useState(false);
  const background = bungieIconUrl(profile.emblem.backgroundPath ?? "");
  const icon = bungieIconUrl(profile.emblem.iconPath ?? "");
  const overlay = bungieIconUrl(profile.emblem.overlayPath ?? "");
  const copyLink = () => {
    void navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <header className="relative min-h-[300px] w-full overflow-hidden border-b border-hairline bg-panel">
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={background} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,#0b0d10_4%,rgba(11,13,16,0.25)_75%),linear-gradient(90deg,rgba(11,13,16,0.8),transparent_70%)]"
      />
      <div className="relative mx-auto flex min-h-[300px] max-w-5xl flex-col justify-end gap-4 px-4 pb-6 pt-8 sm:px-6">
        <span className="ui-label text-on-art text-[#c7cad0]!">{eyebrow}</span>
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          {icon ? (
            <span className="relative block size-20 shrink-0 border border-white/50 sm:size-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {overlay ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={overlay} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : null}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <h1 className="text-on-art flex flex-wrap items-baseline gap-x-3 font-display text-4xl font-semibold leading-none tracking-[0.04em] text-white sm:text-5xl">
              {profile.bungieName}
              {profile.bungieCode ? <span className="text-2xl text-ash">#{profile.bungieCode}</span> : null}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {profile.title ? (
                <Chip tone="gold">
                  ◆ {profile.title.name}
                  {profile.title.gilded ? <span className="opacity-80">· Gilded</span> : null}
                </Chip>
              ) : null}
              {profile.clan ? (
                <Chip>
                  {profile.clan.callsign ? `[${profile.clan.callsign}] ` : ""}
                  {profile.clan.name}
                </Chip>
              ) : null}
              {profile.guardianRank ? (
                <Chip>
                  Guardian Rank {profile.guardianRank.rank}
                  {profile.guardianRank.name ? ` · ${profile.guardianRank.name}` : ""}
                </Chip>
              ) : null}
              {profile.platform ? <Chip>{profile.platform}</Chip> : null}
              {profile.online ? (
                <Chip tone="online">
                  <span aria-hidden className="size-2 bg-[#4fbf73]" />
                  Online · {profile.online.activity}
                </Chip>
              ) : (
                <Chip>Last played {relativeDay(profile.dateLastPlayed)}</Chip>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex min-h-9 items-center border border-bone bg-white/[0.06] px-3.5 font-display text-[13px] uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.12]"
            >
              {copied ? "Link copied" : "Copy profile link"}
            </button>
            {canCompare ? (
              <a
                href="#compare"
                className="inline-flex min-h-9 items-center border border-white/[0.3] bg-void/50 px-3.5 font-display text-[13px] uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone hover:text-white"
              >
                Compare with you
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeadlineStats({ profile }: { profile: GuardianProfile }) {
  const { totals } = profile;
  const days = totals.minutesPlayed / 1440;
  return (
    <StatBlockGrid count={5}>
      <StatBlock label="Time played">
        <span className="font-display text-[30px] leading-none text-bone">{number(totals.minutesPlayed / 60)} h</span>
        <span className="text-[12.5px] text-ash">
          ≈ {number(days)} days across {profile.characters.length} characters
        </span>
      </StatBlock>
      <StatBlock label="Active triumph score">
        <span className="font-display text-[30px] leading-none text-owned">
          {totals.triumphs.active !== null ? number(totals.triumphs.active) : "—"}
        </span>
        <span className="text-[12.5px] text-ash">
          Lifetime {totals.triumphs.lifetime !== null ? number(totals.triumphs.lifetime) : "—"}
          {totals.triumphs.legacy !== null ? ` · Legacy ${number(totals.triumphs.legacy)}` : ""}
        </span>
      </StatBlock>
      <StatBlock label="Seals">
        <StatCount owned={totals.seals.earned} total={totals.seals.total} gold />
        <span className="text-[12.5px] text-ash">{totals.seals.gilded} gilded</span>
      </StatBlock>
      <StatBlock label="Collections">
        <StatCount owned={totals.collections.completed} total={totals.collections.total} />
        <span className="text-[12.5px] text-ash">{totals.collections.gilded} gilded (all 3 classes)</span>
      </StatBlock>
      <StatBlock label="Raid clears">
        <span className="font-display text-[30px] leading-none text-bone">{number(totals.raidClears)}</span>
        <span className="text-[12.5px] text-ash">+ {number(totals.dungeonClears)} dungeon clears</span>
      </StatBlock>
    </StatBlockGrid>
  );
}

function Characters({ profile }: { profile: GuardianProfile }) {
  const total = Math.max(1, profile.totals.minutesPlayed);
  const mainId = [...profile.characters].sort((a, b) => b.minutesPlayed - a.minutesPlayed)[0]?.characterId;
  return (
    <section id="characters" className="min-w-0 scroll-mt-20">
      <SectionHeading title="Characters" />
      <div className="grid gap-3 md:grid-cols-3">
        {profile.characters.map((character) => {
          const share = Math.round((character.minutesPlayed / total) * 100);
          const background = bungieIconUrl(character.emblemBackgroundPath ?? "");
          const main = character.characterId === mainId;
          return (
            <div
              key={character.characterId}
              className={`flex min-w-0 flex-col border bg-panel/85 ${main ? "border-white/40" : "border-hairline"}`}
            >
              <div className="relative h-24 overflow-hidden">
                {background ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover object-left" />
                ) : null}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent from-20% to-void/55" />
                <div className="absolute left-[92px] top-3.5 flex min-w-0 flex-col gap-0.5">
                  <span className="text-on-art font-display text-2xl font-semibold uppercase tracking-[0.05em] text-white">
                    {CLASS_LABELS[character.guardianClass]}
                  </span>
                  <span className="text-on-art truncate text-[13px] text-bone/90">
                    {[character.race, character.title].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {character.light !== null ? (
                  <span className="text-on-art absolute right-3.5 top-3 font-display text-2xl text-[#e8c860]">
                    ◆ {character.light}
                  </span>
                ) : null}
                {main ? (
                  <span className="absolute bottom-2.5 right-3.5 border border-owned bg-void/70 px-1.5 py-px font-display text-[11px] uppercase tracking-[0.12em] text-owned">
                    Main
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <GuardianClassIcon guardianClass={character.guardianClass} size="xs" />
                    {number(character.minutesPlayed / 60)} h played
                  </span>
                  <span className="text-[12.5px] tabular-nums text-ash">{share}% of total</span>
                </div>
                <ProgressBar owned={share} total={100} tone="completion" className="[&>span]:bg-bone!" />
                <div className="flex justify-between gap-2 text-[12.5px] text-ash">
                  <span>Last played {relativeDay(character.dateLastPlayed)}</span>
                  {character.favoriteExotic ? <span className="truncate">Favorite: {character.favoriteExotic}</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type Mode = "clears" | "time";

function FavoriteTile({
  eyebrow,
  entry,
  lines,
}: {
  eyebrow: string;
  entry: FavoriteEntry | null;
  lines: (entry: FavoriteEntry) => [string, string?];
}) {
  const content = entry ? (
    <>
      {entry.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.95)_5%,rgba(11,13,16,0.35)_60%,rgba(11,13,16,0.1))]"
      />
      <span className="ui-label text-on-art relative text-[#e8c860]!">{eyebrow}</span>
      <span className="text-on-art relative font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.05em] text-white">
        {entry.name}
      </span>
      <span className="text-on-art relative text-sm text-bone">{lines(entry)[0]}</span>
      {lines(entry)[1] ? <span className="text-on-art relative text-[12.5px] text-[#c7cad0]">{lines(entry)[1]}</span> : null}
    </>
  ) : (
    <>
      <span className="ui-label text-[#e8c860]!">{eyebrow}</span>
      <span className="text-sm text-ash">Not enough data yet</span>
    </>
  );
  const className =
    "group relative flex min-h-[190px] flex-col justify-end gap-1 overflow-hidden border border-white/[0.18] bg-panel px-4 py-3.5";
  return entry?.href ? (
    <Link href={entry.href} className={`${className} transition hover:border-bone/60`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function WeaponTile({ eyebrow, weapon, exotic }: { eyebrow: string; weapon: WeaponFavorite | null; exotic: boolean }) {
  const icon = bungieIconUrl(weapon?.iconPath ?? "");
  const className = `group relative flex min-h-[190px] flex-col justify-end gap-3 overflow-hidden border border-white/[0.18] px-4 py-3.5 ${
    exotic ? "bg-[linear-gradient(135deg,#2a2412,#12161c)]" : "bg-[linear-gradient(135deg,#241a2e,#12161c)]"
  }`;
  const content = (
    <>
      <span className="ui-label text-[#e8c860]!">{eyebrow}</span>
      {weapon ? (
        <div className="flex items-center gap-3">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon}
              alt=""
              className={`size-16 shrink-0 border-2 ${weapon.rarity === "Exotic" ? "border-[#ceae33]" : "border-[#522f65]"}`}
            />
          ) : null}
          <div className="min-w-0">
            <span className="block truncate font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.05em] text-white">
              {weapon.name}
            </span>
            <span className="block text-sm text-bone">{number(weapon.kills)} kills</span>
            <span className="block text-[12.5px] text-[#c7cad0]">
              {exotic && weapon.precisionKills !== undefined && weapon.kills > 0
                ? `${Math.round((weapon.precisionKills / weapon.kills) * 100)}% precision · ${weapon.itemType}`
                : `Kill tracker · ${weapon.itemType}`}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-ash">{exotic ? "Not enough data yet" : "No weapon with a kill tracker"}</span>
      )}
    </>
  );
  return weapon?.href ? (
    <Link href={weapon.href} className={`${className} transition hover:border-bone/60`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Favorites({ profile }: { profile: GuardianProfile }) {
  const [mode, setMode] = useState<Mode>("clears");
  const pick = (pair: { byClears: FavoriteEntry | null; byTime: FavoriteEntry | null }) =>
    mode === "clears" ? pair.byClears : pair.byTime;
  const clearLines = (entry: FavoriteEntry): [string, string?] => [
    `${number(entry.clears)} clears · ${hours(entry.seconds)} h inside`,
    entry.fastestMs ? `Fastest clear ${duration(entry.fastestMs)}` : undefined,
  ];
  const { favorites } = profile;
  return (
    <section id="favorites" className="min-w-0 scroll-mt-20">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Favorites</h2>
        <div className="flex gap-1">
          {(["clears", "time"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`inline-flex min-h-7 items-center border px-2.5 font-display text-xs uppercase tracking-[0.12em] transition ${
                mode === value ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
              }`}
            >
              {value === "clears" ? "By clears" : "By time played"}
            </button>
          ))}
        </div>
      </div>
      {/* Column order: raid / dungeon, playlist / patrol zone, weapon / exotic weapon. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-flow-col lg:grid-cols-3 lg:grid-rows-2">
        <FavoriteTile eyebrow="Favorite raid" entry={pick(favorites.raid)} lines={clearLines} />
        <FavoriteTile eyebrow="Favorite dungeon" entry={pick(favorites.dungeon)} lines={clearLines} />
        <FavoriteTile
          eyebrow="Favorite playlist"
          entry={pick(favorites.playlist)}
          lines={(entry) => [`${hours(entry.seconds)} h · ${number(entry.clears)} matches`]}
        />
        <FavoriteTile
          eyebrow="Favorite patrol zone"
          entry={favorites.patrol}
          lines={(entry) => [`${hours(entry.seconds)} h on patrol`]}
        />
        <WeaponTile eyebrow="Favorite weapon" weapon={favorites.weapon} exotic={false} />
        <WeaponTile eyebrow="Favorite exotic weapon" weapon={favorites.exotic} exotic />
      </div>
    </section>
  );
}

type FactIconName = "stopwatch" | "tower" | "revive" | "precision" | "distance" | "skull" | "flag" | "orb";

/** Solid glyphs drawn on a 24px grid so every fun fact icon has the same optical weight. */
const FACT_ICON_PATHS: Record<FactIconName, ReactNode> = {
  stopwatch: (
    <>
      <path d="M9 1.5h6v2.2H9z" />
      <path
        fillRule="evenodd"
        d="M12 4.5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm1.2 4h-2.4v5.2l3.9 2.6 1.3-2-2.8-1.9Z"
      />
    </>
  ),
  tower: (
    <path
      fillRule="evenodd"
      d="M10 1h4l1.5 5H18v3h-1.5v11H19v3H5v-3h2.5V9H6V6h2.5Zm.5 10v3.5h3V11Z"
    />
  ),
  revive: <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7Z" />,
  precision: (
    <path
      fillRule="evenodd"
      d="M11 1h2v2.6A8.5 8.5 0 0 1 20.4 11H23v2h-2.6a8.5 8.5 0 0 1-7.4 7.4V23h-2v-2.6A8.5 8.5 0 0 1 3.6 13H1v-2h2.6A8.5 8.5 0 0 1 11 3.6V1Zm1 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
    />
  ),
  distance: <path d="M14 2h8v8l-3-3-9.5 9.5-2.5-2.5L16.5 4.5Zm-12 15 5 5H2Z" />,
  skull: (
    <path
      fillRule="evenodd"
      d="M12 1.5c5.2 0 9 3.6 9 8.6 0 3-1.4 5.1-3.5 6.3V20a1.5 1.5 0 0 1-1.5 1.5h-1.2v-2.5h-1.6v2.5h-2.4v-2.5H9.2v2.5H8A1.5 1.5 0 0 1 6.5 20v-3.6C4.4 15.2 3 13.1 3 10.1c0-5 3.8-8.6 9-8.6Zm-3.6 8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm7.2 0a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm-3.6 4.6-1.2 2.4h2.4Z"
    />
  ),
  flag: <path d="M4 1.5h2V3h13l-2.5 5 2.5 5H6v9.5H4Z" />,
  orb: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 1l1.2 3.2h-2.4Zm0 22-1.2-3.2h2.4ZM1 12l3.2-1.2v2.4Zm22 0-3.2 1.2v-2.4Z" />
    </>
  ),
};

function FactIcon({ name }: { name: FactIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-9 shrink-0 fill-owned">
      {FACT_ICON_PATHS[name]}
    </svg>
  );
}

function FunFacts({ profile }: { profile: GuardianProfile }) {
  const { facts, totals } = profile;
  const totalSeconds = Math.max(1, totals.minutesPlayed * 60);
  const items: { icon: FactIconName; value: string; text: string }[] = [
    {
      icon: "stopwatch" as const,
      value: `${number(facts.raidSeconds / 86400)} days`,
      text: `spent inside raids. That's ${Math.round((facts.raidSeconds / totalSeconds) * 100)}% of your play time.`,
    },
    {
      icon: "tower" as const,
      value: `${hours(facts.towerSeconds)} h`,
      text: "hanging out in the Tower.",
    },
    { icon: "revive" as const, value: number(facts.resurrections), text: "teammates revived. Your fireteams owe you." },
    ...(facts.precisionPercent !== null
      ? [{ icon: "precision" as const, value: `${facts.precisionPercent}%`, text: "of your PvE kills are precision kills." }]
      : []),
    ...(facts.longestKillDistance
      ? [{ icon: "distance" as const, value: `${number(facts.longestKillDistance)} m`, text: "longest kill distance." }]
      : []),
    {
      icon: "skull" as const,
      value: number(facts.deaths),
      text: facts.secondsPerDeath
        ? `deaths. About one every ${Math.max(1, Math.round(facts.secondsPerDeath / 60))} minutes in game.`
        : "deaths.",
    },
    { icon: "flag" as const, value: number(facts.publicEvents), text: "public events completed." },
    { icon: "orb" as const, value: number(facts.orbsDropped), text: "orbs of power generated." },
  ];
  return (
    <section id="facts" className="min-w-0 scroll-mt-20">
      <SectionHeading title="Fun facts" note="From your lifetime stats" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.text} className="ui-panel flex items-start gap-3.5 px-4 py-3.5">
            <FactIcon name={item.icon} />
            <div className="min-w-0">
              <span className="block font-display text-[22px] font-semibold leading-[1.1] text-bone">{item.value}</span>
              <span className="block text-[13px] leading-[1.3] text-[#a8adb5]">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const LEDGER_PREVIEW = 6;

function Clears({ profile }: { profile: GuardianProfile }) {
  const [tab, setTab] = useState<"raids" | "dungeons">("raids");
  const [showAll, setShowAll] = useState(false);
  const rows: ClearsRow[] = profile.clears[tab];
  const visible = showAll ? rows : rows.slice(0, LEDGER_PREVIEW);
  const max = Math.max(1, ...rows.map((row) => row.clears));
  return (
    <section id="clears" className="min-w-0 scroll-mt-20">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Raid &amp; dungeon clears</h2>
        <div className="flex gap-1">
          {(["raids", "dungeons"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => {
                setTab(value);
                setShowAll(false);
              }}
              className={`inline-flex min-h-7 items-center border px-2.5 font-display text-xs uppercase tracking-[0.12em] transition ${
                tab === value ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
              }`}
            >
              {value === "raids" ? `Raids · ${number(profile.totals.raidClears)}` : `Dungeons · ${number(profile.totals.dungeonClears)}`}
            </button>
          ))}
        </div>
      </div>
      <div className="ui-panel">
        <div className="hidden grid-cols-[120px_minmax(0,1fr)_80px_80px_150px] gap-4 border-b border-white/[0.14] px-3.5 py-2.5 sm:grid">
          <span />
          <span className="ui-label text-[11px]!">{tab === "raids" ? "Raid" : "Dungeon"}</span>
          <span className="ui-label text-right text-[11px]!">Clears</span>
          <span className="ui-label text-right text-[11px]!">Time</span>
          <span className="ui-label text-[11px]!">Best</span>
        </div>
        {visible.length === 0 ? <p className="px-3.5 py-4 text-sm text-ash">No clears yet.</p> : null}
        {visible.map((row) => {
          const body = (
            <>
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className="hidden h-11 w-[120px] border border-white/[0.14] object-cover sm:block" />
              ) : (
                <span className="hidden sm:block" />
              )}
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="truncate text-sm text-bone">{row.name}</span>
                <span className="block h-1 bg-white/10">
                  <span className="block h-1 bg-bone" style={{ width: `${(row.clears / max) * 100}%` }} />
                </span>
              </div>
              <span className="text-right text-[15px] tabular-nums text-bone">{number(row.clears)}</span>
              <span className="text-right text-[13px] tabular-nums text-ash">{hours(row.seconds)} h</span>
              <span className="flex flex-wrap gap-1">
                {row.masterClears > 0 ? (
                  <span className="border border-owned px-1.5 py-px font-display text-[11px] uppercase tracking-[0.12em] text-owned">
                    Master · {number(row.masterClears)}
                  </span>
                ) : null}
                {row.fastestMs ? (
                  <span className="border border-white/25 px-1.5 py-px font-display text-[11px] uppercase tracking-[0.12em] text-[#c7cad0]">
                    {duration(row.fastestMs)}
                  </span>
                ) : null}
              </span>
            </>
          );
          const rowClass =
            "grid grid-cols-[minmax(0,1fr)_60px_60px] items-center gap-3 border-b border-white/[0.07] px-3.5 py-2 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_80px_80px_150px] sm:gap-4 [&>span:last-child]:hidden sm:[&>span:last-child]:flex";
          return row.href ? (
            <Link key={row.slug} href={row.href} className={`${rowClass} transition hover:bg-white/[0.03]`}>
              {body}
            </Link>
          ) : (
            <div key={row.slug} className={rowClass}>
              {body}
            </div>
          );
        })}
        {rows.length > LEDGER_PREVIEW ? (
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[12.5px] text-ash">{showAll ? "" : `+ ${rows.length - LEDGER_PREVIEW} more`}</span>
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="inline-flex min-h-7 items-center border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone"
            >
              {showAll ? "Show less" : "Show all"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CombatColumn({ title, accent, rows }: { title: string; accent: string; rows: [string, string][] }) {
  return (
    <div className="ui-panel flex flex-col gap-2.5 p-4" style={{ borderTop: `2px solid ${accent}` }}>
      <span className="font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-bone">{title}</span>
      <div>
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-white/[0.07] py-1.5 text-sm last:border-b-0">
            <span className="text-[#a8adb5]">{label}</span>
            <span className="tabular-nums text-bone">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Combat({ profile }: { profile: GuardianProfile }) {
  const { pve, pvp, gambit } = profile.combat;
  const rate = (wins: number, matches: number) => (matches > 0 ? ` · ${Math.round((wins / matches) * 100)}%` : "");
  return (
    <section id="combat" className="min-w-0 scroll-mt-20">
      <SectionHeading title="Combat record" note="Lifetime · all characters" />
      <div className="grid gap-3 md:grid-cols-3">
        <CombatColumn
          title="PvE"
          accent="#e9e7e2"
          rows={[
            ["Kills", number(pve.kills)],
            ["Activities cleared", number(pve.activitiesCleared)],
            ["Precision kills", pve.precisionPercent !== null ? `${pve.precisionPercent}%` : "—"],
            ["Public events", number(pve.publicEvents)],
            ["Orbs generated", number(pve.orbsDropped)],
          ]}
        />
        <CombatColumn
          title="PvP · Crucible & Trials"
          accent="#b8473b"
          rows={[
            ["K/D", pvp.kd !== null ? pvp.kd.toFixed(2) : "—"],
            ["KDA", pvp.kda !== null ? pvp.kda.toFixed(2) : "—"],
            ["Matches won", `${number(pvp.wins)}${rate(pvp.wins, pvp.matches)}`],
            ["Best kill streak", number(pvp.bestStreak)],
            ["Trials wins", number(pvp.trialsWins)],
          ]}
        />
        <CombatColumn
          title="Gambit"
          accent="#3fa66b"
          rows={[
            ["Matches won", `${number(gambit.wins)}${rate(gambit.wins, gambit.matches)}`],
            ["Motes banked", number(gambit.motesDeposited)],
            ["Invader kills", number(gambit.invaderKills)],
            ["Primevals slain", number(gambit.primevalKills)],
            ["Blockers sent", number(gambit.blockersSent)],
          ]}
        />
      </div>
    </section>
  );
}

function CollectionProgress({ profile }: { profile: GuardianProfile }) {
  return (
    <section id="collection" className="min-w-0 scroll-mt-20">
      <SectionHeading title="Collection progress" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {profile.collection.map((entry) => (
          <Link
            key={entry.label}
            href={entry.href}
            className="ui-panel flex flex-col gap-2 px-3.5 py-3 transition hover:border-bone/60"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-bone">{entry.label}</span>
              <span className="text-[12.5px] tabular-nums text-ash">
                {number(entry.owned)} / {number(entry.total)}
              </span>
            </span>
            <ProgressBar owned={entry.owned} total={entry.total} />
          </Link>
        ))}
      </div>
    </section>
  );
}

const SECTIONS = [
  { id: "characters", label: "Overview" },
  { id: "favorites", label: "Favorites" },
  { id: "clears", label: "Raids & dungeons" },
  { id: "combat", label: "Combat" },
  { id: "collection", label: "Collection" },
];

function SignInPrompt() {
  const pathname = usePathname();
  return (
    <section className="ui-panel flex flex-col items-start gap-3 p-6">
      <span className="ui-label">Guardian profile</span>
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.05em] text-bone">Sign in to see your profile</h1>
      <p className="max-w-xl text-sm text-ash">
        Time played, favorite raid and dungeon, clears, combat record and collection progress come from your Bungie account.
      </p>
      <a
        href={`/api/auth/bungie?returnTo=${encodeURIComponent(pathname)}`}
        className="inline-flex min-h-10 items-center border border-bone bg-white/[0.06] px-4 font-display text-sm uppercase tracking-[0.12em] text-white transition hover:bg-white/[0.12]"
      >
        Sign in with Bungie
      </a>
    </section>
  );
}

type ProfileState = {
  profile: GuardianProfile | null;
  /** Your own profile, loaded on another guardian's page for Compare. */
  me: GuardianProfile | null;
  /** "own" = /profile; "guardian" = someone else's public profile. */
  mode: "own" | "guardian";
  /** Dev preview (?preview=type:id) passed on to the fireteam lists. */
  preview: string | null;
  error: string | null;
  loading: boolean;
  /** Signed out (and not a dev preview): show the sign-in prompt. */
  signedOut: boolean;
};

const ProfileContext = createContext<ProfileState>({
  profile: null,
  me: null,
  mode: "own",
  preview: null,
  error: null,
  loading: true,
  signedOut: false,
});

type ProfileResponse = { profile: GuardianProfile | null; error: string | null };

/** Loads the profile once for the header and the page body. */
export function ProfileDataProvider({
  children,
  guardian,
}: {
  children: ReactNode;
  /** Someone else's profile; omitted on your own /profile page. */
  guardian?: { membershipType: number; membershipId: string };
}) {
  const session = useSession();
  const [state, setState] = useState<{ profile: GuardianProfile | null; error: string | null; loading: boolean }>({
    profile: null,
    error: null,
    loading: true,
  });
  const [me, setMe] = useState<GuardianProfile | null>(null);

  // Local development: /profile?preview=3:4611… loads a public profile without signing in.
  const [preview] = useState(() =>
    typeof window === "undefined" || guardian ? null : new URLSearchParams(window.location.search).get("preview"),
  );
  const guardianKey = guardian ? `${guardian.membershipType}:${guardian.membershipId}` : null;

  useEffect(() => {
    // The session hint (signed in on this browser) is enough to start; no need to wait for the check.
    if (!guardianKey && !preview && !session.signedIn) return;
    let cancelled = false;
    const [type, id] = guardianKey?.split(":") ?? [];
    const url = guardianKey
      ? `/api/profile/guardian?type=${type}&id=${id}`
      : `/api/profile/overview${preview ? `?preview=${encodeURIComponent(preview)}` : ""}`;
    // Last saved copy first (yours in this browser, other guardians for this visit), then refresh.
    const cacheKey = preview
      ? null
      : guardianKey
        ? `guardian:${guardianKey}`
        : session.membershipId
          ? `profile:${session.membershipId}`
          : null;
    const cacheKind = guardianKey ? "session" : "local";
    const cached = cacheKey ? readSnapshot<GuardianProfile>(cacheKey, cacheKind) : null;
    if (cached) {
      void Promise.resolve().then(() => {
        if (!cancelled) setState((current) => (current.profile ? current : { profile: cached, error: null, loading: false }));
      });
    }
    fetch(url, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: ProfileResponse) => {
        if (cancelled) return;
        if (data.profile && cacheKey) writeSnapshot(cacheKey, data.profile, cacheKind);
        // Keep the saved copy on screen if Bungie fails this time.
        setState((current) => ({
          profile: data.profile ?? current.profile,
          error: data.profile ? null : data.error,
          loading: false,
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setState((current) => ({ profile: current.profile, error: "Couldn't load this profile.", loading: false }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [guardianKey, preview, session.signedIn, session.membershipId]);

  // On another guardian's page, your own numbers drive the Compare section.
  useEffect(() => {
    if (!guardianKey || !session.signedIn) return;
    let cancelled = false;
    const ownKey = session.membershipId ? `profile:${session.membershipId}` : null;
    const cachedMe = ownKey ? readSnapshot<GuardianProfile>(ownKey) : null;
    if (cachedMe) {
      void Promise.resolve().then(() => {
        if (!cancelled) setMe((current) => current ?? cachedMe);
      });
    }
    fetch("/api/profile/overview", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: ProfileResponse) => {
        if (cancelled || !data.profile) return;
        if (ownKey) writeSnapshot(ownKey, data.profile);
        setMe(data.profile);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [guardianKey, session.signedIn, session.membershipId]);

  const signedOut = !guardianKey && !preview && session.ready && !session.signedIn;
  const value: ProfileState = {
    ...state,
    me,
    mode: guardianKey ? "guardian" : "own",
    preview,
    loading: !signedOut && !state.profile && (state.loading || (!guardianKey && !preview && !session.ready)),
    signedOut,
  };
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

/** Full-width emblem header (placeholder while loading, nothing when signed out). */
export function ProfileHeader() {
  const { profile, loading, mode, me } = useContext(ProfileContext);
  if (profile) return <Hero profile={profile} eyebrow={mode === "own" ? "Guardian profile" : "Guardian"} canCompare={Boolean(me)} />;
  if (loading) return <div aria-hidden className="h-[300px] w-full animate-pulse border-b border-hairline bg-panel/60" />;
  return null;
}

/** Profile sections under the header (sections 2–8 of the profile design). */
export function GuardianProfileBody() {
  const { profile, me, mode, preview, error, loading, signedOut } = useContext(ProfileContext);

  if (signedOut) return <SignInPrompt />;
  if (loading) {
    return (
      <div className="space-y-6" aria-busy>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse border border-hairline bg-panel/60" />
          ))}
        </div>
        <p className="text-sm text-ash">Loading your profile from Bungie…</p>
      </div>
    );
  }
  if (!profile) {
    return <p className="ui-panel p-5 text-sm text-ash">{error ?? "No Destiny 2 profile found for this account."}</p>;
  }

  return (
    <div className="space-y-8">
      <HeadlineStats profile={profile} />
      <nav aria-label="Profile sections" className="flex flex-wrap gap-2">
        {[
          ...SECTIONS,
          ...(mode === "own" ? [{ id: "fireteam", label: "Fireteam" }] : []),
          ...(mode === "guardian" && me ? [{ id: "compare", label: "Compare" }] : []),
        ].map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex h-10 items-center border border-white/[0.22] px-4 font-display text-sm uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-white"
          >
            {section.label}
          </a>
        ))}
      </nav>
      <Characters profile={profile} />
      <Favorites profile={profile} />
      <FunFacts profile={profile} />
      <Clears profile={profile} />
      <Combat profile={profile} />
      <CollectionProgress profile={profile} />
      {mode === "own" ? <Fireteam preview={preview} /> : null}
      {mode === "guardian" && me ? <Compare me={me} them={profile} /> : null}
    </div>
  );
}
