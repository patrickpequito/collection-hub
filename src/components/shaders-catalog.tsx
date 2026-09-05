"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LootItemGrid } from "@/components/loot-section";
import { localSeasonIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import {
  groupShaderCatalog,
  type ShaderCatalogItem,
  type ShaderSection,
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

function SubgroupsToggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}) {
  return (
    <label
      className="flex shrink-0 items-center gap-2 text-xs text-zinc-500"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <span className="hidden sm:inline">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onChange(!enabled);
        }}
        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          enabled
            ? "border-zinc-600 bg-zinc-600"
            : "border-zinc-700 bg-zinc-800"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-3.5 rounded-full bg-zinc-200 transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

const VIEW_OPTIONS: { id: ShaderViewMode; label: string; hint: string }[] = [
  {
    id: "season",
    label: "Season / expansion",
    hint: "Group by icon, then by where they drop",
  },
  {
    id: "activity",
    label: "Activity",
    hint: "Group by drop source, then by season icon",
  },
];

function ViewModeToggle({
  value,
  onChange,
}: {
  value: ShaderViewMode;
  onChange: (mode: ShaderViewMode) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Group by
      </p>
      <div
        className="inline-flex max-w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5"
        role="group"
        aria-label="Shader grouping"
      >
        {VIEW_OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              title={option.hint}
              onClick={() => onChange(option.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                active
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        {VIEW_OPTIONS.find((option) => option.id === value)?.hint}
      </p>
    </div>
  );
}

export function ShadersCatalog({
  items,
  facetSeasons,
  totalCount,
}: ShadersCatalogProps) {
  const signedIn = useSignedIn();
  const { itemHashes: ownedItemHashes, error: inventoryError } =
    useOwnedItemHashes(signedIn);
  const showOwnership = signedIn && !inventoryError;

  const ownedSet = useMemo(
    () => new Set(ownedItemHashes),
    [ownedItemHashes],
  );

  const [viewMode, setViewMode] = useState<ShaderViewMode>("season");
  /** Section ids that are collapsed. Default: all expanded. */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  /** Section ids with subgroups enabled. Default: all flat (off). */
  const [subgroupsOn, setSubgroupsOn] = useState<Set<string>>(
    () => new Set(),
  );

  const sections = useMemo(
    () => groupShaderCatalog(items, viewMode, facetSeasons),
    [items, viewMode, facetSeasons],
  );

  const ownedTotal = useMemo(() => {
    if (!showOwnership) return 0;
    return countOwned(
      items.map(
        ({
          seasonLabel: _s,
          acquisitionLabel: _a,
          acquisitionDetail: _d,
          ...loot
        }): LootItem => loot,
      ),
      ownedSet,
    );
  }, [items, ownedSet, showOwnership]);

  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setSubgroupsEnabled = (id: string, enabled: boolean) => {
    setSubgroupsOn((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleViewModeChange = (mode: ShaderViewMode) => {
    setViewMode(mode);
    setCollapsed(new Set());
    setSubgroupsOn(new Set());
  };

  return (
    <div className="space-y-6">
      {inventoryError ? (
        <p className="text-xs text-amber-200/80">
          Collection unavailable: {inventoryError}
        </p>
      ) : null}

      {showOwnership ? (
        <p className="text-xs text-zinc-500">
          Gold border = acquired. Dimmed icons = not collected yet.{" "}
          <span className="text-zinc-400">
            {ownedTotal} / {totalCount} shaders
          </span>
        </p>
      ) : (
        <p className="text-xs text-zinc-500">
          Sign in with Bungie to see which shaders you already own.
        </p>
      )}

      <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />

      <div className="space-y-4">
        {sections.map((section) => (
          <ShaderSectionCard
            key={section.id}
            section={section}
            open={!collapsed.has(section.id)}
            subgroupsEnabled={subgroupsOn.has(section.id)}
            subgroupsToggleLabel={subgroupsToggleLabelFor(
              viewMode,
              section.label,
            )}
            showOwnership={showOwnership}
            ownedSet={ownedSet}
            showSeasonIcon={
              viewMode === "season" || Boolean(section.seasonIconPath)
            }
            onToggleOpen={() => toggleCollapsed(section.id)}
            onSubgroupsEnabledChange={(enabled) =>
              setSubgroupsEnabled(section.id, enabled)
            }
          />
        ))}
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
  const ownedInSection = showOwnership
    ? countOwned(section.items, ownedSet)
    : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-2 border-b border-zinc-800/0 px-2 py-1.5 sm:gap-3 sm:px-3">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-zinc-800/50"
        >
          {showSeasonIcon ? (
            <SectionSeasonIcon
              label={section.label}
              seasonIconPath={section.seasonIconPath}
            />
          ) : null}
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-100">
            {section.label}
          </h2>
          <span className="shrink-0 text-xs text-zinc-500">
            {showOwnership
              ? `${ownedInSection} / ${section.itemCount}`
              : `${section.itemCount}`}
          </span>
          <ChevronIcon open={open} />
        </button>
        <div className="pr-2">
          <SubgroupsToggle
            enabled={subgroupsEnabled}
            onChange={onSubgroupsEnabledChange}
            label={subgroupsToggleLabel}
          />
        </div>
      </div>

      {open ? (
        <div className="space-y-5 border-t border-zinc-800 px-4 py-4">
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
      ) : null}
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
              ? "text-xs font-medium text-zinc-400"
              : "text-sm font-medium text-zinc-300"
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
