"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { ClassToggle } from "@/components/class-toggle";
import { useOwnership } from "@/components/client-ownership";
import { BoxHeading, SectionHeading, StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { ProgressBar } from "@/components/home/progress-bar";
import { LootItemGrid } from "@/components/loot-section";
import { CLASS_LABELS, GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { CollectionEntry, CollectionGroup } from "@/lib/collections/load";
import type { LootItem } from "@/types/activity-loot";
import type { GuardianClass } from "@/types/armor-set";

type Status = "all" | "incomplete" | "completed" | "gilded";

type ClassProgress = Record<GuardianClass, { owned: number; total: number }>;

const ARMOR_TYPE = /^(Helmet|Gauntlets|Chest Armor|Leg Armor|Hunter Cloak|Titan Mark|Warlock Bond)$/;

const ownershipOf = (item: LootItem) => item.ownershipHashes ?? [item.itemHash];

const classList = (entry: CollectionEntry, guardianClass: GuardianClass) => [
  ...entry.weapons,
  ...entry.classItems[guardianClass],
  ...entry.other,
];

/** Owned / total per class (in game, one complete class completes the badge). */
function classProgress(entry: CollectionEntry, owns: (item: LootItem) => boolean): ClassProgress {
  return Object.fromEntries(
    GUARDIAN_CLASSES.map((guardianClass) => {
      const items = classList(entry, guardianClass);
      return [guardianClass, { owned: items.filter(owns).length, total: items.length }];
    }),
  ) as ClassProgress;
}

const completeClasses = (progress: ClassProgress) =>
  GUARDIAN_CLASSES.filter((guardianClass) => progress[guardianClass].owned >= progress[guardianClass].total).length;

/** Cards per row, matching the grid breakpoints (the open card's items go under its row). */
function useColumns() {
  const [columns, setColumns] = useState(4);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const medium = window.matchMedia("(min-width: 640px)");
    const update = () => setColumns(wide.matches ? 4 : medium.matches ? 3 : 2);
    update();
    wide.addEventListener("change", update);
    medium.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      medium.removeEventListener("change", update);
    };
  }, []);
  return columns;
}

