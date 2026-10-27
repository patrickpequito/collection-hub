"use client";

import Link from "@/components/app-link";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/detail-page-parts";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { CLASS_LABELS } from "@/lib/armor-sets/constants";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { FireteamGuardian, FireteamList, GuardianSearchResult } from "@/lib/profile/fireteam";
import type { GuardianProfile } from "@/lib/profile/guardian-profile";

type Tab = "clan" | "friends" | "recent";

const TAB_LABELS: Record<Tab, string> = { clan: "Clan", friends: "Bungie friends", recent: "Recent fireteams" };

export const guardianProfileHref = (guardian: { membershipType: number; membershipId: string }) =>
  `/profile/${guardian.membershipType}/${guardian.membershipId}`;

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const minutes = Math.floor((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  const hoursAgo = Math.floor(minutes / 60);
  if (hoursAgo < 24) return `${hoursAgo} h ago`;
  const days = Math.floor(hoursAgo / 24);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function nowText(guardian: FireteamGuardian, tab: Tab) {
  if (tab === "recent") {
    return `${guardian.together ?? 1} ${guardian.together === 1 ? "activity" : "activities"} together · ${timeAgo(guardian.lastSeen)}`;
  }
  if (guardian.online) return guardian.status ?? "Online";
  return guardian.lastSeen ? `Last seen ${timeAgo(guardian.lastSeen)}` : "Offline";
}

function GuardianRow({ guardian, tab }: { guardian: FireteamGuardian; tab: Tab }) {
  const background = bungieIconUrl(guardian.emblemBackgroundPath ?? "");
  const icon = bungieIconUrl(guardian.emblemPath ?? "");
  const href = guardianProfileHref(guardian);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.07] px-3.5 py-2 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,190px)_70px_auto] sm:gap-4">
      <span className="relative hidden h-10 overflow-hidden border border-white/[0.1] bg-[#1a1f27] sm:block">
        {background ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={background} alt="" loading="lazy" className="h-full w-full object-cover object-left" />
        ) : icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" loading="lazy" className="size-10 object-cover" />
        ) : null}
      </span>
      <div className="min-w-0">
        <Link href={href} className="block truncate text-sm text-bone transition hover:text-white">
          {guardian.name}
          {guardian.code ? <span className="text-ash">#{guardian.code}</span> : null}
        </Link>
        <span className="flex items-center gap-1.5 truncate text-[12.5px] text-ash">
          {guardian.mainClass ? <GuardianClassIcon guardianClass={guardian.mainClass} size="xs" /> : null}
          {[guardian.title ? `◆ ${guardian.title}` : null, guardian.mainClass ? `${CLASS_LABELS[guardian.mainClass]} main` : null]
            .filter(Boolean)
            .join(" · ") || "—"}
        </span>
        {/* Phone: status under the name. */}
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ash sm:hidden">
          <span aria-hidden className={`size-2 ${guardian.online ? "bg-[#4fbf73]" : "bg-[#555b63]"}`} />
          {nowText(guardian, tab)}
        </span>
      </div>
      <span className="hidden min-w-0 items-center gap-1.5 truncate text-[12.5px] text-ash sm:flex">
        <span aria-hidden className={`size-2 shrink-0 ${guardian.online ? "bg-[#4fbf73]" : "bg-[#555b63]"}`} />
        <span className="truncate">{nowText(guardian, tab)}</span>
      </span>
      <span className="hidden text-right font-display text-[15px] tabular-nums text-[#e8c860] sm:block">
        {guardian.light !== null ? `◆ ${guardian.light}` : ""}
      </span>
      <div className="flex gap-1.5">
        <Link
          href={href}
          className="inline-flex min-h-7 items-center border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone hover:text-white"
        >
          Profile →
        </Link>
        <Link
          href={`${href}#compare`}
          className="hidden min-h-7 items-center border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone hover:text-white md:inline-flex"
        >
          Compare
        </Link>
      </div>
    </div>
  );
}

function GuardianSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuardianSearchResult[] | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(`/api/profile/search?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((data: { results: GuardianSearchResult[] }) => {
          if (!cancelled) setResults(data.results);
        })
        .catch(() => undefined);
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const showResults = query.trim().length >= 2 && results !== null;
  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find any guardian by Bungie name…"
        className="h-10 w-full border border-white/[0.22] bg-void/60 px-3.5 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
      />
      {showResults ? (
        <div className="absolute inset-x-0 top-11 z-20 max-h-80 overflow-auto border border-hairline bg-[rgb(14_17_22/0.98)]">
          {results.length === 0 ? <p className="px-3.5 py-2.5 text-sm text-ash">No guardians found.</p> : null}
          {results.map((result) => (
            <Link
              key={`${result.membershipType}-${result.membershipId}`}
              href={guardianProfileHref(result)}
              className="block px-3.5 py-2.5 text-sm text-bone transition hover:bg-white/5 hover:text-white"
            >
              {result.name}
              {result.code ? <span className="text-ash">#{result.code}</span> : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const PAGE_SIZE = 25;

/** Clan, Bungie friends and recent fireteam lists, plus Bungie name search. */
export function Fireteam({ preview }: { preview: string | null }) {
  const [tab, setTab] = useState<Tab>("clan");
  const [lists, setLists] = useState<Partial<Record<Tab, FireteamList>>>({});
  const [shown, setShown] = useState(PAGE_SIZE);
  const tabs: Tab[] = preview ? ["clan", "recent"] : ["clan", "friends", "recent"];

  useEffect(() => {
    if (lists[tab]) return;
    let cancelled = false;
    fetch(`/api/profile/fireteam?tab=${tab}${preview ? `&preview=${encodeURIComponent(preview)}` : ""}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: FireteamList) => {
        if (!cancelled) setLists((current) => ({ ...current, [tab]: data }));
      })
      .catch(() => {
        if (!cancelled) {
          setLists((current) => ({ ...current, [tab]: { guardians: [], heading: null, error: "Couldn't load this list." } }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tab, lists, preview]);

  const list = lists[tab];
  return (
    <section id="fireteam" className="min-w-0 scroll-mt-20">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Fireteam</h2>
        <div className="flex flex-wrap gap-1">
          {tabs.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => {
                setTab(value);
                setShown(PAGE_SIZE);
              }}
              className={`inline-flex min-h-7 items-center border px-2.5 font-display text-xs uppercase tracking-[0.12em] transition ${
                tab === value ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
              }`}
            >
              {TAB_LABELS[value]}
              {lists[value] && !lists[value]!.error ? ` · ${lists[value]!.guardians.length}` : ""}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <GuardianSearch />
        <div className="ui-panel">
          {list?.heading ? (
            <div className="border-b border-white/[0.14] px-3.5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.08em] text-bone">
              {list.heading}
            </div>
          ) : null}
          {!list ? <p className="px-3.5 py-4 text-sm text-ash">Loading…</p> : null}
          {list?.error ? <p className="px-3.5 py-4 text-sm text-ash">{list.error}</p> : null}
          {list && !list.error && list.guardians.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-ash">Nobody here yet.</p>
          ) : null}
          {list?.guardians.slice(0, shown).map((guardian) => (
            <GuardianRow key={`${guardian.membershipType}-${guardian.membershipId}`} guardian={guardian} tab={tab} />
          ))}
          {list && list.guardians.length > shown ? (
            <div className="flex justify-end px-3.5 py-2.5">
              <button
                type="button"
                onClick={() => setShown((current) => current + PAGE_SIZE)}
                className="inline-flex min-h-7 items-center border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone"
              >
                Show more
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CompareRow({ label, mine, theirs, format }: { label: string; mine: number; theirs: number; format: (value: number) => string }) {
  const max = Math.max(mine, theirs, 1);
  const youLead = mine >= theirs;
  const theyLead = theirs > mine;
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_96px_minmax(0,1fr)_64px] items-center gap-2 border-b border-white/[0.07] py-2 last:border-b-0 sm:grid-cols-[100px_minmax(0,1fr)_170px_minmax(0,1fr)_100px] sm:gap-3">
      <span className={`text-right text-sm tabular-nums ${youLead ? "text-owned" : "text-bone"}`}>{format(mine)}</span>
      <span className="flex h-1 justify-end bg-white/10">
        <span className={`block h-1 ${youLead ? "bg-owned" : "bg-bone"}`} style={{ width: `${(mine / max) * 100}%` }} />
      </span>
      <span className="ui-label text-center text-[10px]! sm:text-[11px]!">{label}</span>
      <span className="block h-1 bg-white/10">
        <span className={`block h-1 ${theyLead ? "bg-owned" : "bg-bone"}`} style={{ width: `${(theirs / max) * 100}%` }} />
      </span>
      <span className={`text-sm tabular-nums ${theyLead ? "text-owned" : "text-bone"}`}>{format(theirs)}</span>
    </div>
  );
}

const count = (value: number) => Math.round(value).toLocaleString("en-US");

/** You vs. the guardian whose profile is open. */
export function Compare({ me, them }: { me: GuardianProfile; them: GuardianProfile }) {
  const collectionOf = (profile: GuardianProfile, label: string) =>
    profile.collection.find((entry) => entry.label === label)?.owned ?? 0;
  const rows: { label: string; pick: (profile: GuardianProfile) => number; format?: (value: number) => string }[] = [
    { label: "Time played", pick: (profile) => profile.totals.minutesPlayed / 60, format: (value) => `${count(value)} h` },
    { label: "Triumph score", pick: (profile) => profile.totals.triumphs.active ?? 0 },
    { label: "Seals", pick: (profile) => profile.totals.seals.earned },
    { label: "Gilded seals", pick: (profile) => profile.totals.seals.gilded },
    { label: "Collections", pick: (profile) => profile.totals.collections.completed },
    { label: "Raid clears", pick: (profile) => profile.totals.raidClears },
    { label: "Dungeon clears", pick: (profile) => profile.totals.dungeonClears },
    { label: "Exotics", pick: (profile) => collectionOf(profile, "Exotics") },
    { label: "Lore books", pick: (profile) => collectionOf(profile, "Lore books") },
    { label: "PvP K/D", pick: (profile) => profile.combat.pvp.kd ?? 0, format: (value) => value.toFixed(2) },
  ];
  return (
    <section id="compare" className="min-w-0 scroll-mt-20">
      <SectionHeading title="Compare" note={`You vs. ${them.bungieName}`} />
      <div className="ui-panel px-4 py-2">
        <div className="grid grid-cols-[64px_minmax(0,1fr)_96px_minmax(0,1fr)_64px] gap-2 border-b border-white/[0.14] py-2 sm:grid-cols-[100px_minmax(0,1fr)_170px_minmax(0,1fr)_100px] sm:gap-3">
          <span className="col-span-2 truncate text-right font-display text-sm font-semibold uppercase tracking-[0.08em] text-bone">
            You
          </span>
          <span />
          <span className="col-span-2 truncate font-display text-sm font-semibold uppercase tracking-[0.08em] text-bone">
            {them.bungieName}
          </span>
        </div>
        {rows.map((row) => (
          <CompareRow key={row.label} label={row.label} mine={row.pick(me)} theirs={row.pick(them)} format={row.format ?? count} />
        ))}
      </div>
    </section>
  );
}
