"use client";

import Image from "next/image";
import Link from "@/components/app-link";
import { Fragment, useMemo, useState } from "react";
import { ActivityArmorGrid } from "@/components/activity-current-loot-panel";
import { useOwnership } from "@/components/client-ownership";
import { SectionHeading, StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { CLASS_LABELS, GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";
import { BONUS_EFFECT_TAGS, type BonusGuideSet } from "@/lib/armor-sets/bonus-tags";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";
import type { GuardianClass } from "@/types/armor-set";

const SOURCE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "raids", label: "Raids" },
  { id: "dungeons", label: "Dungeons" },
  { id: "playlists", label: "Playlists" },
  { id: "expansions", label: "Expansions" },
  { id: "seasons", label: "Seasons" },
  { id: "events", label: "Events" },
];

const GROUP_TAG: Record<string, string> = {
  raids: "Raid",
  dungeons: "Dungeon",
  playlists: "Playlist",
  expansions: "Expansion",
  seasons: "Season",
  events: "Event",
  other: "Other",
};

const CHIP = "inline-flex h-8 items-center border px-3 font-display text-xs uppercase tracking-[0.12em] transition";
const chipClass = (on: boolean) =>
  `${CHIP} ${on ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.22] text-bone/75 hover:border-bone hover:text-bone"}`;

