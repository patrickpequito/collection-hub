"use client";

import Image from "next/image";
import Link from "@/components/app-link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useOwnership } from "@/components/client-ownership";
import { CollectionItemIcon } from "@/components/collection-item-icon";
import { StatBlock, StatBlockGrid, StatCount, SectionHeading } from "@/components/detail-page-parts";
import { ProgressBar } from "@/components/home/progress-bar";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import {
  bestCatalystStatus,
  catalystStatus,
  progressShare,
  type CatalystStatus,
} from "@/lib/exotics/catalyst-status";
import type {
  ExoticArmorEntry,
  ExoticCatalystEntry,
  ExoticWeaponEntry,
  ExoticsPageData,
} from "@/lib/exotics/page-data";
import { useCatalystPlugs } from "@/lib/exotics/use-catalyst-plugs";
import { CatalystEffect } from "@/components/exotics/catalyst-effect";
import { useSignedIn } from "@/lib/use-signed-in";
import type { ArmorSlot, WeaponSlot } from "@/types/exotic-item";

const SLOTS: { id: WeaponSlot; label: string }[] = [
  { id: "primary", label: "Kinetic" },
  { id: "special", label: "Energy" },
  { id: "heavy", label: "Power" },
];
const ARMOR_SLOTS: { id: ArmorSlot; label: string }[] = [
  { id: "helmet", label: "Helmet" },
  { id: "gauntlets", label: "Gauntlets" },
  { id: "chest", label: "Chest" },
  { id: "legs", label: "Legs" },
  { id: "classItem", label: "Class item" },
];
const CLASSES = [
  { id: "hunter", label: "Hunter" },
  { id: "titan", label: "Titan" },
  { id: "warlock", label: "Warlock" },
] as const;


const CHIP =
  "inline-flex h-10 items-center border px-4 font-display text-sm uppercase tracking-[0.12em] transition";

function owns(hashes: string[], owned: ReadonlySet<string>) {
  return hashes.some((hash) => owned.has(hash));
}


/** Dropdown with checkboxes: pick several values; none picked = any. */
function MultiFilter({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);
  const summary =
    selected.length === 0
      ? "any"
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`;
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-10 items-center gap-2 border px-2.5 font-display text-xs uppercase tracking-[0.1em] transition disabled:opacity-40 ${
          selected.length ? "border-bone text-bone" : "border-white/[0.22] text-bone/85 hover:border-bone"
        }`}
      >
        {label}: <span className={selected.length ? "text-owned" : ""}>{summary}</span>
        <span aria-hidden className="text-[10px] text-ash">▾</span>
      </button>
      {open ? (
        <div className="absolute left-0 z-30 mt-1 max-h-72 min-w-[12rem] overflow-y-auto border border-white/30 bg-[#12161c] p-2 shadow-lg">
          {options.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2 px-1.5 py-1 text-sm text-bone/85 hover:text-bone">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() =>
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((value) => value !== option.value)
                      : [...selected, option.value],
                  )
                }
                className="size-3 shrink-0 cursor-pointer appearance-none border border-white/40 checked:border-owned checked:bg-owned"
              />
              {option.label}
            </label>
          ))}
          {selected.length ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full border-t border-white/10 px-1.5 pt-1.5 text-left text-xs text-ash hover:text-bone"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function WeaponMeta({ weapon }: { weapon: ExoticWeaponEntry }) {
  const typeIcon = classOrWeaponTypeIconPath(weapon.weaponType);
  const damageIcon = damageTypeIconPath(weapon.damageType);
  return (
    <span className="flex min-w-0 items-center gap-2 text-xs text-bone/75">
      {typeIcon ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
        <img src={typeIcon} alt="" aria-hidden className="h-3.5 w-5 shrink-0 object-contain brightness-0 invert opacity-85" />
      ) : null}
      <span className="truncate">{weapon.weaponType ?? "Weapon"}</span>
      {damageIcon ? (
        <Image
          src={bungieIconUrl(damageIcon)}
          alt={weapon.damageType ?? ""}
          title={weapon.damageType ?? undefined}
          width={14}
          height={14}
          className="size-3.5 shrink-0 object-contain"
          unoptimized
        />
      ) : null}
    </span>
  );
}

