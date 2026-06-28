"use client";

import { useEffect, useMemo, useState } from "react";
import {
  WeaponGodRollControls,
  type GodRollHighlightMode,
} from "@/components/weapon-god-roll-controls";
import { WeaponPerksPanel } from "@/components/weapon-perks-panel";
import { godRollHighlightedPerks } from "@/lib/weapons/god-roll-highlights";
import type {
  ResolvedWeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";
import type {
  ResolvedWeaponGodRoll,
  WeaponGodRollMode,
} from "@/types/weapon-god-rolls";

type WeaponPerksSectionProps = {
  columns: ResolvedWeaponPerkColumn[];
  godRoll: ResolvedWeaponGodRoll | null;
  plugIndex?: Record<string, WeaponPlugDefinition>;
  rollHighlightPerks?: Set<string>;
};

export function WeaponPerksSection({
  columns,
  godRoll,
  plugIndex = {},
  rollHighlightPerks = new Set(),
}: WeaponPerksSectionProps) {
  const [mode, setMode] = useState<GodRollHighlightMode>(null);
  const hasGodRollData = Boolean(godRoll?.pve?.length || godRoll?.pvp?.length);
  const hasRollHighlight = rollHighlightPerks.size > 0;

  useEffect(() => {
    if (!hasRollHighlight || mode !== null) return;
    if (godRoll?.pve?.length) setMode("pve");
    else if (godRoll?.pvp?.length) setMode("pvp");
  }, [godRoll, hasRollHighlight, mode]);

  const godRollMode: WeaponGodRollMode | null = hasRollHighlight
    ? (mode ?? (godRoll?.pve?.length ? "pve" : godRoll?.pvp?.length ? "pvp" : null))
    : mode;

  const godRollHighlightPerks = useMemo(() => {
    if (!godRoll || !godRollMode) return new Set<string>();

    const perks = godRollMode === "pve" ? godRoll.pve : godRoll.pvp;
    return godRollHighlightedPerks(perks, columns, plugIndex);
  }, [columns, godRoll, godRollMode, plugIndex]);

  const showComparisonLegend =
    hasRollHighlight && godRollMode !== null && godRollHighlightPerks.size > 0;

  if (!columns.length) return null;

  return (
    <div className="space-y-3">
      {hasGodRollData && godRoll ? (
        <WeaponGodRollControls
          godRoll={godRoll}
          mode={mode}
          onModeChange={setMode}
        />
      ) : (
        <p className="text-xs text-zinc-500">God roll info not available.</p>
      )}

      {showComparisonLegend ? (
        <p className="text-xs text-zinc-500">
          <span className="text-blue-300">Blue</span> your roll ·{" "}
          <span
            className={
              godRollMode === "pve" ? "text-emerald-300" : "text-amber-300"
            }
          >
            {godRollMode === "pve" ? "Green" : "Amber"}
          </span>{" "}
          god roll · <span className="text-yellow-300">Gold</span> match
        </p>
      ) : null}

      <WeaponPerksPanel
        columns={columns}
        rollHighlightPerks={hasRollHighlight ? rollHighlightPerks : new Set()}
        godRollHighlightPerks={godRollHighlightPerks}
        godRollMode={godRollMode}
      />
    </div>
  );
}
