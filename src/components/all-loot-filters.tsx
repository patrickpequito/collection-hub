"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { localSeasonFilterIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import {
  classOrWeaponTypeIconPath,
  isGuardianClass,
} from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import { itemRarityColor } from "@/lib/item-rarity-color";
import type { AllLootFacets } from "@/types/all-loot";
import {
  buildTypeFilterGroups,
  type AllLootTypeFilterGroup,
} from "@/lib/all-loot/type-groups";

type FilterDropdownProps = {
  label: string;
  options?: string[];
  groups?: AllLootTypeFilterGroup[];
  selected: string[];
  onChange: (values: string[]) => void;
  renderOption?: (option: string) => ReactNode;
  renderSummaryItem?: (value: string) => ReactNode;
  menuClassName?: string;
};

function SeasonFilterLabel({ season }: { season: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
      <Image
        src={bungieIconUrl(localSeasonFilterIconPath(season))}
        alt=""
        width={14}
        height={14}
        className="h-[1em] w-[1em] shrink-0 object-contain"
        aria-hidden
        unoptimized
      />
      <span className="truncate">{season}</span>
    </span>
  );
}

function DamageTypeFilterLabel({ damageType }: { damageType: string }) {
  const iconPath = damageTypeIconPath(damageType);

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
      {iconPath ? (
        <Image
          src={bungieIconUrl(iconPath)}
          alt=""
          width={14}
          height={14}
          className="h-[1em] w-[1em] shrink-0 object-contain"
          aria-hidden
          unoptimized
        />
      ) : null}
      <span className="truncate">{damageType}</span>
    </span>
  );
}

function RarityFilterLabel({ rarity }: { rarity: string }) {
  return (
    <span
      className="truncate font-medium"
      style={{ color: itemRarityColor(rarity) }}
    >
      {rarity}
    </span>
  );
}

function ClassOrWeaponTypeFilterLabel({ value }: { value: string }) {
  const iconPath = classOrWeaponTypeIconPath(value);
  const isClass = isGuardianClass(value);
  const classIconSize =
    value === "Warlock" ? "h-[14px] w-[14px]" : "h-3.5 w-3.5";

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
      {iconPath ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
        <img
          src={iconPath}
          alt=""
          aria-hidden
          className={`shrink-0 object-contain object-left brightness-0 invert opacity-[0.85] ${
            isClass ? classIconSize : "h-3.5 w-5"
          }`}
        />
      ) : null}
      <span className="truncate">{value}</span>
    </span>
  );
}

