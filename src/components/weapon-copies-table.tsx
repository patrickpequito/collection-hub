"use client";

import { ROLL_TRANSFER_CELL_CLASS, RollLocationIcon, RollTransferButtons } from "@/components/roll-transfer-buttons";
import { WeaponRollIcon } from "@/components/weapon-roll-icon";
import { resolveVersionDisplayLabel } from "@/lib/all-loot/season-badges";
import { localSeasonFilterIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { resolveGodRollChipHighlight } from "@/lib/weapons/god-roll-highlights";
import type { WeaponPlugDefinition } from "@/types/all-loot";
import type { ProfileCharacter, TransferDestinationId } from "@/types/destiny-characters";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";
import type { WeaponRollInstance } from "@/types/weapon-rolls";

function bestScore(roll: WeaponRollInstance): number | null {
  const values = [roll.scores.pvePercent, roll.scores.pvpPercent, roll.aegis.overallPercent].filter(
    (value): value is number => typeof value === "number",
  );
  return values.length ? Math.max(...values) : null;
}

/** Season / expansion icon of a copy's version (same icons as the Loot Collector filters). */
function VersionIcon({ roll }: { roll: WeaponRollInstance }) {
  const label = resolveVersionDisplayLabel(roll.version);
  return (
    <span className="flex flex-col items-center gap-0.5" title={roll.isMasterwork ? `${label} · Masterworked` : label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bungieIconUrl(localSeasonFilterIconPath(label))} alt={label} width={24} height={24} className="size-6 object-contain" />
      {roll.isMasterwork ? <span className="font-display text-[9px] tracking-[0.1em] text-owned">MW</span> : null}
    </span>
  );
}

/**
 * Your copies of a weapon: version, perks (recommended ones ringed), match and inline move buttons.
 * Phones get one compact line per copy (version, perks, best score, location); tapping it
 * opens PvE / PvP and the labelled move buttons.
 */
export function WeaponCopiesTable({
  rolls,
  characters,
  activeRollId,
  pinnedRollId,
  isExotic,
  plugIndex,
  godRollsByHash,
  onHover,
  onPin,
  onTransferComplete,
}: {
  rolls: WeaponRollInstance[];
  characters: ProfileCharacter[];
  activeRollId: string | null;
  pinnedRollId: string | null;
  isExotic: boolean;
  plugIndex: Record<string, WeaponPlugDefinition>;
  godRollsByHash: Record<string, ResolvedWeaponGodRoll>;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
  onTransferComplete: (itemInstanceId: string, destination: TransferDestinationId) => void | Promise<void>;
}) {
  const sorted = [...rolls].sort((a, b) => (bestScore(b) ?? 0) - (bestScore(a) ?? 0));
  const top = bestScore(sorted[0] ?? rolls[0]);
  const columns = isExotic
    ? "grid-cols-[3rem_3.5rem_minmax(0,1fr)]"
    : "grid-cols-[3rem_3.5rem_minmax(0,1fr)_4rem_4rem]";
  const headers = isExotic ? ["", "Version", "Perks"] : ["", "Version", "Perks", "PvE", "PvP"];

  return (
    <div className="ui-panel sm:overflow-x-auto lg:overflow-visible">
      <div className="hidden min-w-[34rem] items-center gap-3 border-b border-white/[0.14] pb-2 pl-4 pr-4 pt-3 sm:flex">
        <div className={`grid flex-1 ${columns} gap-3`}>
          {headers.map((label, index) => (
            <span key={`${label}-${index}`} className="ui-label text-[11px]!">
              {label}
            </span>
          ))}
        </div>
        <span className={`ui-label text-[11px]! ${ROLL_TRANSFER_CELL_CLASS}`}>Location</span>
      </div>
      {sorted.map((roll) => {
        const active = activeRollId === roll.itemInstanceId;
        const godRoll = godRollsByHash[roll.itemHash] ?? null;
        const chips = roll.equippedWeaponPerkHashes
          .map((hash) => ({ hash, plug: plugIndex[hash] }))
          .filter((entry) => Boolean(entry.plug?.iconPath));
        const score = bestScore(roll);
        const percent = (value: number | null) =>
          typeof value === "number" ? `${Math.round(value)}%` : "—";
        const scoreClass = (value: number | null) =>
          score !== null && score === top && value === score ? "text-owned" : "text-bone/85";
        const perks = (small = false) => (
          <span className={`flex flex-wrap ${small ? "min-w-0 flex-1 gap-1" : "gap-1"}`}>
            {chips.map(({ hash, plug }) => {
              const highlight = godRoll ? resolveGodRollChipHighlight(hash, godRoll.pve, godRoll.pvp, plugIndex) : null;
              const ring =
                highlight === "both" || highlight === "pve"
                  ? "ring-2 ring-owned"
                  : highlight === "pvp"
                    ? "ring-2 ring-sky-400"
                    : "";
              return (
                <span key={hash} className="group/perk relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bungieIconUrl(plug!.iconPath)}
                    alt={plug!.name}
                    width={24}
                    height={24}
                    className={`${small ? "size-5" : "size-6"} rounded-full border border-white/40 ${highlight ? "bg-seasonal/40" : "bg-panel"} ${ring}`}
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-60 border border-white/30 bg-[#12161c] p-2.5 text-left text-xs leading-snug text-bone/80 shadow-lg group-hover/perk:block"
                  >
                    <span className="mb-1 block font-medium text-bone">{plug!.name}</span>
                    {plug!.description}
                  </span>
                </span>
              );
            })}
          </span>
        );
        return (
          <div
            key={roll.itemInstanceId}
            onMouseEnter={() => onHover(roll.itemInstanceId)}
            onMouseLeave={() => onHover(null)}
            className={`border-b border-white/[0.08] transition last:border-0 ${
              active ? "bg-sky-500/10 shadow-[inset_3px_0_0_0_#38bdf8]" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="sm:hidden">
              <button
                type="button"
                aria-expanded={pinnedRollId === roll.itemInstanceId}
                onClick={() => onPin(roll.itemInstanceId)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
              >
                <WeaponRollIcon version={roll.version} gearTier={isExotic ? null : roll.gearTier} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bungieIconUrl(localSeasonFilterIconPath(resolveVersionDisplayLabel(roll.version)))}
                  alt={resolveVersionDisplayLabel(roll.version)}
                  className="size-5 shrink-0 object-contain"
                />
                {perks(true)}
                {isExotic ? null : (
                  <span className={`font-display text-[17px] tabular-nums ${score !== null && score === top ? "text-owned" : "text-bone"}`}>
                    {percent(score)}
                  </span>
                )}
                <RollLocationIcon roll={roll} characters={characters} />
                <span
                  aria-hidden
                  className={`text-[11px] transition ${pinnedRollId === roll.itemInstanceId ? "rotate-90 text-bone" : "text-ash"}`}
                >
                  ▸
                </span>
              </button>
              {pinnedRollId === roll.itemInstanceId ? (
                <div className="space-y-2.5 px-3 pb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <VersionIcon roll={{ ...roll, isMasterwork: false }} />
                      {roll.isMasterwork ? (
                        <span className="border border-owned/60 px-1.5 font-display text-[9.5px] tracking-[0.12em] text-owned">
                          MASTERWORK
                        </span>
                      ) : null}
                    </span>
                    <span className="flex-1" />
                    {isExotic ? null : (
                      <>
                        <span className="flex flex-col items-end leading-none">
                          <span className="font-display text-[9.5px] tracking-[0.14em] text-ash">PVE</span>
                          <span className={`font-display text-lg ${scoreClass(roll.scores.pvePercent)}`}>{percent(roll.scores.pvePercent)}</span>
                        </span>
                        <span className="flex flex-col items-end leading-none">
                          <span className="font-display text-[9.5px] tracking-[0.14em] text-ash">PVP</span>
                          <span className={`font-display text-lg ${scoreClass(roll.scores.pvpPercent)}`}>{percent(roll.scores.pvpPercent)}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="ui-label text-[10px]!">Move to</p>
                  <RollTransferButtons roll={roll} characters={characters} onTransferComplete={onTransferComplete} labelled />
                </div>
              ) : null}
            </div>
            <div className="hidden min-w-[34rem] items-center gap-3 pr-4 sm:flex">
              <button
                type="button"
                aria-pressed={pinnedRollId === roll.itemInstanceId}
                onClick={() => onPin(roll.itemInstanceId)}
                className={`grid flex-1 ${columns} items-center gap-3 py-2.5 pl-4 text-left`}
              >
                <WeaponRollIcon version={roll.version} gearTier={isExotic ? null : roll.gearTier} />
                <VersionIcon roll={roll} />
                {perks()}
                {isExotic ? null : (
                  <>
                    <span className={`text-sm tabular-nums ${scoreClass(roll.scores.pvePercent)}`}>
                      {percent(roll.scores.pvePercent)}
                    </span>
                    <span className={`text-sm tabular-nums ${scoreClass(roll.scores.pvpPercent)}`}>
                      {percent(roll.scores.pvpPercent)}
                    </span>
                  </>
                )}
              </button>
              <RollTransferButtons roll={roll} characters={characters} onTransferComplete={onTransferComplete} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
