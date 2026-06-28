import { WeaponPerkIcon } from "@/components/weapon-perk-icon";
import type { ResolvedWeaponPerkColumn } from "@/types/all-loot";
import type {
  PerkHighlightMode,
  WeaponGodRollMode,
} from "@/types/weapon-god-rolls";

type WeaponPerksPanelProps = {
  columns: ResolvedWeaponPerkColumn[];
  rollHighlightPerks?: Set<string>;
  godRollHighlightPerks?: Set<string>;
  godRollMode?: WeaponGodRollMode | null;
};

function resolvePerkHighlightMode(
  plugHash: string,
  rollHighlightPerks: Set<string>,
  godRollHighlightPerks: Set<string>,
  godRollMode: WeaponGodRollMode | null,
): PerkHighlightMode {
  const inRoll = rollHighlightPerks.has(plugHash);
  const inGod = godRollHighlightPerks.has(plugHash);

  if (inRoll && inGod) return "match";
  if (inRoll) return "roll";
  if (inGod && godRollMode) return godRollMode;
  return null;
}

export function WeaponPerksPanel({
  columns,
  rollHighlightPerks = new Set(),
  godRollHighlightPerks = new Set(),
  godRollMode = null,
}: WeaponPerksPanelProps) {
  if (!columns.length) return null;

  const hasHighlights =
    rollHighlightPerks.size > 0 || godRollHighlightPerks.size > 0;

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-min gap-3 sm:gap-4">
        {columns.map((column, columnIndex) => (
          <div
            key={`${column.type}-${columnIndex}`}
            className="flex shrink-0 flex-col gap-2"
          >
            {column.perks.map((perk) => {
              const highlightMode = hasHighlights
                ? resolvePerkHighlightMode(
                    perk.plugHash,
                    rollHighlightPerks,
                    godRollHighlightPerks,
                    godRollMode,
                  )
                : null;

              return (
                <WeaponPerkIcon
                  key={perk.plugHash}
                  perk={perk}
                  shape={column.type === "masterwork" ? "square" : "circle"}
                  highlighted={highlightMode !== null}
                  highlightMode={highlightMode}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
