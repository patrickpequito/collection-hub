import { WeaponPerkIcon } from "@/components/weapon-perk-icon";
import type { ResolvedWeaponPerkColumn } from "@/types/all-loot";
import type { WeaponGodRollMode } from "@/types/weapon-god-rolls";

type WeaponPerksPanelProps = {
  columns: ResolvedWeaponPerkColumn[];
  highlightMode?: WeaponGodRollMode | null;
  highlightedPerks?: Set<string>;
};

export function WeaponPerksPanel({
  columns,
  highlightMode = null,
  highlightedPerks = new Set(),
}: WeaponPerksPanelProps) {
  if (!columns.length) return null;

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-min gap-3 sm:gap-4">
        {columns.map((column, columnIndex) => (
          <div
            key={`${column.type}-${columnIndex}`}
            className="flex shrink-0 flex-col gap-2"
          >
            {column.perks.map((perk) => (
              <WeaponPerkIcon
                key={perk.plugHash}
                perk={perk}
                shape={column.type === "masterwork" ? "square" : "circle"}
                highlighted={
                  highlightMode !== null && highlightedPerks.has(perk.plugHash)
                }
                highlightMode={highlightMode}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
