"use client";

import Image from "next/image";
import Link from "@/components/app-link";
import { useEffect, useMemo, useState } from "react";
import { useOwnership } from "@/components/client-ownership";
import { CollectionItemIcon } from "@/components/collection-item-icon";
import { StatBlock, StatBlockGrid, StatCount, SectionHeading } from "@/components/detail-page-parts";
import { ProgressBar } from "@/components/home/progress-bar";
import type {
  ArmorSetClass,
  ArmorSetEntry,
  ArmorSetOriginGroup,
  ArmorSetSlot,
} from "@/lib/armor-sets/collection";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";
import type { LootItem } from "@/types/activity-loot";

const GROUPS: { id: ArmorSetOriginGroup; label: string; subgroups?: readonly string[] }[] = [
  { id: "raids", label: "Raids" },
  { id: "dungeons", label: "Dungeons" },
  { id: "seasons", label: "Seasons & episodes" },
  { id: "expansions", label: "Destinations" },
  {
    id: "playlists",
    label: "Playlists",
    subgroups: ["Vanguard Ops", "Crucible", "Gambit", "Iron Banner", "Trials of Osiris"],
  },
  {
    id: "events",
    label: "Events",
    subgroups: ["The Dawning", "Festival of the Lost", "Solstice", "Crimson Days", "Guardian Games"],
  },
  { id: "eververse", label: "Eververse" },
];
const CLASSES: { id: ArmorSetClass; label: string }[] = [
  { id: "hunter", label: "Hunter" },
  { id: "titan", label: "Titan" },
  { id: "warlock", label: "Warlock" },
];
const SLOTS: ArmorSetSlot[] = ["helmet", "gauntlets", "chest", "legs", "classItem"];

type ClassFilter = "all" | ArmorSetClass;
type TypeFilter = "all" | "armor" | "ornament" | "eververse";
type ProgressFilter = "all" | "complete" | "progress" | "none";

const CHIP =
  "inline-flex h-10 items-center border px-3.5 font-display text-sm uppercase tracking-[0.12em] transition";
const SELECT =
  "h-10 border border-white/[0.22] bg-void px-2.5 font-display text-xs uppercase tracking-[0.1em] text-bone/85 focus:border-bone focus:outline-none";

