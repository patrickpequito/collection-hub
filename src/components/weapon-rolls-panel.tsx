"use client";

import Image from "next/image";
import { AegisTierGrade } from "@/components/aegis-tier-grade";
import { RollTransferPanel } from "@/components/roll-transfer-panel";
import { WeaponRollIcon } from "@/components/weapon-roll-icon";
import { resolveGodRollChipHighlight } from "@/lib/weapons/god-roll-highlights";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { WeaponPlugDefinition } from "@/types/all-loot";
import type { ProfileCharacter } from "@/types/destiny-characters";
import type { TransferDestinationId } from "@/types/destiny-characters";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";
import type { WeaponRollInstance } from "@/types/weapon-rolls";

type WeaponRollsPanelProps = {
  rolls: WeaponRollInstance[];
  characters: ProfileCharacter[];
  loading: boolean;
  error: string | null;
  showRolls: boolean;
  onShowRollsChange: (show: boolean) => void;
  activeRollId: string | null;
  pinnedRollId: string | null;
  onRollHover: (rollId: string | null) => void;
  onRollPin: (rollId: string | null) => void;
  onTransferComplete?: (
    destination: TransferDestinationId,
  ) => void | Promise<void>;
  plugIndex?: Record<string, WeaponPlugDefinition>;
  godRollsByHash?: Record<string, ResolvedWeaponGodRoll>;
  signedIn?: boolean;
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

function rollPerkChipBorderClass(
  highlight: ReturnType<typeof resolveGodRollChipHighlight>,
) {
  switch (highlight) {
    case "both":
      return "border-yellow-400/80";
    case "pve":
      return "border-emerald-500/70";
    case "pvp":
      return "border-rose-500/70";
    default:
      return "border-zinc-700";
  }
}

function RollPerkChips({
  roll,
  plugIndex,
  godRoll,
}: {
  roll: WeaponRollInstance;
  plugIndex: Record<string, WeaponPlugDefinition>;
  godRoll: ResolvedWeaponGodRoll | null;
}) {
  const chips = roll.equippedWeaponPerkHashes
    .map((hash) => ({ hash, plug: plugIndex[hash] }))
    .filter(
      (entry): entry is { hash: string; plug: WeaponPlugDefinition } =>
        Boolean(entry.plug?.iconPath),
    );

  if (!chips.length) return null;

  return (
    <div className="flex shrink-0 gap-1">
      {chips.map((entry, index) => {
        const highlight = godRoll
          ? resolveGodRollChipHighlight(
              entry.hash,
              godRoll.pve,
              godRoll.pvp,
              plugIndex,
            )
          : null;

        return (
          <span
            key={`${roll.itemInstanceId}-chip-${entry.hash}-${index}`}
            className={`relative block size-5 shrink-0 overflow-hidden rounded-full border bg-zinc-900 ${rollPerkChipBorderClass(highlight)}`}
            title={
              highlight === "both"
                ? "God roll PvE and PvP perk"
                : highlight === "pve"
                  ? "God roll PvE perk"
                  : highlight === "pvp"
                    ? "God roll PvP perk"
                    : undefined
            }
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
        );
      })}
    </div>
  );
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
  characters,
  plugIndex,
  godRoll,
  onHover,
  onPin,
  onTransferComplete,
}: {
  roll: WeaponRollInstance;
  isActive: boolean;
  isPinned: boolean;
  characters: ProfileCharacter[];
  plugIndex: Record<string, WeaponPlugDefinition>;
  godRoll: ResolvedWeaponGodRoll | null;
  onHover: (rollId: string | null) => void;
  onPin: (rollId: string) => void;
  onTransferComplete?: (
    destination: TransferDestinationId,
  ) => void | Promise<void>;
}) {
  return (
    <div className={`rounded-md ${rollRowClass(isActive, roll.isBest)}`}>
      <button
        type="button"
        className="w-full px-2 py-2 text-left"
        aria-pressed={isPinned}
        onMouseEnter={() => onHover(roll.itemInstanceId)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onPin(roll.itemInstanceId)}
      >
      <div className="grid grid-cols-5 items-center gap-2 sm:gap-3">
        <div className="flex justify-center">
          <WeaponRollIcon version={roll.version} gearTier={roll.gearTier} />
        </div>
        <div className="flex items-center justify-center">
          <AegisTierGrade
            tier={roll.tier}
            title={
              roll.aegis.overallPercent === null
                ? undefined
                : `Aegis overall ${roll.aegis.overallPercent}% · Perks ${roll.aegis.perkColumnsHit}/${roll.aegis.perkColumnsTotal}${roll.aegis.traitComboMatch ? " · Trait combo" : ""}`
            }
          />
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
      <div className="mt-1 flex justify-end sm:hidden">
        <RollPerkChips roll={roll} plugIndex={plugIndex} godRoll={godRoll} />
      </div>
      </button>
      <RollTransferPanel
        roll={roll}
        characters={characters}
        open={isPinned}
        onTransferComplete={onTransferComplete}
      />
    </div>
  );
}

export function WeaponRollsPanel({
  rolls,
  characters,
  loading,
  error,
  showRolls,
  onShowRollsChange,
  activeRollId,
  pinnedRollId,
  onRollHover,
  onRollPin,
  onTransferComplete,
  plugIndex = {},
  godRollsByHash = {},
  signedIn = true,
}: WeaponRollsPanelProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!signedIn}
        aria-pressed={signedIn ? showRolls : undefined}
        onClick={() => {
          if (!signedIn) return;
          onShowRollsChange(!showRolls);
        }}
        className={`flex w-full items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition ${
          !signedIn
            ? "cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-500 opacity-60"
            : showRolls
              ? "border-blue-500/50 bg-blue-500/15 text-blue-100 shadow-sm shadow-blue-500/10"
              : "border-zinc-600 bg-zinc-800/90 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800"
        }`}
      >
        Show your rolls
      </button>

      {!signedIn ? (
        <p className="text-center text-[10px] text-zinc-500 sm:text-xs">
          Sign in to see your rolls.
        </p>
      ) : null}

      {signedIn && showRolls ? (
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
            <div className="space-y-2">
              {rolls.map((roll) => (
                <RollRow
                  key={roll.itemInstanceId}
                  roll={roll}
                  isActive={activeRollId === roll.itemInstanceId}
                  isPinned={pinnedRollId === roll.itemInstanceId}
                  characters={characters}
                  plugIndex={plugIndex}
                  godRoll={godRollsByHash[roll.itemHash] ?? null}
                  onHover={onRollHover}
                  onPin={(rollId) =>
                    onRollPin(pinnedRollId === rollId ? null : rollId)
                  }
                  onTransferComplete={onTransferComplete}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
