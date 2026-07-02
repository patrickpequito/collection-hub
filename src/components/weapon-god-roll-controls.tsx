"use client";

import type {
  ResolvedWeaponGodRoll,
  WeaponGodRollMode,
} from "@/types/weapon-god-rolls";

type GodRollHighlightMode = WeaponGodRollMode | null;

/** Shared bar height for god roll controls and the unavailable placeholder. */
export const GOD_ROLL_CONTROLS_BAR_CLASS = "flex h-9 items-center gap-2.5";

type WeaponGodRollControlsProps = {
  godRoll: ResolvedWeaponGodRoll;
  mode: GodRollHighlightMode;
  onModeChange: (mode: GodRollHighlightMode) => void;
};

const SEGMENTS: { id: GodRollHighlightMode; label: string }[] = [
  { id: null, label: "Off" },
  { id: "pve", label: "PvE" },
  { id: "pvp", label: "PvP" },
];

export function WeaponGodRollControls({
  godRoll,
  mode,
  onModeChange,
}: WeaponGodRollControlsProps) {
  const hasPve = Boolean(godRoll.pve?.length);
  const hasPvp = Boolean(godRoll.pvp?.length);

  return (
    <div className={`flex flex-wrap ${GOD_ROLL_CONTROLS_BAR_CLASS}`}>
      <span className="text-xs text-zinc-400">Show God Roll</span>
      <div
        className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5"
        role="group"
        aria-label="God roll highlight"
      >
      {SEGMENTS.map((segment) => {
        const disabled =
          segment.id === "pve"
            ? !hasPve
            : segment.id === "pvp"
              ? !hasPvp
              : false;
        const isActive = mode === segment.id;

        return (
          <button
            key={segment.label}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onModeChange(segment.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              disabled
                ? "cursor-not-allowed text-zinc-600"
                : isActive
                  ? segment.id === "pve"
                    ? "bg-emerald-500/15 text-emerald-200"
                    : segment.id === "pvp"
                      ? "bg-rose-500/15 text-rose-200"
                      : "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {segment.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}

export type { GodRollHighlightMode };
