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
  itemHrefs?: Record<string, string>;
};

export function ArmorSetCard({
  set,
  ownedItemHashes,
  showOwnership = false,
  itemHrefs,
}: ArmorSetCardProps) {
  return (
    <article className="border border-hairline bg-panel/85 p-3 sm:p-4">
      <header className="mb-3 border-b border-zinc-800 pb-3">
        <h2 className="text-xl font-semibold uppercase tracking-[0.06em] text-bone">{set.name}</h2>
      </header>

      <div className="space-y-3">
        {GUARDIAN_CLASSES.map((guardianClass) => (
          <div key={guardianClass} className="flex flex-nowrap gap-1.5">
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
                  href={piece ? itemHrefs?.[piece.itemHash] : undefined}
                  classOrWeaponType={CLASS_LABELS[guardianClass]}
                />
              );
            })}
          </div>
        ))}
      </div>
    </article>
  );
}