function anchorId(group: string, subgroup?: string) {
  return `sets-${group}${subgroup ? `-${subgroup.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}`;
}

function piecesOf(set: ArmorSetEntry, cls: ClassFilter): LootItem[] {
  const classes = cls === "all" ? CLASSES.map((entry) => entry.id) : [cls];
  return classes.flatMap((id) => Object.values(set.classes[id] ?? {}).filter(Boolean) as LootItem[]);
}

function KindTag({ set }: { set: ArmorSetEntry }) {
  if (set.bonus) {
    return (
      <span className="border border-owned bg-void/75 px-1.5 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] text-owned">
        Armor 3.0
      </span>
    );
  }
  if (set.kind === "ornament") {
    return (
      <span className="bg-bone px-1.5 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] text-void">
        Ornament
      </span>
    );
  }
  if (set.kind === "eververse") {
    return (
      <span className="border border-white/50 bg-void/70 px-1.5 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] text-bone">
        Eververse
      </span>
    );
  }
  return null;
}

function BonusIcon({ bonus, withTooltip }: { bonus: ArmorSetBonus; withTooltip: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      className="relative inline-flex min-w-0 items-center gap-1.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={withTooltip ? 0 : undefined}
    >
      <Image
        src={bungieIconUrl(bonus.iconPath)}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 rounded-full border border-white/30 bg-panel object-contain"
        unoptimized
      />
      <span className="truncate text-xs text-bone/80">
        {bonus.requiredCount} · {bonus.name}
      </span>
      {withTooltip && hover ? (
        <span
          role="tooltip"
          className="absolute left-0 top-8 z-30 w-60 border border-white/30 bg-[#12161c] p-2.5 text-xs leading-snug text-bone/80 shadow-lg"
        >
          <span className="mb-1 block font-medium text-bone">
            {bonus.requiredCount}-piece · {bonus.name}
          </span>
          {bonus.description}
        </span>
      ) : null}
    </span>
  );
}

function ClassBars({
  set,
  cls,
  owned,
  showOwnership,
}: {
  set: ArmorSetEntry;
  cls: ClassFilter;
  owned: (item: LootItem) => boolean;
  showOwnership: boolean;
}) {
  const classes = CLASSES.filter((entry) => set.classes[entry.id] && (cls === "all" || cls === entry.id));
  return (
    <span className="flex gap-2.5">
      {classes.map((entry) => {
        const pieces = Object.values(set.classes[entry.id] ?? {}).filter(Boolean) as LootItem[];
        const have = showOwnership ? pieces.filter(owned).length : null;
        return (
          <span key={entry.id} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex justify-between text-[11px] text-ash">
              <span>{entry.label}</span>
              <span className={have === pieces.length ? "text-owned" : ""}>
                {have === null ? pieces.length : `${have}/${pieces.length}`}
              </span>
            </span>
            <ProgressBar owned={have ?? 0} total={pieces.length} />
          </span>
        );
      })}
    </span>
  );
}

function SetCard({
  set,
  cls,
  owned,
  showOwnership,
  onOpen,
}: {
  set: ArmorSetEntry;
  cls: ClassFilter;
  owned: (item: LootItem) => boolean;
  showOwnership: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="ui-panel flex min-w-0 flex-col transition hover:border-bone">
      <button type="button" onClick={onOpen} className="flex flex-col text-left" aria-label={`Open ${set.name}`}>
        <span className="relative block aspect-video overflow-hidden border-b border-white/[0.12] bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.04)_0_2px,transparent_2px_14px)]">
          {set.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={set.previewUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <span className="absolute left-2.5 top-2.5">
            <KindTag set={set} />
          </span>
        </span>
        <span className="flex flex-col gap-2.5 px-3.5 pb-3 pt-3">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-display text-[17px] font-semibold uppercase tracking-[0.05em] text-bone">
              {set.name}
            </span>
            <span className="truncate text-xs text-ash">{set.originLabel}</span>
          </span>
          <ClassBars set={set} cls={cls} owned={owned} showOwnership={showOwnership} />
        </span>
      </button>
      {set.bonus ? (
        <span className="mx-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-white/[0.08] pb-3 pt-2.5">
          {set.bonus.twoPiece ? <BonusIcon bonus={set.bonus.twoPiece} withTooltip /> : null}
          {set.bonus.fourPiece ? <BonusIcon bonus={set.bonus.fourPiece} withTooltip /> : null}
        </span>
      ) : null}
    </div>
  );
}

function SetDrawer({
  set,
  owned,
  showOwnership,
  onClose,
}: {
  set: ArmorSetEntry;
  owned: (item: LootItem) => boolean;
  showOwnership: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={set.name}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-void/70" />
      <aside className="animate-fade-in relative flex h-full w-full max-w-[30rem] flex-col gap-4 overflow-y-auto border-l border-white/30 bg-[#12161c] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="self-start">
              <KindTag set={set} />
            </span>
            <h2 className="font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.05em] text-bone">
              {set.name}
            </h2>
            <p className="text-[13px] text-ash">{set.originLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-white/[0.22] px-2 py-0.5 text-sm text-ash transition hover:border-bone hover:text-bone"
          >
            ✕
          </button>
        </div>

        {set.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={set.previewUrl} alt={`${set.name} preview`} className="w-full border border-white/[0.18] object-cover" />
        ) : null}

        {set.bonus ? (
          <section className="space-y-3 border border-white/[0.12] p-3">
            <h3 className="ui-label">Set bonuses</h3>
            {[set.bonus.twoPiece, set.bonus.fourPiece].filter(Boolean).map((bonus) => (
              <div key={bonus!.name} className="flex gap-2.5">
                <Image
                  src={bungieIconUrl(bonus!.iconPath)}
                  alt=""
                  width={30}
                  height={30}
                  className="size-[30px] shrink-0 rounded-full border border-white/30 bg-panel object-contain"
                  unoptimized
                />
                <div className="min-w-0">
                  <p className="text-sm text-bone">
                    {bonus!.requiredCount}-piece · {bonus!.name}
                  </p>
                  <p className="text-[13px] leading-snug text-ash">{bonus!.description}</p>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {CLASSES.filter((entry) => set.classes[entry.id]).map((entry) => {
          const slots = set.classes[entry.id] ?? {};
          const pieces = SLOTS.map((slot) => slots[slot]).filter(Boolean) as LootItem[];
          const have = pieces.filter(owned).length;
          return (
            <section key={entry.id} className="space-y-2">
              <h3 className="ui-label text-bone!">
                {entry.label} · {showOwnership ? `${have} / ${pieces.length}` : pieces.length}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {pieces.map((piece) => (
                  <CollectionItemIcon
                    key={piece.itemHash}
                    name={piece.name}
                    iconPath={piece.iconPath}
                    source={piece.source}
                    seasonIconPath={piece.seasonIconPath}
                    owned={owned(piece)}
                    showOwnership={showOwnership}
                    rarity={piece.rarity}
                    itemType={set.kind === "armor" ? "Armor" : "Ornament"}
                    classOrWeaponType={entry.label}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {set.href ? (
          <Link
            href={set.href}
            className="mt-auto inline-flex h-10 shrink-0 items-center justify-center border border-white/[0.22] font-display text-sm uppercase tracking-[0.12em] text-bone transition hover:border-bone"
          >
            Open {set.originLabel.split(" · ")[0]} →
          </Link>
        ) : null}
      </aside>
    </div>
  );
}

/** Armor sets by origin (raids, seasons, playlists…), with ornaments and Eververse apart. */
export function ArmorSetsPage({ sets }: { sets: ArmorSetEntry[] }) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState<ClassFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [progress, setProgress] = useState<ProgressFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const owned = useMemo(
    () => (item: LootItem) =>
      (item.ownershipHashes?.length ? item.ownershipHashes : [item.itemHash]).some((hash) =>
        ownedItemHashes.has(hash),
      ),
    [ownedItemHashes],
  );

  const stats = useMemo(() => {
    const count = (list: ArmorSetEntry[]) => {
      const pieces = list.flatMap((set) => piecesOf(set, cls));
      return { owned: pieces.filter(owned).length, total: pieces.length };
    };
    const counted = sets.filter((set) => set.kind !== "eververse");
    const complete = counted.filter((set) => {
      const pieces = piecesOf(set, cls);
      return pieces.length > 0 && pieces.every(owned);
    }).length;
    return {
      armor: count(sets.filter((set) => set.kind === "armor")),
      ornament: count(sets.filter((set) => set.kind === "ornament")),
      eververse: count(sets.filter((set) => set.kind === "eververse")),
      complete,
      countedSets: counted.filter((set) => piecesOf(set, cls).length > 0).length,
    };
  }, [cls, owned, sets]);

  const needle = query.trim().toLowerCase();
  const visible = sets.filter((set) => {
    if (needle && !`${set.name} ${set.originLabel}`.toLowerCase().includes(needle)) return false;
    if (type !== "all" && set.kind !== type) return false;
    const pieces = piecesOf(set, cls);
    if (pieces.length === 0) return false;
    if (progress !== "all" && showOwnership) {
      const have = pieces.filter(owned).length;
      if (progress === "complete" && have !== pieces.length) return false;
      if (progress === "progress" && (have === 0 || have === pieces.length)) return false;
      if (progress === "none" && have !== 0) return false;
    }
    return true;
  });

  const opened = sets.find((set) => set.id === openId);
  const or = (value: number) => (showOwnership ? value : null);

  const sections = GROUPS.map((group) => {
    const list = visible.filter((set) => set.group === group.id);
    const subgroups = group.subgroups
      ?.map((name) => ({ name, list: list.filter((set) => set.subgroup === name) }))
      .filter((entry) => entry.list.length > 0);
    return { group, list, subgroups };
  }).filter((section) => section.list.length > 0);

  const completeIn = (list: ArmorSetEntry[]) =>
    list.filter((set) => {
      const pieces = piecesOf(set, cls);
      return pieces.length > 0 && pieces.every(owned);
    }).length;

  const cards = (list: ArmorSetEntry[]) => (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((set) => (
        <SetCard
          key={set.id}
          set={set}
          cls={cls}
          owned={owned}
          showOwnership={showOwnership}
          onOpen={() => setOpenId(set.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-7">
      <StatBlockGrid count={4}>
        <StatBlock label="Armor pieces">
          <StatCount owned={or(stats.armor.owned)} total={stats.armor.total} gold />
        </StatBlock>
        <StatBlock label="Sets complete">
          <StatCount owned={or(stats.complete)} total={stats.countedSets} />
        </StatBlock>
        <StatBlock label="Ornament sets">
          <StatCount owned={or(stats.ornament.owned)} total={stats.ornament.total} />
        </StatBlock>
        <StatBlock label="Eververse ornaments">
          <StatCount owned={or(stats.eververse.owned)} total={stats.eververse.total} />
          <span className="text-[13px] text-ash">Not counted in totals</span>
        </StatBlock>
      </StatBlockGrid>

      <div className="ui-panel flex flex-wrap items-center gap-2.5 p-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sets…"
          aria-label="Search sets"
          className="h-10 min-w-0 flex-[1_1_14rem] border border-white/30 bg-transparent px-3 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
        />
        <span className="ui-label">Class</span>
        <div className="flex" role="group" aria-label="Class">
          {([{ id: "all", label: "All" }, ...CLASSES] as { id: ClassFilter; label: string }[]).map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={cls === entry.id}
              onClick={() => setCls(entry.id)}
              className={`${CHIP} ${cls === entry.id ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"}`}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <select aria-label="Type" value={type} onChange={(event) => setType(event.target.value as TypeFilter)} className={SELECT}>
          <option value="all">Type: all</option>
          <option value="armor">Armor</option>
          <option value="ornament">Seasonal ornaments</option>
          <option value="eververse">Eververse ornaments</option>
        </select>
        <select
          aria-label="Progress"
          value={progress}
          disabled={!showOwnership}
          onChange={(event) => setProgress(event.target.value as ProgressFilter)}
          className={`${SELECT} disabled:opacity-40`}
        >
          <option value="all">Progress: any</option>
          <option value="complete">Complete</option>
          <option value="progress">In progress</option>
          <option value="none">Not started</option>
        </select>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          aria-label="Origins"
          className="ui-panel hidden max-h-[calc(100dvh-6rem)] overflow-y-auto py-2 lg:sticky lg:top-20 lg:block"
        >
          <span className="ui-label block px-3 pb-2 pt-1">Browse by origin</span>
          {sections.map(({ group, list, subgroups }) => (
            <div key={group.id}>
              <a
                href={`#${anchorId(group.id)}`}
                className="flex flex-col gap-0.5 border-l-2 border-transparent px-3 py-2 transition hover:border-bone hover:bg-white/[0.03]"
              >
                <span className="flex justify-between gap-2 text-sm text-bone/90">
                  <span>{group.label}</span>
                  <span className="text-xs text-ash">{list.length}</span>
                </span>
                <span className="text-[11px] text-ash">
                  {group.id === "eververse"
                    ? "Not counted"
                    : showOwnership
                      ? `${completeIn(list)} complete`
                      : "Sign in to track"}
                </span>
              </a>
              {subgroups?.map((sub) => (
                <a
                  key={sub.name}
                  href={`#${anchorId(group.id, sub.name)}`}
                  className="flex justify-between gap-2 py-1 pl-6 pr-3 text-[13px] text-bone/75 transition hover:text-bone"
                >
                  <span>{sub.name}</span>
                  <span className="text-xs text-ash">{sub.list.length}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-9">
          {sections.length === 0 ? (
            <p className="border border-dashed border-white/[0.14] px-6 py-10 text-center text-sm text-ash">
              No sets match.
            </p>
          ) : null}
          {sections.map(({ group, list, subgroups }) => (
            <section key={group.id} id={anchorId(group.id)} className="scroll-mt-20 space-y-3">
              <SectionHeading
                title={group.label}
                note={
                  group.id === "eververse"
                    ? `${list.length} sets · not counted in totals`
                    : showOwnership
                      ? `${completeIn(list)} / ${list.length} complete`
                      : `${list.length} sets`
                }
              />
              {group.id === "eververse" ? (
                <p className="text-[13px] text-ash">Ornament sets sold for Silver or Bright Dust, by season.</p>
              ) : null}
              {subgroups
                ? subgroups.map((sub) => (
                    <div key={sub.name} id={anchorId(group.id, sub.name)} className="scroll-mt-20 space-y-2.5">
                      <h3 className="ui-label text-bone!">
                        {sub.name} · {sub.list.length}
                      </h3>
                      {cards(sub.list)}
                    </div>
                  ))
                : cards(list)}
            </section>
          ))}
        </div>
      </div>

      {opened ? (
        <SetDrawer set={opened} owned={owned} showOwnership={showOwnership} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}
