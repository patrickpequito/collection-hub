import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import type { ActivityArmorRow } from "@/types/activity-loot";

type ActivityArmorSectionProps = {
  rows: ActivityArmorRow[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
};

export function ActivityArmorSection({
  rows,
  ownedItemHashes,
  showOwnership,
}: ActivityArmorSectionProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-4 border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        Armor sets
      </h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.guardianClass} className="space-y-1">
            <p className="text-xs text-zinc-500">
              {CLASS_LABELS[row.guardianClass]} — {row.setName}
            </p>
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-medium text-zinc-400">
                {CLASS_LABELS[row.guardianClass]}
              </span>
              <div className="flex flex-wrap gap-2">
                {ARMOR_SLOTS.map((slot) => {
                  const piece = row.pieces[slot];
                  return (
                    <ArmorPieceIcon
                      key={`${row.guardianClass}-${slot}`}
                      piece={piece}
                      slotLabel={SLOT_LABELS[slot]}
                      sourceLabel={piece.source}
                      owned={ownedItemHashes.has(piece.itemHash)}
                      showOwnership={showOwnership}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
