"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { useMemo, useState } from "react";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { godRollHighlightedPerks } from "@/lib/weapons/god-roll-highlights";
import type { ResolvedWeaponPerkColumn, WeaponPlugDefinition } from "@/types/all-loot";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";

type Mode = "all" | "pve" | "pvp";

/** Column title from the plug category (barrels, magazines…) or its position. */
function columnTitles(columns: ResolvedWeaponPerkColumn[]): string[] {
  let traits = 0;
  return columns.map((column, index) => {
    if (column.type === "masterwork") return "Masterwork";
    const category = column.perks[0]?.plugCategoryIdentifier ?? "";
    if (category.includes("barrel")) return "Barrel";
    if (category.includes("magazine")) return "Magazine";
    if (category.includes("frame") || category.includes("intrinsic")) return "Intrinsic";
    const isLast = index === columns.length - 1;
    if (column.perks.length === 1 && isLast) return "Origin";
    traits += 1;
    return traits <= 2 ? `Trait ${traits}` : "Perk";
  });
}

function PerkRow({
  perk,
  tags,
  selected,
}: {
  perk: ResolvedWeaponPerkColumn["perks"][number];
  tags: { label: string; className: string }[];
  selected: boolean;
}) {
  const ring = tags.find((tag) => tag.label === "God roll")
    ? "ring-2 ring-owned"
    : tags.length > 0
      ? "ring-1 ring-white/60"
      : "";
  return (
    <div
      className={`group relative flex items-center gap-2.5 border px-2 py-1.5 ${
        selected ? "border-sky-500/60 bg-sky-500/15" : "border-transparent hover:bg-white/[0.03]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bungieIconUrl(perk.iconPath)}
        alt=""
        width={30}
        height={30}
        className={`size-[30px] shrink-0 rounded-full border border-white/40 bg-panel ${ring}`}
      />
      <span className="min-w-0 flex-1 truncate text-[13px] text-bone/90">{perk.name}</span>
      {tags.length > 0 ? (
        <span className="flex shrink-0 gap-1">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={`font-display text-[10px] uppercase tracking-[0.1em] ${tag.className}`}
            >
              {tag.label}
            </span>
          ))}
        </span>
      ) : null}
      {perk.description ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-64 border border-white/30 bg-[#12161c] p-2.5 text-xs leading-snug text-bone/80 shadow-lg group-hover:block"
        >
          <span className="mb-1 block font-medium text-bone">{perk.name}</span>
          {perk.description}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Perks as named rows per column. Recommendations come from two community
 * sources (DIM wishlist PvE / PvP and Aegis); a perk every source picks is
 * marked "God roll".
 */
export function WeaponPerksGrid({
  columns,
  godRoll,
  aegisPerks,
  plugIndex = {},
  rollHighlightPerks = new Set(),
  fallbackVersionLabel = null,
  showRecommendations = true,
}: {
  /** Exotics have fixed perks: list them without the recommendation tools. */
  showRecommendations?: boolean;
  fallbackVersionLabel?: string | null;
  columns: ResolvedWeaponPerkColumn[];
  godRoll: ResolvedWeaponGodRoll | null;
  aegisPerks: string[];
  plugIndex?: Record<string, WeaponPlugDefinition>;
  rollHighlightPerks?: Set<string>;
}) {
  const [mode, setMode] = useState<Mode>("all");
  const titles = useMemo(() => columnTitles(columns), [columns]);
  const pve = useMemo(() => godRollHighlightedPerks(godRoll?.pve, columns, plugIndex), [columns, godRoll, plugIndex]);
  const pvp = useMemo(() => godRollHighlightedPerks(godRoll?.pvp, columns, plugIndex), [columns, godRoll, plugIndex]);
  const aegis = useMemo(() => godRollHighlightedPerks(aegisPerks, columns, plugIndex), [aegisPerks, columns, plugIndex]);
  const hasRecommendations = pve.size + pvp.size + aegis.size > 0;

  const tagsFor = (hash: string) => {
    const inPve = mode !== "pvp" && pve.has(hash);
    const inPvp = mode !== "pve" && pvp.has(hash);
    const inAegis = mode !== "pvp" && aegis.has(hash);
    const sources = [pve.size > 0 && mode !== "pvp", aegis.size > 0 && mode !== "pvp"].filter(Boolean).length;
    // Every available PvE source agrees → god roll.
    if (mode !== "pvp" && sources >= 2 && inPve && inAegis) {
      return [
        { label: "God roll", className: "text-owned" },
        ...(inPvp ? [{ label: "PvP", className: "text-sky-300" }] : []),
      ];
    }
    return [
      ...(inPve ? [{ label: "PvE", className: "text-owned" }] : []),
      ...(inAegis ? [{ label: "Aegis", className: "text-bone/70" }] : []),
      ...(inPvp ? [{ label: "PvP", className: "text-sky-300" }] : []),
    ];
  };

  const perkColumns = columns.map((column, index) => ({ column, title: titles[index] }));
  const main = perkColumns.filter((entry) => entry.title !== "Masterwork" && entry.title !== "Origin");
  const side = perkColumns.filter((entry) => entry.title === "Masterwork" || entry.title === "Origin");

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Perks" note={showRecommendations ? "Recommended rolls · community sources" : undefined} />
      <div className="ui-panel space-y-4 p-4">
        {showRecommendations ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {hasRecommendations ? (
            <div className="flex" role="group" aria-label="Recommendations">
              {(["all", "pve", "pvp"] as const).map((entry) => (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={mode === entry}
                  onClick={() => setMode(entry)}
                  className={`inline-flex h-8 items-center border px-3 font-display text-xs uppercase tracking-[0.12em] transition ${
                    mode === entry ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"
                  }`}
                >
                  {entry === "all" ? "Both" : entry}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[13px] text-ash">No recommended rolls for this version yet.</span>
          )}
          {hasRecommendations ? (
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ash">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full ring-2 ring-owned" /> God roll · all sources agree
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full ring-1 ring-white/60" /> Recommended
              </span>
              {rollHighlightPerks.size > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-3 bg-sky-500/40" /> Selected copy
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {main.map(({ column, title }) => (
              <div key={title} className="min-w-0">
                <h3 className="ui-label mb-1.5 border-b border-white/10 px-2 pb-1.5 text-[11px]! text-bone!">{title}</h3>
                {column.perks.map((perk) => (
                  <PerkRow
                    key={perk.plugHash}
                    perk={perk}
                    tags={tagsFor(perk.plugHash)}
                    selected={rollHighlightPerks.has(perk.plugHash)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-4 border-white/10 lg:border-l lg:pl-4">
            {side.map(({ column, title }) => (
              <div key={title}>
                <h3 className="ui-label mb-1.5 text-[11px]! text-bone!">{title}</h3>
                {column.perks.map((perk) => (
                  <PerkRow
                    key={perk.plugHash}
                    perk={perk}
                    tags={tagsFor(perk.plugHash)}
                    selected={rollHighlightPerks.has(perk.plugHash)}
                  />
                ))}
              </div>
            ))}
            {showRecommendations ? (
            <div>
              <h3 className="ui-label mb-1 text-[11px]! text-bone!">Recommended by</h3>
              <p className="text-xs leading-relaxed text-ash">
                DIM community wishlist (PvE / PvP) and Aegis.
              </p>
              {fallbackVersionLabel ? (
                <p className="mt-1.5 text-xs leading-relaxed text-amber-200/80">
                  No picks for this version yet — showing the {fallbackVersionLabel} picks for perks it still has.
                </p>
              ) : null}
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
