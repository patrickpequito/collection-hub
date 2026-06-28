"use client";

import Image from "next/image";
import { WeaponRollIcon } from "@/components/weapon-roll-icon";
import { resolveVersionDisplayLabel } from "@/lib/all-loot/season-badges";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { WeaponPlugDefinition } from "@/types/all-loot";
import type { WeaponRollInstance } from "@/types/weapon-rolls";

type WeaponRollsPanelProps = {
  rolls: WeaponRollInstance[];
  loading: boolean;
  error: string | null;
  showRolls: boolean;
  onShowRollsChange: (show: boolean) => void;
  activeRollId: string | null;
  pinnedRollId: string | null;
  onRollHover: (rollId: string | null) => void;
  onRollPin: (rollId: string | null) => void;
  plugIndex?: Record<string, WeaponPlugDefinition>;
  showVersionLabels?: boolean;
};

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function RollStatusIcon({ roll }: { roll: WeaponRollInstance }) {
  if (roll.isBest) {
    return (
      <span
        className="text-sm leading-none text-amber-400"
        title="Best copy you own"
        aria-label="Best copy"
      >
        ★
      </span>
    );
  }

  if (roll.isShardCandidate) {
    return (
      <span
        className="text-sm leading-none text-red-400"
        title="Another copy is better in PvE and PvP"
        aria-label="Safe to dismantle"
      >
        ✕
      </span>
    );
  }

  return <span className="inline-block w-3.5" aria-hidden />;
}

function RollPerkChips({
  roll,
  plugIndex,
}: {
  roll: WeaponRollInstance;
  plugIndex: Record<string, WeaponPlugDefinition>;
}) {
  const chips = (roll.equippedWeaponPerkHashes ?? roll.equippedPlugHashes)
    .map((hash) => ({ hash, plug: plugIndex[hash] }))
    .filter(
      (entry): entry is { hash: string; plug: WeaponPlugDefinition } =>
        Boolean(entry.plug?.iconPath),
    )
    .slice(0, 5);

  if (!chips.length) return null;

  return (
    <div className="mt-1.5 flex gap-1 sm:hidden">
      {chips.map((entry, index) => (
        <span
          key={`${roll.itemInstanceId}-chip-${entry.hash}-${index}`}
          className="relative block size-5 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900"
        >
          <Image
            src={bungieIconUrl(entry.plug.iconPath)}
            alt=""
            fill
            sizes="20px"
            className="object-cover"
            unoptimized
          />
        </span>
      ))}
    </div>
  );
}

function rollRowClass(isActive: boolean, isBest: boolean) {
  if (isActive) {
    return isBest
      ? "border border-[rgba(255,188,0,0.7)] bg-blue-500/10 shadow-[0_0_4px_rgba(255,188,0,0.25)]"
      : "border border-blue-500/60 bg-blue-500/10";
  }

  if (isBest) {
    return "border border-[rgba(255,188,0,0.7)] bg-zinc-900/40 shadow-[0_0_4px_rgba(255,188,0,0.25)] hover:brightness-105";
  }

  return "border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700";
}

function RollRow({
  roll,
  isActive,
  isPinned,
  plugIndex,
  showVersionLabel,
  onHover,
  onPin,
}: {
  roll: WeaponRollInstance;
  isActive: boolean;
  isPinned: boolean;
  plugIndex: Record<string, WeaponPlugDefinition>;
  showVersionLabel: boolean;
  onHover: (rollId: string | null) => void;
  onPin: (rollId: string) => void;
}) {
  const versionLabel = resolveVersionDisplayLabel(roll.version);

  return (
    <button
      type="button"
      className={`w-full rounded-md px-2 py-2 text-left transition ${rollRowClass(isActive, roll.isBest)}`}
      aria-pressed={isPinned}
      onMouseEnter={() => onHover(roll.itemInstanceId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(roll.itemInstanceId)}
    >
      <div className="grid grid-cols-5 items-center gap-2 sm:gap-3">
        <div className="flex justify-center">
          <WeaponRollIcon version={roll.version} />
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Tier</p>
          <p
            className="text-sm font-bold tabular-nums text-zinc-100"
            title={
              roll.aegis.overallPercent === null
                ? undefined
                : `Aegis overall ${roll.aegis.overallPercent}% · Perks ${roll.aegis.perkColumnsHit}/${roll.aegis.perkColumnsTotal}${roll.aegis.traitComboMatch ? " · Trait combo" : ""}`
            }
          >
            {roll.tier ?? "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">PvE</p>
          <p className="text-sm font-medium tabular-nums text-zinc-100">
            {formatPercent(roll.scores.pvePercent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">PvP</p>
          <p className="text-sm font-medium tabular-nums text-zinc-100">
            {formatPercent(roll.scores.pvpPercent)}
          </p>
        </div>
        <div className="flex justify-center">
          <RollStatusIcon roll={roll} />
        </div>
      </div>
      {showVersionLabel ? (
        <p
          className="mt-1 truncate text-[10px] text-zinc-500 sm:text-xs"
          title={versionLabel}
        >
          {versionLabel}
        </p>
      ) : null}
      <RollPerkChips roll={roll} plugIndex={plugIndex} />
    </button>
  );
}

export function WeaponRollsPanel({
  rolls,
  loading,
  error,
  showRolls,
  onShowRollsChange,
  activeRollId,
  pinnedRollId,
  onRollHover,
  onRollPin,
  plugIndex = {},
  showVersionLabels = false,
}: WeaponRollsPanelProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={showRolls}
        onClick={() => onShowRollsChange(!showRolls)}
        className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
          showRolls
            ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        Show your rolls
      </button>

      {showRolls ? (
        <div className="space-y-2">
          {loading ? (
            <p className="text-xs text-zinc-500">Loading your copies…</p>
          ) : error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : rolls.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No copies of this weapon in your inventory.
            </p>
          ) : (
            rolls.map((roll) => (
              <RollRow
                key={roll.itemInstanceId}
                roll={roll}
                isActive={activeRollId === roll.itemInstanceId}
                isPinned={pinnedRollId === roll.itemInstanceId}
                plugIndex={plugIndex}
                showVersionLabel={showVersionLabels}
                onHover={onRollHover}
                onPin={(rollId) =>
                  onRollPin(pinnedRollId === rollId ? null : rollId)
                }
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