function Bonus({ bonus, pieces }: { bonus: ArmorSetBonus | null; pieces: 2 | 4 }) {
  if (!bonus) return <span className="text-xs text-ash">—</span>;
  return (
    <div className="flex min-w-0 gap-2.5">
      <Image
        src={bungieIconUrl(bonus.iconPath)}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 border border-white/[0.14] bg-[#14181e]"
        unoptimized
      />
      <div className="min-w-0">
        <p className="text-sm text-bone">
          <span className="ui-label mr-1.5 text-[11px]!">{pieces}-piece</span>
          {bonus.name}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-[#a8adb5]">{bonus.description}</p>
      </div>
    </div>
  );
}

/** Teal effect tags derived from the bonus text (Orbs, Survival, Melee…). */
function EffectTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-seasonal/15 px-1.5 py-px font-display text-[10px] uppercase tracking-[0.12em] text-[#7fe0df]"
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

function BonusIcon({ bonus }: { bonus: ArmorSetBonus | null }) {
  if (!bonus) return null;
  return (
    <Image
      src={bungieIconUrl(bonus.iconPath)}
      alt=""
      width={26}
      height={26}
      className="size-[26px] shrink-0 border border-white/[0.14] bg-[#14181e]"
      unoptimized
    />
  );
}

/** Searchable guide to every armor set bonus, with what you can wear today. */
export function SetBonusesGuide({ sets }: { sets: BonusGuideSet[] }) {
  const { ownedItemHashes, inventoryItemHashes, showOwnership } = useOwnership();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [effects, setEffects] = useState<string[]>([]);
  const [monumentOnly, setMonumentOnly] = useState(false);
  const [wearableOnly, setWearableOnly] = useState(false);
  const [guardianClass, setGuardianClass] = useState<GuardianClass>("hunter");
  const [open, setOpen] = useState<string | null>(null);

  // Armor 3.0 pieces you hold right now (characters + vault), per set and class:
  // only those can be equipped for the bonus, so Collections unlocks do not count.
  const ownedCounts = useMemo(() => {
    const counts = new Map<string, Record<GuardianClass, number>>();
    for (const set of sets) {
      const perClass = { hunter: 0, titan: 0, warlock: 0 };
      for (const cls of GUARDIAN_CLASSES) {
        perClass[cls] = set.wearHashes[cls].filter((hashes) => hashes.some((hash) => inventoryItemHashes.has(hash))).length;
      }
      counts.set(set.hash, perClass);
    }
    return counts;
  }, [inventoryItemHashes, sets]);

  const owned = (set: BonusGuideSet, cls: GuardianClass) => ownedCounts.get(set.hash)?.[cls] ?? 0;

  // Every filter but the effect tags: also used for the per-effect counts on phones.
  const matchesBase = (set: BonusGuideSet) => {
    const text = `${set.name} ${set.twoPiece?.name} ${set.twoPiece?.description} ${set.fourPiece?.name} ${set.fourPiece?.description}`.toLowerCase();
    if (query.trim() && !query.trim().toLowerCase().split(/\s+/).every((word) => text.includes(word))) return false;
    if (source !== "all" && set.origin.group !== source) return false;
    if (monumentOnly && !set.monumentReissue) return false;
    if (wearableOnly && showOwnership && owned(set, guardianClass) < 2) return false;
    return true;
  };
  const visible = sets.filter(
    (set) => matchesBase(set) && (!effects.length || effects.every((tag) => set.tags.includes(tag))),
  );
  const effectCounts = BONUS_EFFECT_TAGS.map((tag) => ({
    tag,
    count: sets.filter((set) => matchesBase(set) && set.tags.includes(tag)).length,
  }));
  const toggleEffect = (tag: string) =>
    setEffects((current) => (current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]));
  const sourceValue = monumentOnly ? "monument" : source;

  const fourReady = sets.filter((set) => owned(set, guardianClass) >= 4);
  const twoReady = sets.filter((set) => owned(set, guardianClass) >= 2 && owned(set, guardianClass) < 4);
  const totalPieces = sets.reduce((sum, set) => sum + GUARDIAN_CLASSES.reduce((n, cls) => n + set.wearHashes[cls].length, 0), 0);
  const ownedPieces = sets.reduce((sum, set) => sum + GUARDIAN_CLASSES.reduce((n, cls) => n + owned(set, cls), 0), 0);
  const className = CLASS_LABELS[guardianClass];

  return (
    <div className="space-y-9">
      <StatBlockGrid count={4}>
        <StatBlock label="Sets with bonuses">
          <span className="font-display text-[22px] leading-none sm:text-3xl text-bone">{sets.length}</span>
          <span className="text-xs text-ash">{sets.filter((set) => set.monumentReissue).length} reissued with Monument of Triumph</span>
        </StatBlock>
        <StatBlock label={`4-piece ready · ${className}`}>
          <span className="font-display text-[22px] leading-none sm:text-3xl text-owned">{showOwnership ? fourReady.length : "—"}</span>
          <span className="text-xs text-ash">Sets you can wear in full</span>
        </StatBlock>
        <StatBlock label={`2-piece ready · ${className}`}>
          <span className="font-display text-[22px] leading-none sm:text-3xl text-bone">{showOwnership ? twoReady.length : "—"}</span>
          <span className="text-xs text-ash">Two or three pieces owned</span>
        </StatBlock>
        <StatBlock label="Armor 3.0 pieces">
          <StatCount owned={showOwnership ? ownedPieces : null} total={totalPieces} />
        </StatBlock>
      </StatBlockGrid>

      <section className="min-w-0 space-y-3">
        <SectionHeading title="Set bonuses" note={`${visible.length} of ${sets.length} sets`} />

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search effects — “reload”, “Orb”, “grenade energy”…"
            className="h-10 min-w-0 flex-1 basis-64 border border-white/[0.22] bg-void/60 px-3.5 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
          />
          <div className="flex gap-1">
            {GUARDIAN_CLASSES.map((cls) => (
              <button
                key={cls}
                type="button"
                title={CLASS_LABELS[cls]}
                aria-label={`Show readiness for ${CLASS_LABELS[cls]}`}
                aria-pressed={guardianClass === cls}
                onClick={() => setGuardianClass(cls)}
                className={`inline-flex size-10 items-center justify-center border transition ${
                  guardianClass === cls ? "border-bone" : "border-white/[0.22] opacity-60 hover:border-bone hover:opacity-100"
                }`}
              >
                <GuardianClassIcon guardianClass={cls} size="sm" />
              </button>
            ))}
          </div>
          {showOwnership ? (
            <button type="button" className={chipClass(wearableOnly)} onClick={() => setWearableOnly((value) => !value)}>
              Wearable only
            </button>
          ) : null}
          {/* Phones: the source chips collapse into one dropdown. */}
          <label className="relative ml-auto md:hidden">
            <span className="sr-only">Source</span>
            <select
              value={sourceValue}
              onChange={(event) => {
                const value = event.target.value;
                setMonumentOnly(value === "monument");
                setSource(value === "monument" ? "all" : value);
              }}
              className="h-10 appearance-none border border-white/[0.22] bg-void/60 pl-3 pr-8 font-display text-xs uppercase tracking-[0.12em] text-bone focus:border-bone focus:outline-none"
            >
              {SOURCE_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  Source: {filter.label}
                </option>
              ))}
              <option value="monument">Source: Monument reissue</option>
            </select>
            <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ash">
              ▾
            </span>
          </label>
        </div>

        {/* Phones: pick an effect from a 3-column grid with the number of matching sets. */}
        <div className="space-y-1.5 md:hidden">
          <span className="ui-label text-[10px]!">Pick an effect</span>
          <div className="grid grid-cols-3 gap-1.5">
            {effectCounts.map(({ tag, count }) => {
              const on = effects.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleEffect(tag)}
                  className={`flex min-w-0 items-center justify-between gap-1 border px-2 py-1.5 font-display text-[11px] uppercase tracking-[0.1em] transition ${
                    on ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.18] text-[#c7cad0]"
                  }`}
                >
                  <span className="truncate">{tag === "Class ability" ? "Class" : tag}</span>
                  <span className="text-ash">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <span className="ui-label w-16 text-[11px]!">Source</span>
          {SOURCE_FILTERS.map((filter) => (
            <button key={filter.id} type="button" className={chipClass(source === filter.id)} onClick={() => setSource(filter.id)}>
              {filter.label}
            </button>
          ))}
          <button type="button" className={chipClass(monumentOnly)} onClick={() => setMonumentOnly((value) => !value)}>
            Monument reissue
          </button>
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <span className="ui-label w-16 text-[11px]!">Effect</span>
          {BONUS_EFFECT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={chipClass(effects.includes(tag))}
              onClick={() => toggleEffect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>


        <div className="ui-panel">
          <div className="hidden grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_140px] gap-4 border-b border-white/[0.14] px-4 py-2.5 md:grid">
            {["Set", "2-piece", "4-piece", "Your pieces"].map((label) => (
              <span key={label} className="ui-label text-[11px]!">
                {label}
              </span>
            ))}
          </div>
          {visible.length === 0 ? <p className="px-4 py-6 text-sm text-ash">No sets match.</p> : null}
          {visible.map((set) => {
            const expanded = open === set.hash;
            const count = owned(set, guardianClass);
            return (
              <Fragment key={set.hash}>
                {/* Phones: one compact row (bonus icons, name, bonus names, effect tags, your count). */}
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : set.hash)}
                  aria-expanded={expanded}
                  className={`flex w-full items-center gap-2.5 border-b border-white/[0.08] px-3 py-2.5 text-left md:hidden ${
                    expanded ? "border-b-0 bg-white/[0.035]" : ""
                  }`}
                >
                  <span className="flex shrink-0 gap-1">
                    <BonusIcon bonus={set.twoPiece} />
                    <BonusIcon bonus={set.fourPiece} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-sm font-medium text-bone">
                      {set.name}
                      {set.monumentReissue ? (
                        <span className="ml-1.5 font-display text-[10px] uppercase tracking-[0.12em] text-owned">Monument</span>
                      ) : null}
                    </span>
                    <span className="truncate text-[11.5px] text-ash">
                      {[set.twoPiece?.name, set.fourPiece?.name].filter(Boolean).join(" · ")}
                    </span>
                    <EffectTags tags={set.tags} />
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 text-xs ${
                      showOwnership && count >= 4 ? "text-owned" : "text-[#c7cad0]"
                    }`}
                  >
                    <GuardianClassIcon guardianClass={guardianClass} size="xs" />
                    {showOwnership ? `${count}/${set.wearHashes[guardianClass].length}` : set.wearHashes[guardianClass].length}
                  </span>
                  <span aria-hidden className={`text-[11px] transition ${expanded ? "rotate-90 text-bone" : "text-ash"}`}>
                    ▸
                  </span>
                </button>
                {expanded ? (
                  <div className="space-y-3 border-b border-white/[0.08] bg-white/[0.035] px-3 pb-3 md:hidden">
                    <span className="block text-xs text-ash">{set.origin.label}</span>
                    <Bonus bonus={set.twoPiece} pieces={2} />
                    <Bonus bonus={set.fourPiece} pieces={4} />
                    <ActivityArmorGrid
                      armorRows={set.rows.filter((row) => row.guardianClass === guardianClass)}
                      ownedItemHashes={ownedItemHashes}
                      showOwnership={showOwnership}
                    />
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      {set.origin.href ? (
                        <Link href={set.origin.href} className="font-display text-xs uppercase tracking-[0.14em] text-bone">
                          Open {set.origin.label.split(" · ")[0]} →
                        </Link>
                      ) : (
                        <span />
                      )}
                      {showOwnership ? (
                        <span className="text-[11.5px] text-ash">
                          {GUARDIAN_CLASSES.filter((cls) => cls !== guardianClass)
                            .map((cls) => `${CLASS_LABELS[cls]} ${owned(set, cls)}/${set.wearHashes[cls].length}`)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : set.hash)}
                  aria-expanded={expanded}
                  className={`hidden w-full gap-4 border-b border-white/[0.08] px-4 py-3 text-left transition hover:bg-white/[0.03] md:grid md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_140px] ${
                    expanded ? "bg-white/[0.035]" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-col items-start gap-1.5">
                    <span className="font-display text-base font-semibold uppercase leading-tight tracking-[0.06em] text-bone">
                      {set.name}
                    </span>
                    <span className="flex flex-wrap gap-1">
                      <span className="border border-white/[0.22] px-1.5 py-0.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#c7cad0]">
                        {GROUP_TAG[set.origin.group]}
                      </span>
                      {set.monumentReissue ? (
                        <span className="border border-owned/50 px-1.5 py-0.5 font-display text-[10px] uppercase tracking-[0.16em] text-owned">
                          Monument
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-ash">{set.origin.label}</span>
                    <EffectTags tags={set.tags} />
                  </div>
                  <Bonus bonus={set.twoPiece} pieces={2} />
                  <Bonus bonus={set.fourPiece} pieces={4} />
                  <div className="flex flex-row flex-wrap gap-1 md:flex-col">
                    {GUARDIAN_CLASSES.map((cls) => {
                      const count = owned(set, cls);
                      const total = set.wearHashes[cls].length;
                      const tone = !showOwnership
                        ? "border-white/[0.1] text-ash"
                        : count >= 4
                          ? "border-owned text-owned"
                          : count >= 2
                            ? "border-white/35 text-bone"
                            : "border-white/[0.1] text-ash";
                      return (
                        <span key={cls} className={`flex items-center gap-1.5 border px-2 py-0.5 text-xs ${tone}`}>
                          <GuardianClassIcon guardianClass={cls} size="xs" />
                          {showOwnership ? `${count}/${total}` : total}
                          {showOwnership && count >= 2 ? <span>· {count >= 4 ? "4pc" : "2pc"}</span> : null}
                        </span>
                      );
                    })}
                  </div>
                </button>
                {expanded ? (
                  <div className="hidden gap-5 border-b border-white/[0.08] bg-white/[0.035] px-4 pb-4 pt-1 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pl-[212px]">
                    <div className="min-w-0 space-y-3">
                      <ActivityArmorGrid armorRows={set.rows} ownedItemHashes={ownedItemHashes} showOwnership={showOwnership} />
                      {set.origin.href ? (
                        <Link href={set.origin.href} className="inline-block font-display text-xs uppercase tracking-[0.14em] text-bone hover:text-white">
                          Open {set.origin.label.split(" · ")[0]} →
                        </Link>
                      ) : null}
                    </div>
                    {set.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={set.previewUrl} alt={`${set.name} armor set`} className="w-full border border-white/[0.18] object-cover" />
                    ) : null}
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </section>
    </div>
  );
}