function Step({ label, done, dim = false }: { label: string; done: boolean; dim?: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs ${done ? "text-bone" : dim ? "text-ash/60" : "text-ash"}`}>
      <span
        aria-hidden
        className={`size-3 shrink-0 border ${done ? "border-owned bg-owned" : "border-white/40"}`}
      />
      {label}
    </span>
  );
}

function CatalystProgress({ status, compact = false }: { status: CatalystStatus; compact?: boolean }) {
  if (status.kind !== "progress") return null;
  return (
    <div className="flex flex-col gap-2">
      {status.objectives.map((objective) => (
        <div key={objective.description} className="flex flex-col gap-1.5">
          <span className={`flex justify-between gap-2 ${compact ? "text-xs" : "text-[13px]"} text-bone/80`}>
            <span className="truncate">{objective.description}</span>
            <span className="shrink-0 tabular-nums text-owned">
              {objective.progress.toLocaleString("en-US")} / {objective.completionValue.toLocaleString("en-US")}
            </span>
          </span>
          <ProgressBar owned={objective.progress} total={objective.completionValue} />
        </div>
      ))}
    </div>
  );
}

function WeaponCard({
  weapon,
  owned,
  status,
  unlockedCount,
  showOwnership,
  onOpen,
}: {
  weapon: ExoticWeaponEntry;
  owned: boolean;
  status: CatalystStatus;
  unlockedCount: number | null;
  showOwnership: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`ui-panel flex min-w-0 flex-col gap-2.5 p-3 text-left transition hover:border-bone ${
        showOwnership && !owned ? "opacity-70" : ""
      }`}
    >
      <span className="flex min-w-0 gap-3">
        <CollectionItemIcon
          name={weapon.name}
          iconPath={weapon.iconPath}
          source={weapon.source}
          owned={owned}
          showOwnership={showOwnership}
          classOrWeaponType={weapon.weaponType}
          damageType={weapon.damageType}
          ammoType={weapon.ammoType}
          rarity="Exotic"
          itemType="Weapon"
        />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-medium text-bone">{weapon.name}</span>
          <WeaponMeta weapon={weapon} />
        </span>
      </span>
      <span className="flex flex-wrap gap-x-3.5 gap-y-1 border-t border-white/[0.08] pt-2">
        <Step label="Weapon" done={showOwnership && owned} />
        <Step label="Catalyst" done={status.kind === "progress" || status.kind === "unlocked"} />
        <Step label="Unlocked" done={status.kind === "unlocked"} />
        {weapon.catalysts.length > 1 ? (
          <span className="ml-auto text-xs text-ash">
            {unlockedCount === null ? weapon.catalysts.length : `${unlockedCount} / ${weapon.catalysts.length}`} catalysts
          </span>
        ) : null}
      </span>
      <CatalystProgress status={status} compact />
      {weapon.catalysts.length ? (
        <span className="flex flex-wrap gap-1.5">
          {weapon.catalysts.map((catalyst) =>
            catalyst.effect ? (
              <span key={catalyst.name} className="group/effect relative inline-flex min-w-0 items-center gap-1.5 text-xs text-bone/75">
                {catalyst.effect.iconPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bungieIconUrl(catalyst.effect.iconPath)}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 shrink-0 rounded-full border border-owned/50 bg-panel"
                  />
                ) : null}
                {weapon.catalysts.length === 1 ? <span className="truncate">{catalyst.effect.name}</span> : null}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-60 border border-white/30 bg-[#12161c] p-2.5 text-left text-xs leading-snug text-bone/80 shadow-lg group-hover/effect:block"
                >
                  <span className="mb-1 block font-medium text-owned">{catalyst.effect.name}</span>
                  {catalyst.effect.description}
                </span>
              </span>
            ) : null,
          )}
        </span>
      ) : null}
    </button>
  );
}

const CATALYST_LABEL: Record<CatalystStatus["kind"], string> = {
  unknown: "Sign in to see your catalyst progress.",
  missing: "Not found yet.",
  progress: "Found — finish the objective to unlock it.",
  unlocked: "Unlocked.",
};

function Drawer({
  weapon,
  owned,
  statuses,
  showOwnership,
  onClose,
}: {
  weapon: ExoticWeaponEntry;
  owned: boolean;
  statuses: CatalystStatus[];
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
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={weapon.name}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-void/70" />
      <aside className="animate-fade-in relative flex h-full w-full max-w-[26rem] flex-col gap-5 overflow-y-auto border-l border-white/30 bg-[#12161c] p-5">
        <div className="flex items-start gap-3.5">
          <CollectionItemIcon
            name={weapon.name}
            iconPath={weapon.iconPath}
            owned={owned}
            showOwnership={showOwnership}
            rarity="Exotic"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.05em] text-bone">
              {weapon.name}
            </h2>
            <WeaponMeta weapon={weapon} />
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

        <section className="space-y-1.5">
          <h3 className="ui-label">Weapon</h3>
          <p className="text-sm text-bone/85">
            {showOwnership ? (owned ? "Owned" : "Not owned") : "Sign in to see if you own it"}
          </p>
          {weapon.source ? <p className="text-[13px] text-ash">{weapon.source}</p> : null}
        </section>

        <section className="space-y-3">
          <h3 className="ui-label">{weapon.catalysts.length > 1 ? `Catalysts · ${weapon.catalysts.length}` : "Catalyst"}</h3>
          {weapon.catalysts.map((catalyst: ExoticCatalystEntry, index) => {
            const status = statuses[index] ?? { kind: "unknown" as const };
            return (
              <div key={catalyst.name} className="space-y-2 border-t border-white/[0.08] pt-3 first:border-0 first:pt-0">
                <p className="text-sm font-medium text-bone">{catalyst.name}</p>
                <CatalystEffect catalyst={catalyst} />
                <div className="flex flex-wrap gap-x-3.5 gap-y-1">
                  <Step label="Found" done={status.kind === "progress" || status.kind === "unlocked"} />
                  <Step label="Unlocked" done={status.kind === "unlocked"} />
                </div>
                <p className="text-[13px] text-bone/80">{CATALYST_LABEL[status.kind]}</p>
                <CatalystProgress status={status} />
                {status.kind !== "progress" && catalyst.objectives.some((objective) => objective.completionValue > 1) ? (
                  <p className="text-[13px] text-ash">
                    Objective:{" "}
                    {catalyst.objectives
                      .map((objective) => `${objective.description} × ${objective.completionValue.toLocaleString("en-US")}`)
                      .join(" · ")}
                  </p>
                ) : null}
                <p className="text-[13px] text-ash">{catalyst.source}</p>
              </div>
            );
          })}
        </section>

        {weapon.href ? (
          <Link
            href={weapon.href}
            className="mt-auto inline-flex h-10 shrink-0 items-center justify-center border border-white/[0.22] font-display text-sm uppercase tracking-[0.12em] text-bone transition hover:border-bone"
          >
            Open weapon page →
          </Link>
        ) : null}
      </aside>
    </div>
  );
}

function SubHeading({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="ui-label text-bone!">{children}</h3>
      {right ? <span className="ui-label">{right}</span> : null}
    </div>
  );
}

/** Exotics: weapons with their catalyst progress, and exotic armor by class. */
export function ExoticsPage({ data }: { data: ExoticsPageData }) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const profileInstances = useProfileRecordInstances();
  const instances = signedIn ? profileInstances : null;
  const plugs = useCatalystPlugs();

  const [tab, setTab] = useState<"weapons" | "armor">("weapons");
  const [guardianClass, setGuardianClass] = useState<(typeof CLASSES)[number]["id"]>("hunter");
  const [query, setQuery] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<string[]>([]);
  const [damageFilter, setDamageFilter] = useState<string[]>([]);
  const [ownedFilter, setOwnedFilter] = useState<string[]>([]);
  const [catalystFilter, setCatalystFilter] = useState<string[]>([]);
  const [openHash, setOpenHash] = useState<string | null>(null);
  const [showNotStarted, setShowNotStarted] = useState(false);

  const weapons = useMemo(
    () =>
      data.weapons.map((weapon) => {
        const statuses = weapon.catalysts.map((catalyst) =>
          catalystStatus(catalyst, { plugs, instances, ownedItemHashes }),
        );
        return {
          weapon,
          owned: owns(weapon.ownershipHashes, ownedItemHashes),
          statuses,
          status: bestCatalystStatus(statuses),
          unlockedCount: plugs ? statuses.filter((status) => status.kind === "unlocked").length : null,
        };
      }),
    [data.weapons, instances, ownedItemHashes, plugs],
  );

  const catalystsLoaded = Boolean(plugs && instances);
  const allCatalysts = weapons.flatMap((entry) =>
    entry.weapon.catalysts.map((catalyst, index) => ({ entry, catalyst, status: entry.statuses[index] })),
  );
  const inProgress = allCatalysts
    .filter((item) => item.status.kind === "progress")
    .sort((a, b) => progressShare(b.status) - progressShare(a.status));
  // Found catalysts with no kills yet sit behind a toggle.
  const started = inProgress.filter((item) => progressShare(item.status) > 0);
  const notStarted = inProgress.filter((item) => progressShare(item.status) === 0);
  const progressList = showNotStarted ? inProgress : started;
  const weaponTypes = [...new Set(data.weapons.map((weapon) => weapon.weaponType).filter(Boolean))].sort() as string[];
  const damageTypes = [...new Set(data.weapons.map((weapon) => weapon.damageType).filter(Boolean))].sort() as string[];

  const needle = query.trim().toLowerCase();
  const visibleWeapons = weapons.filter(({ weapon, owned, status, statuses }) => {
    if (needle && !weapon.name.toLowerCase().includes(needle)) return false;
    if (slots.length && !slots.includes(weapon.slot)) return false;
    if (weaponTypeFilter.length && !weaponTypeFilter.includes(weapon.weaponType ?? "")) return false;
    if (damageFilter.length && !damageFilter.includes(weapon.damageType ?? "")) return false;
    if (ownedFilter.length && showOwnership && !ownedFilter.includes(owned ? "yes" : "no")) return false;
    if (catalystFilter.length) {
      const kinds = new Set([status.kind, ...statuses.map((entry) => entry.kind)]);
      if (!catalystFilter.some((kind) => kinds.has(kind as CatalystStatus["kind"]))) return false;
    }
    return true;
  });

  const armorFor = (cls: string) => data.armor.filter((piece) => piece.guardianClass === cls);
  const countOwned = (pieces: ExoticArmorEntry[]) =>
    pieces.filter((piece) => owns(piece.ownershipHashes, ownedItemHashes)).length;
  const visibleArmor = armorFor(guardianClass).filter(
    (piece) =>
      (!needle || piece.name.toLowerCase().includes(needle)) &&
      (!ownedFilter.length ||
        !showOwnership ||
        ownedFilter.includes(owns(piece.ownershipHashes, ownedItemHashes) ? "yes" : "no")),
  );

  const opened = weapons.find((entry) => entry.weapon.itemHash === openHash);
  const ownedOrNull = (count: number) => (showOwnership ? count : null);

  return (
    <div className="space-y-9">
      <StatBlockGrid count={4}>
        <StatBlock label="Exotic weapons">
          <StatCount owned={ownedOrNull(weapons.filter((entry) => entry.owned).length)} total={weapons.length} gold />
        </StatBlock>
        <StatBlock label="Exotic armor">
          <StatCount owned={ownedOrNull(countOwned(data.armor))} total={data.armor.length} />
        </StatBlock>
        <StatBlock label="Catalysts unlocked">
          <StatCount
            owned={catalystsLoaded ? allCatalysts.filter((item) => item.status.kind === "unlocked").length : null}
            total={allCatalysts.length}
          />
        </StatBlock>
        <StatBlock label="Catalysts in progress">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {catalystsLoaded ? inProgress.length : "—"}
          </span>
          <span className="text-[13px] text-ash">
            {catalystsLoaded ? "Found, objective still open" : signedIn ? "Loading your catalysts…" : "Sign in to track"}
          </span>
        </StatBlock>
      </StatBlockGrid>

      {!signedIn ? (
        <p className="text-xs text-amber-200/80">
          Sign in with Bungie to see your exotics and catalyst progress.
        </p>
      ) : null}

      {inProgress.length > 0 ? (
        <section className="space-y-3">
          <SectionHeading title="Catalysts in progress" note="Closest to unlock first" />
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {progressList.map(({ entry, catalyst, status }) => (
              <button
                key={`${entry.weapon.itemHash}-${catalyst.name}`}
                type="button"
                onClick={() => setOpenHash(entry.weapon.itemHash)}
                className="ui-panel flex min-w-0 items-center gap-3 p-3 text-left transition hover:border-bone"
              >
                <CollectionItemIcon
                  name={entry.weapon.name}
                  iconPath={entry.weapon.iconPath}
                  owned={entry.owned}
                  showOwnership={showOwnership}
                  rarity="Exotic"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex justify-between gap-2">
                    <span className="truncate text-[15px] font-medium text-bone">
                      {entry.weapon.name}
                      {entry.weapon.catalysts.length > 1 ? (
                        <span className="text-ash"> · {catalyst.name}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[13px] text-owned">
                      {Math.floor(progressShare(status) * 100)}%
                    </span>
                  </span>
                  <CatalystProgress status={status} compact />
                </span>
              </button>
            ))}
          </div>
          {started.length === 0 && !showNotStarted ? (
            <p className="text-sm text-ash">No catalysts with progress yet.</p>
          ) : null}
          {notStarted.length > 0 ? (
            <button
              type="button"
              aria-pressed={showNotStarted}
              onClick={() => setShowNotStarted((value) => !value)}
              className="inline-flex h-9 items-center border border-white/[0.22] px-3.5 font-display text-xs uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-bone"
            >
              {showNotStarted
                ? "Hide not started"
                : `Show not started (${notStarted.length})`}
            </button>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-2.5">
          <div className="flex" role="tablist" aria-label="Exotics">
            {(["weapons", "armor"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`${CHIP} ${tab === id ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"}`}
              >
                {id}
              </button>
            ))}
          </div>
          <span className="ui-label">
            {tab === "weapons"
              ? `${visibleWeapons.length} weapons`
              : `${CLASSES.find((entry) => entry.id === guardianClass)?.label} · ${visibleArmor.length} pieces`}
          </span>
        </div>

        <div className="ui-panel flex flex-wrap items-center gap-2 p-2.5">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exotics…"
            aria-label="Search exotics"
            className="h-10 min-w-0 flex-[1_1_14rem] border border-white/30 bg-transparent px-3 text-sm text-bone placeholder:text-ash focus:border-bone focus:outline-none"
          />
          {tab === "weapons" ? (
            <>
              <MultiFilter
                label="Slot"
                options={SLOTS.map((entry) => ({ value: entry.id, label: entry.label }))}
                selected={slots}
                onChange={setSlots}
              />
              <MultiFilter
                label="Weapon type"
                options={weaponTypes.map((value) => ({ value, label: value }))}
                selected={weaponTypeFilter}
                onChange={setWeaponTypeFilter}
              />
              <MultiFilter
                label="Damage"
                options={damageTypes.map((value) => ({ value, label: value }))}
                selected={damageFilter}
                onChange={setDamageFilter}
              />
            </>
          ) : null}
          <MultiFilter
            label="Owned"
            options={[
              { value: "yes", label: "Owned" },
              { value: "no", label: "Not owned" },
            ]}
            selected={ownedFilter}
            onChange={setOwnedFilter}
            disabled={!showOwnership}
          />
          {tab === "weapons" ? (
            <MultiFilter
              label="Catalyst"
              options={[
                { value: "missing", label: "Not found" },
                { value: "progress", label: "In progress" },
                { value: "unlocked", label: "Unlocked" },
              ]}
              selected={catalystFilter}
              onChange={setCatalystFilter}
              disabled={!catalystsLoaded}
            />
          ) : null}
        </div>

        {tab === "weapons" ? (
          <div className="space-y-6">
            {SLOTS.map((entry) => {
              const list = visibleWeapons.filter((item) => item.weapon.slot === entry.id);
              if (list.length === 0) return null;
              const all = weapons.filter((item) => item.weapon.slot === entry.id);
              return (
                <div key={entry.id} className="space-y-2.5">
                  <SubHeading
                    right={showOwnership ? `${all.filter((item) => item.owned).length} / ${all.length}` : all.length}
                  >
                    {entry.label}
                  </SubHeading>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map(({ weapon, owned, status, unlockedCount }) => (
                      <WeaponCard
                        key={weapon.itemHash}
                        weapon={weapon}
                        owned={owned}
                        status={status}
                        unlockedCount={unlockedCount}
                        showOwnership={showOwnership}
                        onOpen={() => setOpenHash(weapon.itemHash)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {visibleWeapons.length === 0 ? (
              <p className="border border-dashed border-white/[0.14] px-6 py-10 text-center text-sm text-ash">
                No exotic weapons match.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {CLASSES.map((entry) => {
                const pieces = armorFor(entry.id);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={guardianClass === entry.id}
                    onClick={() => setGuardianClass(entry.id)}
                    className={`${CHIP} ${
                      guardianClass === entry.id ? "border-bone text-bone" : "border-white/[0.22] text-bone/60 hover:text-bone"
                    }`}
                  >
                    {entry.label}
                    <span className="ml-2 text-ash">
                      {showOwnership ? `${countOwned(pieces)} / ${pieces.length}` : pieces.length}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {ARMOR_SLOTS.map((entry) => {
                const pieces = visibleArmor.filter((piece) => piece.armorSlot === entry.id);
                const all = armorFor(guardianClass).filter((piece) => piece.armorSlot === entry.id);
                return (
                  <div key={entry.id} className="space-y-2.5">
                    <SubHeading right={showOwnership ? `${countOwned(all)} / ${all.length}` : all.length}>
                      {entry.label}
                    </SubHeading>
                    {/* Icons stretch to fill their column: five per row, four in the five-column desktop layout. */}
                    <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-4">
                      {pieces.map((piece) => (
                        <CollectionItemIcon
                          key={piece.itemHash}
                          fluid
                          fillCell
                          name={piece.name}
                          iconPath={piece.iconPath}
                          source={piece.source}
                          owned={owns(piece.ownershipHashes, ownedItemHashes)}
                          showOwnership={showOwnership}
                          href={piece.href}
                          rarity="Exotic"
                          itemType="Armor"
                          classOrWeaponType={CLASSES.find((cls) => cls.id === piece.guardianClass)?.label}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {opened ? (
        <Drawer
          weapon={opened.weapon}
          owned={opened.owned}
          statuses={opened.statuses}
          showOwnership={showOwnership}
          onClose={() => setOpenHash(null)}
        />
      ) : null}
    </div>
  );
}
