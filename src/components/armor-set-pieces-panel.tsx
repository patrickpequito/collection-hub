"use client";

import { useMemo } from "react";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import {
  ARMOR_SLOTS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { orderedGuardianClasses } from "@/lib/armor-sets/lookup";
import { isArmorPieceOwned } from "@/lib/armor/ownership";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import type { ArmorSet, GuardianClass } from "@/types/armor-set";

/**
 * Icon (1.5rem) + gap-1.5 + the same trailing slack used between capped piece
 * columns: max(0, columnWidth - 3.75rem) where columnWidth = (100% - 4 gaps) / 5.
 */
const CLASS_ICON_GUTTER_CLASS =
  "pl-[calc(1.5rem+0.375rem+max(0px,(100%-1.5rem)/5-3.75rem))]";

type ArmorSetPiecesPanelProps = {
  set: ArmorSet;
  primaryClass: GuardianClass | null;
  isSignedIn?: boolean;
  itemHrefs?: Record<string, string>;
};

function ArmorSetClassRow({
  guardianClass,
  set,
  ownedItemHashes,
  showOwnership,
  itemHrefs,
}: {
  guardianClass: GuardianClass;
  set: ArmorSet;
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  itemHrefs?: Record<string, string>;
}) {
  const pieces = set.classes[guardianClass];

  return (
    <div className={`relative w-full ${CLASS_ICON_GUTTER_CLASS}`}>
      <div className="pointer-events-none absolute left-0 top-1/2 w-6 -translate-y-1/2">
        <GuardianClassIcon guardianClass={guardianClass} size="md" />
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {ARMOR_SLOTS.map((slot, slotIndex) => {
          const piece = pieces?.[slot];
          const tooltipAlign =
            slotIndex === 0
              ? "start"
              : slotIndex === ARMOR_SLOTS.length - 1
                ? "end"
                : "center";

          return (
            <ArmorPieceIcon
              key={`${guardianClass}-${slot}`}
              piece={piece}
              slotLabel={SLOT_LABELS[slot]}
              sourceLabel={set.source}
              owned={isArmorPieceOwned(piece, ownedItemHashes)}
              showOwnership={showOwnership}
              tooltipAlign={tooltipAlign}
              fluid
              href={piece ? itemHrefs?.[piece.itemHash] : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ArmorSetPiecesPanel({
  set,
  primaryClass,
  isSignedIn = false,
  itemHrefs,
}: ArmorSetPiecesPanelProps) {
  const { itemHashes: ownedItemHashes, error: inventoryError } =
    useOwnedItemHashes(isSignedIn);
  const showOwnership = isSignedIn && !inventoryError;

  const ownedSet = useMemo(
    () => new Set(ownedItemHashes),
    [ownedItemHashes],
  );

  const classOrder = useMemo(
    () => orderedGuardianClasses(primaryClass),
    [primaryClass],
  );
  const [primaryGuardianClass, ...otherClasses] = classOrder;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {set.name} Set Pieces
      </h2>

      {inventoryError ? (
        <p className="text-xs text-amber-200/80">
          Collection unavailable: {inventoryError}
        </p>
      ) : null}

      <div className="space-y-3">
        <ArmorSetClassRow
          guardianClass={primaryGuardianClass}
          set={set}
          ownedItemHashes={ownedSet}
          showOwnership={showOwnership}
          itemHrefs={itemHrefs}
        />

        {otherClasses.length > 0 ? (
          <div className="space-y-3 border-t border-zinc-700/80 pt-4">
            {otherClasses.map((guardianClass) => (
              <ArmorSetClassRow
                key={guardianClass}
                guardianClass={guardianClass}
                set={set}
                ownedItemHashes={ownedSet}
                showOwnership={showOwnership}
                itemHrefs={itemHrefs}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
