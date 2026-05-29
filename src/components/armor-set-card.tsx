import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  GUARDIAN_CLASSES,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import type { ArmorSet } from "@/types/armor-set";

type ArmorSetCardProps = {
  set: ArmorSet;
  ownedItemHashes?: Set<string>;
  showOwnership?: boolean;
};

export function ArmorSetCard({
  set,
  ownedItemHashes,
  showOwnership = false,
}: ArmorSetCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <header className="mb-3 border-b border-zinc-800 pb-3">
        <h2 className="text-lg font-semibold text-zinc-100">{set.name}</h2>
      </header>

      <div className="space-y-3">
        {GUARDIAN_CLASSES.map((guardianClass) => (
          <div key={guardianClass} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium text-zinc-400">
              {CLASS_LABELS[guardianClass]}
            </span>
            <div className="flex flex-wrap gap-2">
              {ARMOR_SLOTS.map((slot) => {
                const piece = set.classes[guardianClass]?.[slot];
                const owned = piece
                  ? ownedItemHashes?.has(piece.itemHash) ?? false
                  : false;

                return (
                  <ArmorPieceIcon
                    key={`${guardianClass}-${slot}`}
                    piece={piece}
                    slotLabel={SLOT_LABELS[slot]}
                    sourceLabel={set.source}
                    owned={owned}
                    showOwnership={showOwnership}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
