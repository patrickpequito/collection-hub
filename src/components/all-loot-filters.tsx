"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { localSeasonFilterIconPath } from "@/lib/all-loot/season-icon-path";
import { armorSlotIconPath } from "@/lib/armor-slot-icon";
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

function ArmorSlotFilterLabel({ slot }: { slot: string }) {
  const iconPath = armorSlotIconPath(slot);

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
      {iconPath ? (
        // eslint-disable-next-line @next/next/no-img-element -- local PNG slot icons
        <img
          src={iconPath}
          alt=""
          aria-hidden
          className="h-[1em] w-[1em] shrink-0 object-contain"
        />
      ) : null}
      <span className="truncate">{slot}</span>
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


type FilterGroupProps = {
  label: string;
  options?: string[];
  groups?: AllLootTypeFilterGroup[];
  selected: string[];
  onChange: (values: string[]) => void;
  renderOption?: (option: string) => ReactNode;
  /** Shows a filter box inside long lists (Season, Weapon type). */
  searchable?: boolean;
};

/** Collapsed filter row; opens to a checkbox list with icons. */
function FilterGroup({
  label,
  options = [],
  groups,
  selected,
  onChange,
  renderOption,
  searchable = false,
}: FilterGroupProps) {
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState("");
  const toggleValue = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value],
    );
  const needle = find.trim().toLowerCase();
  const visibleGroups = (groups ?? [{ types: options }])
    .map((group) => ({
      ...group,
      types: needle
        ? group.types.filter((option) => option.toLowerCase().includes(needle))
        : group.types,
    }))
    .filter((group) => group.types.length > 0);

  const summary =
    selected.length === 0 ? "Any" : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div className="border-b border-white/[0.08]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 py-2.5 text-left"
      >
        <ActiveBox active={selected.length > 0} />
        <span className="ui-label flex-1 text-bone!">{label}</span>
        <span
          className={`max-w-[7.5rem] truncate text-xs ${
            selected.length > 0 ? "text-owned" : "text-ash"
          }`}
        >
          {summary}
        </span>
        <span className={`text-[10px] text-ash transition ${open ? "rotate-90" : ""}`} aria-hidden>
          ▸
        </span>
      </button>
      {open ? (
        <div className="max-h-72 overflow-y-auto pb-2.5 pl-[1.875rem]">
          {searchable ? (
            <input
              type="search"
              value={find}
              onChange={(event) => setFind(event.target.value)}
              placeholder={`Find ${label.toLowerCase()}…`}
              className="mb-1.5 h-8 w-full border border-white/20 bg-transparent px-2.5 text-xs text-bone placeholder:text-ash focus:border-bone focus:outline-none"
            />
          ) : null}
          {visibleGroups.map((group, index) => (
            <div key={group.label ?? `group-${index}`}>
              {group.label ? (
                <p className="ui-label pb-0.5 pt-2 text-[10px]!">{group.label}</p>
              ) : null}
              {group.types.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 py-1 text-sm text-bone/85 hover:text-bone"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleValue(option)}
                    className="size-3 shrink-0 cursor-pointer appearance-none border border-white/40 bg-transparent transition checked:border-owned checked:bg-owned focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-bone"
                  />
                  <span className="min-w-0 truncate">
                    {renderOption ? renderOption(option) : option}
                  </span>
                </label>
              ))}
            </div>
          ))}
          {visibleGroups.length === 0 ? <p className="py-1 text-xs text-ash">No matches</p> : null}
        </div>
      ) : null}
    </div>
  );
}

type TriState = "all" | "yes" | "no";

