"use client";

import { useMemo, useState } from "react";
import {
  WeaponGodRollControls,
  type GodRollHighlightMode,
} from "@/components/weapon-god-roll-controls";
import { WeaponPerksPanel } from "@/components/weapon-perks-panel";
import type { ResolvedWeaponPerkColumn } from "@/types/all-loot";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";

type WeaponPerksSectionProps = {
  columns: ResolvedWeaponPerkColumn[];
  godRoll: ResolvedWeaponGodRoll | null;
};

export function WeaponPerksSection({
  columns,
  godRoll,
}: WeaponPerksSectionProps) {
  const [mode, setMode] = useState<GodRollHighlightMode>(null);
  const hasGodRollData = Boolean(godRoll?.pve?.length || godRoll?.pvp?.length);

  const highlightedPerks = useMemo(() => {
    if (!godRoll || !mode) return new Set<string>();
    const perks = mode === "pve" ? godRoll.pve : godRoll.pvp;
    return new Set(perks ?? []);
  }, [godRoll, mode]);

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

      <WeaponPerksPanel
        columns={columns}
        highlightMode={mode}
        highlightedPerks={highlightedPerks}
      />
    </div>
  );
}
