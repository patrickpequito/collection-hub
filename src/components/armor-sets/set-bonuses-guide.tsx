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

  const visible = sets.filter((set) => {
    const text = `${set.name} ${set.twoPiece?.name} ${set.twoPiece?.description} ${set.fourPiece?.name} ${set.fourPiece?.description}`.toLowerCase();
    if (query.trim() && !query.trim().toLowerCase().split(/\s+/).every((word) => text.includes(word))) return false;
    if (source !== "all" && set.origin.group !== source) return false;
    if (effects.length && !effects.every((tag) => set.tags.includes(tag))) return false;
    if (monumentOnly && !set.monumentReissue) return false;
    if (wearableOnly && showOwnership && owned(set, guardianClass) < 2) return false;
    return true;
  });

  const fourReady = sets.filter((set) => owned(set, guardianClass) >= 4);
  const twoReady = sets.filter((set) => owned(set, guardianClass) >= 2 && owned(set, guardianClass) < 4);
  const totalPieces = sets.reduce((sum, set) => sum + GUARDIAN_CLASSES.reduce((n, cls) => n + set.wearHashes[cls].length, 0), 0);
  const ownedPieces = sets.reduce((sum, set) => sum + GUARDIAN_CLASSES.reduce((n, cls) => n + owned(set, cls), 0), 0);
  const className = CLASS_LABELS[guardianClass];

  return (
    <div className="space-y-9">
      <StatBlockGrid count={4}>
        <StatBlock label="Sets with bonuses">
          <span className="font-display text-3xl leading-none text-bone">{sets.length}</span>
          <span className="text-xs text-ash">{sets.filter((set) => set.monumentReissue).length} reissued with Monument of Triumph</span>
        </StatBlock>
        <StatBlock label={`4-piece ready · ${className}`}>
          <span className="font-display text-3xl leading-none text-owned">{showOwnership ? fourReady.length : "—"}</span>
          <span className="text-xs text-ash">Sets you can wear in full</span>
        </StatBlock>
        <StatBlock label={`2-piece ready · ${className}`}>
          <span className="font-display text-3xl leading-none text-bone">{showOwnership ? twoReady.length : "—"}</span>
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-label w-16 text-[11px]!">Effect</span>
          {BONUS_EFFECT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={chipClass(effects.includes(tag))}
              onClick={() =>
                setEffects((current) => (current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]))
              }
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
            return (
              <Fragment key={set.hash}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : set.hash)}
                  aria-expanded={expanded}
                  className={`grid w-full gap-3 border-b border-white/[0.08] px-4 py-3 text-left transition hover:bg-white/[0.03] md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_140px] md:gap-4 ${
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
                  <div className="grid gap-5 border-b border-white/[0.08] bg-white/[0.035] px-4 pb-4 pt-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pl-[212px]">
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