/** Any / Yes / No switch for the boolean filters (no dropdown needed). */
function TriStateFilter({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
  disabled?: boolean;
}) {
  const options: { value: TriState; label: string }[] = [
    { value: "all", label: "Any" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  return (
    <div
      className="flex items-center gap-2.5 border-b border-white/[0.08] py-2.5 last:border-0"
      title={disabled ? "Sign in to filter by collection" : undefined}
    >
      <ActiveBox active={value !== "all"} />
      <span className={`ui-label flex-1 ${disabled ? "" : "text-bone!"}`}>{label}</span>
      <span role="radiogroup" aria-label={label} className="inline-flex border border-white/[0.22]">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
              value === option.value ? "bg-bone text-void" : "text-ash hover:text-bone"
            }`}
          >
            {option.label}
          </button>
        ))}
      </span>
    </div>
  );
}

/** Square before each filter name; filled while that filter has a selection. */
function ActiveBox({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`size-3 shrink-0 border ${active ? "border-owned bg-owned" : "border-white/40"}`}
    />
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
    filters.sources.length > 0 ||
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
  sources: string[];
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
  appendList("sources", filters.sources);

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
    sources: [],
    obtainable: "all",
    collected: "all",
  };
}

/** Label for one active filter value, for the chips above the results. */
export type ActiveFilterChip = { key: string; label: string; clear: (filters: AllLootFilterState) => AllLootFilterState };

const LIST_KEYS = [
  "types",
  "seasons",
  "rarities",
  "weaponTypes",
  "classes",
  "damageTypes",
  "weaponSlots",
  "gearSlots",
] as const;

export function activeFilterChips(filters: AllLootFilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  if (filters.sources.length > 0) {
    chips.push({
      key: "sources",
      label: filters.sources.map((source) => source.replace(/^./, (c) => c.toUpperCase())).join(" & "),
      clear: (current) => ({ ...current, sources: [] }),
    });
  }
  for (const key of LIST_KEYS) {
    for (const value of filters[key]) {
      chips.push({
        key: `${key}:${value}`,
        label: value,
        clear: (current) => ({ ...current, [key]: current[key].filter((entry) => entry !== value) }),
      });
    }
  }
  if (filters.obtainable !== "all") {
    chips.push({
      key: "obtainable",
      label: filters.obtainable === "yes" ? "Obtainable" : "Not obtainable",
      clear: (current) => ({ ...current, obtainable: "all" }),
    });
  }
  if (filters.collected !== "all") {
    chips.push({
      key: "collected",
      label: filters.collected === "yes" ? "Collected" : "Not collected",
      clear: (current) => ({ ...current, collected: "all" }),
    });
  }
  return chips;
}

export { hasAnyFilters };

type AllLootFilterSidebarProps = {
  facets: AllLootFacets | null;
  filters: AllLootFilterState;
  onFiltersChange: (filters: AllLootFilterState) => void;
  ownershipFilterEnabled?: boolean;
};

/** Collapsed filter groups (Type → Armor slot) plus the two Any / Yes / No switches. */
export function AllLootFilterSidebar({
  facets,
  filters,
  onFiltersChange,
  ownershipFilterEnabled = false,
}: AllLootFilterSidebarProps) {
  const update = (partial: Partial<AllLootFilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  if (!facets) {
    return <p className="ui-panel p-4 text-xs text-ash">Loading filters…</p>;
  }

  return (
    <aside aria-label="Filters" className="ui-panel px-3.5 py-0.5">
      <FilterGroup
        label="Type"
        groups={buildTypeFilterGroups(facets.types)}
        selected={filters.types}
        onChange={(types) => update({ types })}
      />
      <FilterGroup
        label="Season"
        options={facets.seasons}
        selected={filters.seasons}
        onChange={(seasons) => update({ seasons })}
        renderOption={(season) => <SeasonFilterLabel season={season} />}
        searchable
      />
      <FilterGroup
        label="Rarity"
        options={facets.rarities}
        selected={filters.rarities}
        onChange={(rarities) => update({ rarities })}
        renderOption={(rarity) => <RarityFilterLabel rarity={rarity} />}
      />
      <FilterGroup
        label="Weapon type"
        options={facets.weaponTypes}
        selected={filters.weaponTypes}
        onChange={(weaponTypes) => update({ weaponTypes })}
        renderOption={(value) => <ClassOrWeaponTypeFilterLabel value={value} />}
        searchable
      />
      <FilterGroup
        label="Class"
        options={facets.classes}
        selected={filters.classes}
        onChange={(classes) => update({ classes })}
        renderOption={(value) => <ClassOrWeaponTypeFilterLabel value={value} />}
      />
      <FilterGroup
        label="Damage"
        options={facets.damageTypes}
        selected={filters.damageTypes}
        onChange={(damageTypes) => update({ damageTypes })}
        renderOption={(damageType) => <DamageTypeFilterLabel damageType={damageType} />}
      />
      <FilterGroup
        label="Weapon slot"
        options={facets.weaponSlots}
        selected={filters.weaponSlots}
        onChange={(weaponSlots) => update({ weaponSlots })}
      />
      <FilterGroup
        label="Armor slot"
        options={facets.gearSlots}
        selected={filters.gearSlots}
        onChange={(gearSlots) => update({ gearSlots })}
        renderOption={(slot) => <ArmorSlotFilterLabel slot={slot} />}
      />
      <TriStateFilter
        label="Obtainable"
        value={filters.obtainable}
        onChange={(obtainable) => update({ obtainable })}
      />
      <TriStateFilter
        label="Collected"
        value={filters.collected}
        onChange={(collected) => update({ collected })}
        disabled={!ownershipFilterEnabled}
      />
    </aside>
  );
}