function ClassPips({ progress, showOwnership }: { progress: ClassProgress; showOwnership: boolean }) {
  return (
    <span className="grid grid-cols-3 gap-2">
      {GUARDIAN_CLASSES.map((guardianClass) => {
        const { owned, total } = progress[guardianClass];
        const done = showOwnership && owned >= total;
        return (
          <span
            key={guardianClass}
            title={showOwnership ? `${CLASS_LABELS[guardianClass]} ${owned} / ${total}` : CLASS_LABELS[guardianClass]}
            className={`flex min-w-0 items-center gap-1.5 ${done ? "" : "opacity-70"}`}
          >
            <GuardianClassIcon guardianClass={guardianClass} size="xs" />
            <span className="block h-[3px] min-w-0 flex-1 bg-white/12">
              <span
                className={`block h-[3px] ${done ? "bg-owned" : "bg-bone/80"}`}
                style={{ width: `${showOwnership && total ? (owned / total) * 100 : 0}%` }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function CollectionCard({
  entry,
  progress,
  showOwnership,
  open,
  onToggle,
}: {
  entry: CollectionEntry;
  progress: ClassProgress;
  showOwnership: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const full = completeClasses(progress);
  const state = !showOwnership ? "neutral" : full === 3 ? "gilded" : full > 0 ? "done" : "open";
  const frame = {
    neutral: "border-hairline",
    open: "border-hairline",
    done: "border-owned/70",
    gilded:
      "border-owned shadow-[0_0_0_1px_#c9a227,0_0_22px_rgba(201,162,39,0.35)] bg-[linear-gradient(rgba(201,162,39,0.10),rgba(201,162,39,0.10))]",
  }[state];
  const iconUrl = bungieIconUrl(entry.iconPath);

  return (
    <button
      type="button"
      id={entry.slug}
      onClick={onToggle}
      aria-expanded={open}
      className={`group relative flex min-w-0 scroll-mt-24 flex-col border bg-panel/85 text-left transition hover:border-bone/60 ${frame} ${
        open ? "outline-2 outline-offset-[3px] outline-bone" : ""
      }`}
    >
      <span className="relative block aspect-[208/126] overflow-hidden border-b border-white/10">
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition ${state === "open" ? "brightness-[0.7] saturate-[0.35] group-hover:brightness-90 group-hover:saturate-100" : ""}`}
          />
        ) : null}
        {state === "gilded" ? (
          <span className="absolute right-2 top-2 bg-owned px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-void">
            3 / 3 classes
          </span>
        ) : state === "done" ? (
          <span className="absolute right-2 top-2 border border-owned bg-void/80 px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] text-owned">
            Completed
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={`font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.06em] ${
              state === "gilded" ? "text-[#e8c860]" : state === "done" ? "text-owned" : "text-bone"
            }`}
          >
            {entry.name}
          </span>
          {showOwnership ? <span className="shrink-0 font-display text-[13px] tabular-nums text-ash">{full}/3</span> : null}
        </span>
        {entry.subtitle ? <span className="-mt-1.5 text-[12.5px] text-ash">{entry.subtitle}</span> : null}
        <ClassPips progress={progress} showOwnership={showOwnership} />
      </span>
      {open ? (
        <span
          aria-hidden
          className="absolute -bottom-[19px] left-1/2 z-10 size-3.5 -translate-x-1/2 rotate-45 border-l border-t border-white/30 bg-panel"
        />
      ) : null}
    </button>
  );
}

function ItemBlock({ title, note, children }: { title: string; note: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <BoxHeading title={title} note={note} />
      {children}
    </div>
  );
}

function CollectionDetail({
  entry,
  progress,
  itemHrefs,
}: {
  entry: CollectionEntry;
  progress: ClassProgress;
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [guardianClass, setGuardianClass] = useState<GuardianClass>("hunter");
  const owns = (item: LootItem) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash));
  const note = (items: LootItem[], extra?: string) =>
    [extra, showOwnership ? `${items.filter(owns).length} / ${items.length}` : `${items.length}`].filter(Boolean).join(" · ");
  const full = completeClasses(progress);
  const classItems = entry.classItems[guardianClass];
  const classItemsTitle = classItems.every((item) => ARMOR_TYPE.test(item.itemType ?? ""))
    ? `${CLASS_LABELS[guardianClass]} armor`
    : `${CLASS_LABELS[guardianClass]} items`;
  const iconUrl = bungieIconUrl(entry.iconPath);
  const grid = (items: LootItem[]) => (
    <LootItemGrid items={items} ownedItemHashes={ownedItemHashes} showOwnership={showOwnership} itemHrefs={itemHrefs} />
  );

  return (
    <div className="col-span-full grid min-w-0 gap-6 border border-white/30 bg-panel p-4 sm:p-5 md:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt={`${entry.name} badge`}
            className={`block w-full border ${showOwnership && full === 3 ? "border-owned/60" : "border-white/14"}`}
          />
        ) : null}
        {showOwnership ? (
          <span className={`ui-label ${full === 3 ? "text-owned!" : full > 0 ? "text-owned!" : ""}`}>
            {full === 3 ? "Gilded · all 3 classes" : full > 0 ? `Completed · ${full} of 3 classes` : "In progress"}
          </span>
        ) : null}
        <ul className="divide-y divide-white/[0.07]">
          {GUARDIAN_CLASSES.map((entryClass) => {
            const { owned, total } = progress[entryClass];
            const done = showOwnership && owned >= total;
            return (
              <li
                key={entryClass}
                className={`grid grid-cols-[16px_64px_minmax(0,1fr)_54px] items-center gap-2 py-1.5 text-[13.5px] ${
                  done ? "text-owned" : "text-[#c7cad0]"
                }`}
              >
                <GuardianClassIcon guardianClass={entryClass} size="xs" />
                <span>{CLASS_LABELS[entryClass]}</span>
                <ProgressBar owned={showOwnership ? owned : 0} total={total} />
                <span className="text-right text-[12.5px] tabular-nums text-ash">
                  {showOwnership ? `${owned} / ${total}` : total}
                </span>
              </li>
            );
          })}
        </ul>
        <span className="text-[12.5px] text-ash">
          Completed in game when one character owns everything. Here each class is tracked separately.
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ClassToggle value={guardianClass} onChange={setGuardianClass} noun="items" />
          {entry.href ? (
            <Link
              href={entry.href}
              className="inline-flex min-h-8 items-center border border-white/[0.22] px-3 font-display text-xs uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-white"
            >
              Open page →
            </Link>
          ) : entry.pagePending ? (
            <span
              title="Page coming soon"
              className="inline-flex min-h-8 cursor-not-allowed items-center border border-white/[0.1] px-3 font-display text-xs uppercase tracking-[0.12em] text-bone/30"
            >
              Open page →
            </span>
          ) : null}
        </div>
        {entry.weapons.length ? (
          <ItemBlock title="Weapons" note={note(entry.weapons, "Shared by all classes")}>
            {grid(entry.weapons)}
          </ItemBlock>
        ) : null}
        {classItems.length ? (
          <ItemBlock title={classItemsTitle} note={note(classItems)}>
            {grid(classItems)}
          </ItemBlock>
        ) : null}
        {entry.other.length ? (
          <ItemBlock title="Other" note={note(entry.other)}>
            {grid(entry.other)}
          </ItemBlock>
        ) : null}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<Status, string> = {
  all: "All",
  incomplete: "Incomplete",
  completed: "Completed",
  gilded: "Gilded",
};

/** Collections index: badge cards grouped by type; a card opens its items under its row. */
export function CollectionsIndex({
  groups,
  itemHrefs,
}: {
  groups: CollectionGroup[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const columns = useColumns();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");

  // Open the collection named in the URL (#last-wish).
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!slug || !groups.some((group) => group.entries.some((entry) => entry.slug === slug))) return;
    requestAnimationFrame(() => {
      setOpenSlug(slug);
      document.getElementById(slug)?.scrollIntoView({ block: "start" });
    });
  }, [groups]);

  const toggle = (slug: string) => {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    window.history.replaceState(null, "", next ? `#${next}` : window.location.pathname + window.location.search);
  };

  const progressBySlug = useMemo(() => {
    const owns = (item: LootItem) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash));
    return new Map(groups.flatMap((group) => group.entries.map((entry) => [entry.slug, classProgress(entry, owns)])));
  }, [groups, ownedItemHashes]);

  const allEntries = groups.flatMap((group) => group.entries);
  const fullBySlug = (slug: string) => completeClasses(progressBySlug.get(slug)!);
  const completed = allEntries.filter((entry) => fullBySlug(entry.slug) > 0).length;
  const gilded = allEntries.filter((entry) => fullBySlug(entry.slug) === 3).length;
  const perClass = Object.fromEntries(
    GUARDIAN_CLASSES.map((guardianClass) => [
      guardianClass,
      allEntries.filter((entry) => {
        const { owned, total } = progressBySlug.get(entry.slug)![guardianClass];
        return owned >= total;
      }).length,
    ]),
  ) as Record<GuardianClass, number>;
  // Unique items across every collection (shared weapons counted once).
  const uniqueItems = useMemo(() => {
    const map = new Map<string, LootItem>();
    for (const entry of groups.flatMap((group) => group.entries)) {
      for (const item of [...entry.weapons, ...entry.other, ...GUARDIAN_CLASSES.flatMap((c) => entry.classItems[c])]) {
        map.set(item.itemHash, item);
      }
    }
    return [...map.values()];
  }, [groups]);
  const ownedItems = uniqueItems.filter((item) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash))).length;

  const needle = query.trim().toLowerCase();
  const matches = (entry: CollectionEntry) => {
    if (needle) {
      const items = [...entry.weapons, ...entry.other, ...GUARDIAN_CLASSES.flatMap((c) => entry.classItems[c])];
      const hit =
        entry.name.toLowerCase().includes(needle) ||
        entry.subtitle?.toLowerCase().includes(needle) ||
        items.some((item) => item.name.toLowerCase().includes(needle));
      if (!hit) return false;
    }
    if (!showOwnership || status === "all") return true;
    const full = fullBySlug(entry.slug);
    if (status === "incomplete") return full === 0;
    if (status === "completed") return full > 0;
    return full === 3;
  };
  const visibleGroups = groups
    .map((group) => ({ ...group, entries: group.entries.filter(matches) }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="space-y-8">
      <StatBlockGrid count={4}>
        <StatBlock label="Completed">
          <StatCount owned={showOwnership ? completed : null} total={allEntries.length} gold />
          <span className="text-[12.5px] text-ash">With at least one class (as in game)</span>
        </StatBlock>
        <div className="ui-panel flex min-w-0 flex-col gap-2.5 border-owned! p-4 shadow-[0_0_18px_rgba(201,162,39,0.2)]">
          <span className="ui-label truncate text-owned!">Gilded · all classes</span>
          <StatCount owned={showOwnership ? gilded : null} total={allEntries.length} gold />
          <span className="text-[12.5px] text-ash">Hunter, Titan and Warlock complete</span>
        </div>
        <StatBlock label="Per class">
          <div className="flex flex-col gap-1.5 text-[13.5px]">
            {GUARDIAN_CLASSES.map((guardianClass) => (
              <span key={guardianClass} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <GuardianClassIcon guardianClass={guardianClass} size="xs" />
                  {CLASS_LABELS[guardianClass]}
                </span>
                <span className="text-[12.5px] tabular-nums text-ash">
                  {showOwnership ? perClass[guardianClass] : "—"} / {allEntries.length}
                </span>
              </span>
            ))}
          </div>
        </StatBlock>
        <StatBlock label="Items owned">
          <StatCount owned={showOwnership ? ownedItems : null} total={uniqueItems.length} />
          <span className="text-[12.5px] text-ash">Shared items counted once</span>
        </StatBlock>
      </StatBlockGrid>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "In progress", swatch: "border border-white/20", tone: "text-bone" },
          { title: "Completed", swatch: "border border-owned/70", tone: "text-owned" },
          {
            title: "Gilded",
            swatch: "border border-owned bg-owned/15 shadow-[0_0_0_1px_#c9a227,0_0_10px_rgba(201,162,39,0.5)]",
            tone: "text-[#e8c860]",
          },
        ].map((item) => (
          <div key={item.title} className="ui-panel flex items-center gap-3 px-3 py-2">
            <span aria-hidden className={`h-5 w-8 shrink-0 bg-[#1a1f27] ${item.swatch}`} />
            <span className={`font-display text-[15px] font-semibold uppercase tracking-[0.08em] ${item.tone}`}>{item.title}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search collections or items…"
            className="h-10 min-w-[14rem] flex-1 border border-white/[0.22] bg-void/60 px-3.5 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
          />
          {showOwnership
            ? (Object.keys(STATUS_LABELS) as Status[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  onClick={() => setStatus(value)}
                  className={`inline-flex h-10 items-center border px-3.5 font-display text-[13px] uppercase tracking-[0.12em] transition ${
                    status === value
                      ? "border-bone bg-white/[0.06] text-white"
                      : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
                  }`}
                >
                  {STATUS_LABELS[value]}
                </button>
              ))
            : null}
        </div>
        <nav aria-label="Collection groups" className="flex flex-wrap items-center gap-2">
          <span className="ui-label w-[70px] text-[11px]!">Jump to</span>
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#group-${group.id}`}
              className="inline-flex min-h-7 items-center border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone hover:text-white"
            >
              {group.title}
            </a>
          ))}
        </nav>
      </div>

      {visibleGroups.length === 0 ? <p className="text-sm text-ash">No collections match.</p> : null}

      {visibleGroups.map((group) => {
        const openIndex = group.entries.findIndex((entry) => entry.slug === openSlug);
        // The open card's items go after the last card of its row.
        const insertAfter = openIndex < 0 ? -1 : Math.min(group.entries.length, (Math.floor(openIndex / columns) + 1) * columns) - 1;
        const openEntry = openIndex >= 0 ? group.entries[openIndex] : null;
        return (
          <section key={group.id} id={`group-${group.id}`} className="min-w-0 scroll-mt-20">
            <SectionHeading title={group.title} note={`${group.entries.length} collections`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.entries.map((entry, index) => (
                <Fragment key={entry.slug}>
                  <CollectionCard
                    entry={entry}
                    progress={progressBySlug.get(entry.slug)!}
                    showOwnership={showOwnership}
                    open={entry.slug === openSlug}
                    onToggle={() => toggle(entry.slug)}
                  />
                  {index === insertAfter && openEntry ? (
                    <CollectionDetail
                      key={`detail-${openEntry.slug}`}
                      entry={openEntry}
                      progress={progressBySlug.get(openEntry.slug)!}
                      itemHrefs={itemHrefs}
                    />
                  ) : null}
                </Fragment>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
