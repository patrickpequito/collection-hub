"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { ProgressBar } from "@/components/home/progress-bar";
import { LootItemGrid } from "@/components/loot-section";
import { localSeasonIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import {
  groupShaderCatalog,
  type ShaderCatalogItem,
  type ShaderSection,
  type ShaderSubgroup,
  type ShaderViewMode,
} from "@/lib/shaders/group-shaders";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import { useSignedIn } from "@/lib/use-signed-in";
import type { LootItem } from "@/types/activity-loot";

type ShadersCatalogProps = {
  items: ShaderCatalogItem[];
  facetSeasons: string[];
  totalCount: number;
};

function isLootOwned(item: LootItem, ownedSet: ReadonlySet<string>): boolean {
  const hashes = item.ownershipHashes?.length
    ? item.ownershipHashes
    : [item.itemHash];
  return hashes.some((hash) => ownedSet.has(hash));
}

function countOwned(
  items: readonly LootItem[],
  ownedSet: ReadonlySet<string>,
): number {
  return items.filter((item) => isLootOwned(item, ownedSet)).length;
}

function SectionSeasonIcon({
  label,
  seasonIconPath,
}: {
  label: string;
  seasonIconPath?: string;
}) {
  const [src, setSrc] = useState(() => localSeasonIconPath(label));
  const [failedLocal, setFailedLocal] = useState(false);

  return (
    <Image
      src={src}
      alt=""
      width={28}
      height={28}
      unoptimized
      className="size-7 shrink-0 object-contain"
      onError={() => {
        if (!failedLocal && seasonIconPath) {
          setFailedLocal(true);
          setSrc(bungieIconUrl(seasonIconPath));
          return;
        }
        setSrc("/images/seasons/red-war.png");
      }}
    />
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const VIEW_OPTIONS: { id: ShaderViewMode; label: string; hint: string }[] = [
  { id: "season", label: "Season", hint: "Group by icon, then by where they drop" },
  { id: "activity", label: "Activity", hint: "Group by drop source, then by season icon" },
];

const CHIP =
  "inline-flex h-10 items-center border px-3.5 font-display text-sm uppercase tracking-[0.12em] transition";

/** Keep only matching shaders (name search / missing only); drop empty groups. */
function filterSubgroup(
  group: ShaderSubgroup,
  keep: (item: LootItem) => boolean,
): ShaderSubgroup | null {
  const items = group.items.filter(keep);
  const subgroups = group.subgroups
    ?.map((nested) => filterSubgroup(nested, keep))
    .filter((nested): nested is ShaderSubgroup => nested !== null);
  if (items.length === 0 && !subgroups?.length) return null;
  return { ...group, items, subgroups };
}

function filterSection(section: ShaderSection, keep: (item: LootItem) => boolean): ShaderSection | null {
  const items = section.items.filter(keep);
  if (items.length === 0) return null;
  return {
    ...section,
    items,
    itemCount: items.length,
    subgroups: section.subgroups
      .map((group) => filterSubgroup(group, keep))
      .filter((group): group is ShaderSubgroup => group !== null),
  };
}

export function ShadersCatalog({
  items,
  facetSeasons,
  totalCount,
}: ShadersCatalogProps) {
  const signedIn = useSignedIn();
  const {
    itemHashes: ownedItemHashes,
    loading: inventoryLoading,
    error: inventoryError,
  } = useOwnedItemHashes(signedIn);
  const showOwnership = signedIn && !inventoryError && !inventoryLoading;
  const ownedSet = useMemo(() => new Set(ownedItemHashes), [ownedItemHashes]);

  const [viewMode, setViewMode] = useState<ShaderViewMode>("season");
  const [query, setQuery] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  /** Section ids that are collapsed. Default: all expanded. */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  /** Section ids with subgroups enabled. Default: all flat (off). */
  const [subgroupsOn, setSubgroupsOn] = useState<Set<string>>(() => new Set());

  const allSections = useMemo(
    () => groupShaderCatalog(items, viewMode, facetSeasons),
    [items, viewMode, facetSeasons],
  );

  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filterMissing = missingOnly && showOwnership;
    if (!needle && !filterMissing) return allSections;
    const keep = (item: LootItem) =>
      (!needle || item.name.toLowerCase().includes(needle)) &&
      (!filterMissing || !isLootOwned(item, ownedSet));
    return allSections
      .map((section) => filterSection(section, keep))
      .filter((section): section is ShaderSection => section !== null);
  }, [allSections, missingOnly, ownedSet, query, showOwnership]);

  const ownedTotal = showOwnership ? countOwned(items, ownedSet) : null;
  const latest = allSections[0];
  const latestOwned = latest && showOwnership ? countOwned(latest.items, ownedSet) : null;
  const missingObtainable = showOwnership
    ? items.filter((item) => item.obtainable && !isLootOwned(item, ownedSet)).length
    : null;

  const toggleCollapsed = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setSubgroupsEnabled = (id: string, enabled: boolean) =>
    setSubgroupsOn((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleViewModeChange = (mode: ShaderViewMode) => {
    setViewMode(mode);
    setCollapsed(new Set());
    setSubgroupsOn(new Set());
  };

  return (
    <div className="space-y-7">
      <StatBlockGrid count={3}>
        <StatBlock label="Shaders owned">
          <StatCount owned={ownedTotal} total={totalCount} gold />
        </StatBlock>
        {latest ? (
          <StatBlock label={viewMode === "season" ? `Latest · ${latest.label}` : latest.label}>
            <StatCount owned={latestOwned} total={latest.itemCount} />
          </StatBlock>
        ) : null}
        <StatBlock label="Missing obtainable">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {missingObtainable?.toLocaleString("en-US") ?? "—"}
          </span>
          <span className="text-[13px] text-ash">
            {showOwnership ? "Still earnable in the game" : "Sign in to track"}
          </span>
        </StatBlock>
      </StatBlockGrid>

      {inventoryError ? (
        <p className="text-xs text-amber-200/80">Collection unavailable: {inventoryError}</p>
      ) : !signedIn ? (
        <p className="text-xs text-amber-200/80">
          Sign in with Bungie to see which shaders you already own.
        </p>
      ) : null}

      <div className="ui-panel flex flex-wrap items-center gap-3 p-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search shaders…"
          aria-label="Search shaders"
          className="h-10 min-w-0 flex-[1_1_16rem] border border-white/30 bg-transparent px-3 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
        />
        <span className="ui-label">Group by</span>
        <div className="flex" role="group" aria-label="Shader grouping">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={viewMode === option.id}
              title={option.hint}
              onClick={() => handleViewModeChange(option.id)}
              className={`${CHIP} ${
                viewMode === option.id
                  ? "border-bone text-bone"
                  : "border-white/[0.22] text-bone/60 hover:text-bone"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={missingOnly}
          disabled={!showOwnership}
          title={showOwnership ? undefined : "Sign in to filter by collection"}
          onClick={() => setMissingOnly((value) => !value)}
          className={`${CHIP} disabled:cursor-not-allowed disabled:opacity-40 ${
            missingOnly ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"
          }`}
        >
          Missing only
        </button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav
          aria-label="Shader groups"
          className="ui-panel hidden max-h-[calc(100dvh-6rem)] overflow-y-auto py-2 lg:sticky lg:top-20 lg:block"
        >
          <span className="ui-label block px-3 pb-2 pt-1">Jump to</span>
          {sections.map((section) => {
            const owned = showOwnership ? countOwned(section.items, ownedSet) : null;
            return (
              <a
                key={section.id}
                href={`#shaders-${section.id}`}
                className="flex flex-col gap-1.5 border-l-2 border-transparent px-3 py-2 transition hover:border-bone hover:bg-white/[0.03]"
              >
                <span className="flex items-baseline justify-between gap-2 text-[13px] text-bone/85">
                  <span className="truncate">{section.label}</span>
                  <span className="shrink-0 text-xs text-ash">
                    {owned === null ? section.itemCount : `${owned}/${section.itemCount}`}
                  </span>
                </span>
                {owned !== null ? <ProgressBar owned={owned} total={section.itemCount} /> : null}
              </a>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-3.5">
          {sections.length === 0 ? (
            <p className="border border-dashed border-white/[0.14] px-6 py-10 text-center text-sm text-ash">
              No shaders match.
            </p>
          ) : null}
          {sections.map((section) => (
            <ShaderSectionCard
              key={section.id}
              section={section}
              open={!collapsed.has(section.id)}
              subgroupsEnabled={subgroupsOn.has(section.id)}
              subgroupsToggleLabel={subgroupsToggleLabelFor(viewMode, section.label)}
              showOwnership={showOwnership}
              ownedSet={ownedSet}
              showSeasonIcon={viewMode === "season" || Boolean(section.seasonIconPath)}
              onToggleOpen={() => toggleCollapsed(section.id)}
              onSubgroupsEnabledChange={(enabled) => setSubgroupsEnabled(section.id, enabled)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function subgroupsToggleLabelFor(
  viewMode: ShaderViewMode,
  sectionLabel: string,
): string {
  if (viewMode === "season") return "Subgroups by source";
  if (sectionLabel === "Raids") return "Subgroups by raid";
  if (sectionLabel === "Dungeons") return "Subgroups by dungeon";
  if (sectionLabel === "Destinations") return "Subgroups by destination";
  if (sectionLabel === "Events") return "Subgroups by event";
  if (sectionLabel === "Seasonals") return "Subgroups by seasonal";
  if (sectionLabel === "Vendors") return "Subgroups by vendor";
  return "Subgroups by season";
}

function ShaderSectionCard({
  section,
  open,
  subgroupsEnabled,
  subgroupsToggleLabel,
  showOwnership,
  ownedSet,
  showSeasonIcon,
  onToggleOpen,
  onSubgroupsEnabledChange,
}: {
  section: ShaderSection;
  open: boolean;
  subgroupsEnabled: boolean;
  subgroupsToggleLabel: string;
  showOwnership: boolean;
  ownedSet: Set<string>;
  showSeasonIcon: boolean;
  onToggleOpen: () => void;
  onSubgroupsEnabledChange: (enabled: boolean) => void;
}) {
  const owned = showOwnership ? countOwned(section.items, ownedSet) : null;

  return (
    <section
      id={`shaders-${section.id}`}
      className="scroll-mt-20 overflow-hidden border border-hairline bg-panel/85"
    >
      <div className="flex items-center gap-3 px-4 pt-3.5">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {showSeasonIcon ? (
            <SectionSeasonIcon label={section.label} seasonIconPath={section.seasonIconPath} />
          ) : null}
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-semibold uppercase tracking-[0.06em] text-bone">
            {section.label}
          </h2>
          <span className={`ui-label shrink-0 ${owned !== null ? "text-owned!" : ""}`}>
            {owned === null ? section.itemCount : `${owned} / ${section.itemCount}`}
          </span>
          <ChevronIcon open={open} />
        </button>
        {section.subgroups.length > 1 ? (
          <button
            type="button"
            aria-pressed={subgroupsEnabled}
            title={subgroupsToggleLabel}
            onClick={() => onSubgroupsEnabledChange(!subgroupsEnabled)}
            className={`inline-flex h-7 shrink-0 items-center border px-2.5 font-display text-[11px] uppercase tracking-[0.12em] transition ${
              subgroupsEnabled ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"
            }`}
          >
            {subgroupsToggleLabel.replace(/^Subgroups /, "")}
          </button>
        ) : null}
      </div>
      {owned !== null ? (
        <div className="mt-2.5 max-w-60 px-4">
          <ProgressBar owned={owned} total={section.itemCount} />
        </div>
      ) : null}

      {open ? (
        <div className="space-y-5 px-4 pb-4 pt-3.5">
          {subgroupsEnabled ? (
            section.subgroups.map((subgroup) => (
              <ShaderSubgroupBlock
                key={subgroup.id}
                subgroup={subgroup}
                showOwnership={showOwnership}
                ownedSet={ownedSet}
              />
            ))
          ) : (
            <LootItemGrid
              items={section.items}
              ownedItemHashes={ownedSet}
              showOwnership={showOwnership}
              ownedBorder="gold"
            />
          )}
        </div>
      ) : (
        <div className="pb-3.5" />
      )}
    </section>
  );
}

function ShaderSubgroupBlock({
  subgroup,
  showOwnership,
  ownedSet,
  nested = false,
}: {
  subgroup: ShaderSection["subgroups"][number];
  showOwnership: boolean;
  ownedSet: Set<string>;
  nested?: boolean;
}) {
  const ownedInSub = showOwnership
    ? countOwned(subgroup.items, ownedSet)
    : 0;
  const hasNested = Boolean(subgroup.subgroups?.length);

  return (
    <div className={nested ? "space-y-2" : "space-y-2"}>
      <div className="flex items-center gap-2">
        {subgroup.seasonIconPath ? (
          <SectionSeasonIcon
            label={subgroup.label}
            seasonIconPath={subgroup.seasonIconPath}
          />
        ) : null}
        <h3
          className={
            nested
              ? "text-xs font-medium text-ash"
              : "ui-label text-bone!"
          }
        >
          {subgroup.label}
          <span className="ml-2 text-xs font-normal text-zinc-500">
            {showOwnership
              ? `${ownedInSub} / ${subgroup.items.length}`
              : subgroup.items.length}
          </span>
        </h3>
      </div>

      {hasNested ? (
        <div className="space-y-4 border-l border-zinc-800/80 pl-3">
          {subgroup.subgroups!.map((nestedGroup) => (
            <ShaderSubgroupBlock
              key={nestedGroup.id}
              subgroup={nestedGroup}
              showOwnership={showOwnership}
              ownedSet={ownedSet}
              nested
            />
          ))}
        </div>
      ) : (
        <LootItemGrid
          items={subgroup.items}
          ownedItemHashes={ownedSet}
          showOwnership={showOwnership}
          ownedBorder="gold"
        />
      )}
    </div>
  );
}
