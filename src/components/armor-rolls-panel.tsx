"use client";

import { WeaponRollIcon } from "@/components/weapon-roll-icon";
import { ArmorArchetypeIcon } from "@/components/armor-archetype-icon";
import { resolveVersionDisplayLabel } from "@/lib/all-loot/season-badges";
import type { ArmorRollInstance } from "@/types/armor-rolls";

type ArmorRollsPanelProps = {
  rolls: ArmorRollInstance[];
  loading: boolean;
  error: string | null;
  showRolls: boolean;
  onShowRollsChange: (show: boolean) => void;
  activeRollId: string | null;
  pinnedRollId: string | null;
  onRollHover: (rollId: string | null) => void;
  onRollPin: (rollId: string | null) => void;
  showVersionLabels?: boolean;
  signedIn?: boolean;
};

function RollStatusIcon({ roll }: { roll: ArmorRollInstance }) {
  if (roll.isBest) {
    return (
      <span
        className="text-sm leading-none text-amber-400"
        title="Best copy for this archetype"
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
        title="Another copy of this archetype has higher total stats"
        aria-label="Safe to dismantle"
      >
        ✕
      </span>
    );
  }

  return <span className="inline-block w-3.5" aria-hidden />;
}

function rollRowClass(isActive: boolean, isBest: boolean) {
  const interactive =
    "group cursor-pointer transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.99] active:duration-75";

  if (isActive) {
    return [
      interactive,
      isBest
        ? "border border-[rgba(255,188,0,0.7)] bg-blue-500/10 shadow-[0_0_4px_rgba(255,188,0,0.25)]"
        : "border border-blue-500/60 bg-blue-500/10",
      "hover:bg-blue-500/15",
    ].join(" ");
  }

  if (isBest) {
    return [
      interactive,
      "border border-[rgba(255,188,0,0.7)] bg-zinc-900/40 shadow-[0_0_4px_rgba(255,188,0,0.25)]",
      "hover:bg-zinc-800/90 hover:shadow-[inset_3px_0_0_0_rgba(251,191,36,0.55)]",
    ].join(" ");
  }

  return [
    interactive,
    "border border-zinc-800 bg-zinc-900/40",
    "hover:bg-zinc-800/90 hover:border-zinc-700 hover:shadow-[inset_3px_0_0_0_rgba(251,191,36,0.55)]",
  ].join(" ");
}

function RollRow({
  roll,
  isActive,
  isPinned,
  showVersionLabel,
  onHover,
  onPin,
}: {
  roll: ArmorRollInstance;
  isActive: boolean;
  isPinned: boolean;
  showVersionLabel: boolean;
  onHover: (rollId: string | null) => void;
  onPin: (rollId: string) => void;
}) {
  const versionLabel = resolveVersionDisplayLabel(roll.version);

  return (
    <button
      type="button"
      className={`w-full rounded-md px-2 py-2 text-left ${rollRowClass(isActive, roll.isBest)}`}
      aria-pressed={isPinned}
      onMouseEnter={() => onHover(roll.itemInstanceId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(roll.itemInstanceId)}
    >
      <div className="grid grid-cols-5 items-start gap-2 sm:gap-3">
        <div className="flex justify-center pt-0.5">
          <WeaponRollIcon version={roll.version} gearTier={roll.tier} />
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Def
          </p>
          <p className="text-sm font-bold leading-5 tabular-nums text-zinc-100 transition-colors duration-200 group-hover:text-amber-200">
            {roll.defense ?? "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Total
          </p>
          <p className="text-sm font-medium leading-5 tabular-nums text-zinc-100">
            {roll.totalStats}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Archetype
          </p>
          <div className="mt-1 flex h-5 items-center justify-center">
            <ArmorArchetypeIcon
              name={roll.archetype}
              iconPath={roll.archetypeIconPath}
              variant="roll"
              showTooltip
            />
          </div>
        </div>
        <div className="text-center">
          <p
            className="text-[10px] uppercase tracking-wide text-zinc-500 invisible"
            aria-hidden
          >
            Status
          </p>
          <div className="flex h-5 items-center justify-center">
            <RollStatusIcon roll={roll} />
          </div>
        </div>
      </div>
      {showVersionLabel ? (
        <p
          className="mt-1 truncate text-xs text-zinc-500"
          title={versionLabel}
        >
          {versionLabel}
        </p>
      ) : null}
    </button>
  );
}

export function ArmorRollsPanel({
  rolls,
  loading,
  error,
  showRolls,
  onShowRollsChange,
  activeRollId,
  pinnedRollId,
  onRollHover,
  onRollPin,
  showVersionLabels = false,
  signedIn = false,
}: ArmorRollsPanelProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={!signedIn}
        onClick={() => onShowRollsChange(!showRolls)}
        className={`w-full rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
          signedIn
            ? showRolls
              ? "border-amber-500/50 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
              : "border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/80"
            : "cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-500"
        }`}
      >
        {showRolls ? "Hide your rolls" : "Show your rolls"}
      </button>

      {!signedIn ? (
        <p className="text-center text-xs text-zinc-500">
          Sign in to see your rolls.
        </p>
      ) : null}

      {showRolls && signedIn ? (
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading your rolls…</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : rolls.length === 0 ? (
            <p className="text-sm text-zinc-500">
              You do not own any copies of this armor piece.
            </p>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                ★ Best per archetype · ✕ Lower duplicate archetype
              </p>
              {rolls.map((roll) => (
                <RollRow
                  key={roll.itemInstanceId}
                  roll={roll}
                  isActive={activeRollId === roll.itemInstanceId}
                  isPinned={pinnedRollId === roll.itemInstanceId}
                  showVersionLabel={showVersionLabels}
                  onHover={onRollHover}
                  onPin={onRollPin}
                />
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