function FilterDropdown({
  label,
  options = [],
  groups,
  selected,
  onChange,
  renderOption,
  renderSummaryItem,
  menuClassName,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = selected.length > 0;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((entry) => entry !== value));
      return;
    }
    onChange([...selected, value]);
  };

  const summary =
    selected.length === 0
      ? null
      : selected.length === 1
        ? renderSummaryItem
          ? renderSummaryItem(selected[0])
          : selected[0]
        : `${selected.length}`;

  const summaryIsCustom = selected.length === 1 && Boolean(renderSummaryItem);
  const optionCount = groups
    ? groups.reduce((count, group) => count + group.types.length, 0)
    : options.length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`inline-flex max-w-[12rem] items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
          active
            ? "border-zinc-500 bg-zinc-800 text-zinc-50"
            : "border-zinc-600 bg-zinc-900/90 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/90"
        }`}
      >
        <span className="shrink-0 text-zinc-400">{label}</span>
        {summary ? (
          <span
            className={
              summaryIsCustom
                ? "flex min-w-0 items-center truncate font-medium"
                : "truncate font-medium"
            }
          >
            {summary}
          </span>
        ) : null}
        <span className="shrink-0 text-[10px] text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          className={`absolute left-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl ${
            menuClassName ?? "min-w-[10rem]"
          }`}
        >
          {optionCount === 0 ? (
            <p className="px-2 py-1 text-xs text-zinc-500">No options</p>
          ) : groups ? (
            groups.map((group, groupIndex) => (
              <div key={group.label ?? `group-${groupIndex}`}>
                {group.label ? (
                  <p className="px-2 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 first:pt-0.5">
                    {group.label}
                  </p>
                ) : null}
                {group.types.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => toggleValue(option)}
                      className="rounded border-zinc-700 bg-zinc-900"
                    />
                    <span className="min-w-0 truncate">
                      {renderOption ? renderOption(option) : option}
                    </span>
                  </label>
                ))}
              </div>
            ))
          ) : (
            options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleValue(option)}
                  className="rounded border-zinc-700 bg-zinc-900"
                />
                <span className="min-w-0 truncate">
                  {renderOption ? renderOption(option) : option}
                </span>
              </label>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

type ObtainableFilterProps = {
  value: "all" | "yes" | "no";
  onChange: (value: "all" | "yes" | "no") => void;
};

function ObtainableFilter({ value, onChange }: ObtainableFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = value !== "all";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const labels = { all: "Any", yes: "Yes", no: "No" } as const;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
          active
            ? "border-zinc-500 bg-zinc-800 text-zinc-50"
            : "border-zinc-600 bg-zinc-900/90 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/90"
        }`}
      >
        <span className="text-zinc-400">Obtainable</span>
        {active ? (
          <span className="font-medium">{labels[value]}</span>
        ) : null}
        <span className="text-[10px] text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 z-30 mt-1 min-w-[7rem] rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
          {(["all", "yes", "no"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full rounded px-2 py-1 text-left text-xs transition ${
                value === option
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type CollectedFilterProps = {
  value: "all" | "yes" | "no";
  onChange: (value: "all" | "yes" | "no") => void;
  disabled?: boolean;
};

function CollectedFilter({ value, onChange, disabled }: CollectedFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = value !== "all";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const labels = { all: "Any", yes: "Yes", no: "No" } as const;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        disabled={disabled}
        title={disabled ? "Sign in to filter by collection" : undefined}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
          disabled
            ? "cursor-not-allowed border-zinc-700/80 bg-zinc-900/50 text-zinc-500"
            : active
              ? "border-zinc-500 bg-zinc-800 text-zinc-50"
              : "border-zinc-600 bg-zinc-900/90 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/90"
        }`}
      >
        <span className={disabled ? "text-zinc-600" : "text-zinc-400"}>
          Collected
        </span>
        {active ? (
          <span className="font-medium">{labels[value]}</span>
        ) : null}
        <span className="text-[10px] text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open && !disabled ? (
        <div className="absolute left-0 z-30 mt-1 min-w-[7rem] rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
          {(["all", "yes", "no"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full rounded px-2 py-1 text-left text-xs transition ${
                value === option
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function hasAnyFilters(filters: AllLootFilterState) {
  return (
    filters.query.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.seasons.length > 0 ||
    filters.rarities.length > 0 ||
    filters.classes.length > 0 ||
    filters.weaponTypes.length > 0 ||
    filters.damageTypes.length > 0 ||
    filters.weaponSlots.length > 0 ||
    filters.gearSlots.length > 0 ||
    filters.obtainable !== "all" ||
    filters.collected !== "all"
  );
}

export type AllLootFilterState = {
  query: string;
  types: string[];
  seasons: string[];
  rarities: string[];
  classes: string[];
  weaponTypes: string[];
  damageTypes: string[];
  weaponSlots: string[];
  gearSlots: string[];
  obtainable: "all" | "yes" | "no";
  collected: "all" | "yes" | "no";
};

export function buildAllLootSearchParams(
  filters: AllLootFilterState,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.obtainable !== "all") params.set("obtainable", filters.obtainable);
  if (filters.collected !== "all") params.set("collected", filters.collected);
  params.set("page", String(page));

  const appendList = (key: string, values: string[]) => {
    for (const value of values) params.append(key, value);
  };

  appendList("types", filters.types);
  appendList("seasons", filters.seasons);
  appendList("rarities", filters.rarities);
  appendList("classes", filters.classes);
  appendList("weaponTypes", filters.weaponTypes);
  appendList("damageTypes", filters.damageTypes);
  appendList("weaponSlots", filters.weaponSlots);
  appendList("gearSlots", filters.gearSlots);

  return params;
}

export function emptyAllLootFilterState(): AllLootFilterState {
  return {
    query: "",
    types: [],
    seasons: [],
    rarities: [],
    classes: [],
    weaponTypes: [],
    damageTypes: [],
    weaponSlots: [],
    gearSlots: [],
    obtainable: "all",
    collected: "all",
  };
}

export type AllLootFiltersPanelProps = {
  facets: AllLootFacets | null;
  filters: AllLootFilterState;
  onFiltersChange: (filters: AllLootFilterState) => void;
  onSearch: () => void;
  searching: boolean;
  ownershipFilterEnabled?: boolean;
};

export function AllLootFiltersPanel({
  facets,
  filters,
  onFiltersChange,
  onSearch,
  searching,
  ownershipFilterEnabled = false,
}: AllLootFiltersPanelProps) {
  const showClear = hasAnyFilters(filters);

  const update = (partial: Partial<AllLootFilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const clearAll = () => {
    onFiltersChange(emptyAllLootFilterState());
  };

  return (
    <div className="space-y-2 border-b border-zinc-700/80 pb-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
          }}
          placeholder="Search name, type, source…"
          className="h-9 min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-900 px-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-500/50"
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={searching || !facets}
          className="h-9 shrink-0 rounded-md bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {facets ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterDropdown
            label="Type"
            groups={buildTypeFilterGroups(facets.types)}
            selected={filters.types}
            onChange={(types) => update({ types })}
          />
          <FilterDropdown
            label="Season"
            options={facets.seasons}
            selected={filters.seasons}
            onChange={(seasons) => update({ seasons })}
            menuClassName="min-w-[14rem]"
            renderOption={(season) => <SeasonFilterLabel season={season} />}
            renderSummaryItem={(season) => <SeasonFilterLabel season={season} />}
          />
          <FilterDropdown
            label="Rarity"
            options={facets.rarities}
            selected={filters.rarities}
            onChange={(rarities) => update({ rarities })}
            renderOption={(rarity) => <RarityFilterLabel rarity={rarity} />}
            renderSummaryItem={(rarity) => <RarityFilterLabel rarity={rarity} />}
          />
          <FilterDropdown
            label="Class"
            options={facets.classes}
            selected={filters.classes}
            onChange={(classes) => update({ classes })}
            renderOption={(value) => (
              <ClassOrWeaponTypeFilterLabel value={value} />
            )}
            renderSummaryItem={(value) => (
              <ClassOrWeaponTypeFilterLabel value={value} />
            )}
          />
          <FilterDropdown
            label="Weapon type"
            options={facets.weaponTypes}
            selected={filters.weaponTypes}
            onChange={(weaponTypes) => update({ weaponTypes })}
            renderOption={(value) => (
              <ClassOrWeaponTypeFilterLabel value={value} />
            )}
            renderSummaryItem={(value) => (
              <ClassOrWeaponTypeFilterLabel value={value} />
            )}
          />
          <FilterDropdown
            label="Damage"
            options={facets.damageTypes}
            selected={filters.damageTypes}
            onChange={(damageTypes) => update({ damageTypes })}
            renderOption={(damageType) => (
              <DamageTypeFilterLabel damageType={damageType} />
            )}
            renderSummaryItem={(damageType) => (
              <DamageTypeFilterLabel damageType={damageType} />
            )}
          />
          <FilterDropdown
            label="Weapon slot"
            options={facets.weaponSlots}
            selected={filters.weaponSlots}
            onChange={(weaponSlots) => update({ weaponSlots })}
          />
          <FilterDropdown
            label="Armor slot"
            options={facets.gearSlots}
            selected={filters.gearSlots}
            onChange={(gearSlots) => update({ gearSlots })}
          />
          <ObtainableFilter
            value={filters.obtainable}
            onChange={(obtainable) => update({ obtainable })}
          />
          <CollectedFilter
            value={filters.collected}
            onChange={(collected) => update({ collected })}
            disabled={!ownershipFilterEnabled}
          />

          {showClear ? (
            <button
              type="button"
              onClick={clearAll}
              className="px-1 text-xs text-zinc-400 transition hover:text-zinc-200"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">Loading filters…</p>
      )}
    </div>
  );
}

// Re-export for any external usage
export { FilterDropdown as MultiFilterDropdown };
export { FilterDropdown as GroupedMultiFilterDropdown };
