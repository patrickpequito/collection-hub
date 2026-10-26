"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { useMemo } from "react";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import {
  ARMOR_SLOTS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { orderedGuardianClasses } from "@/lib/armor-sets/lookup";
import { isArmorPieceOwned } from "@/lib/armor/ownership";
import { resolveArmorPieceForSeason } from "@/lib/armor/version-for-hash";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import type { ArmorPiece, ArmorSet, GuardianClass } from "@/types/armor-set";



type ArmorSetPiecesPanelProps = {
  /** Full set preview shown beside the pieces. */
  preview?: React.ReactNode;
  set: ArmorSet;
  primaryClass: GuardianClass | null;
  selectedSeasonKey?: string | null;
  isSignedIn?: boolean;
  itemHrefs?: Record<string, string>;
};

function resolvePieceHref(
  piece: ArmorPiece,
  displayHash: string,
  itemHrefs?: Record<string, string>,
): string | undefined {
  if (itemHrefs?.[displayHash]) return itemHrefs[displayHash];
  if (itemHrefs?.[piece.itemHash]) return itemHrefs[piece.itemHash];
  for (const hash of piece.itemHashes ?? []) {
    if (itemHrefs?.[hash]) return itemHrefs[hash];
  }
  return undefined;
}

function ArmorSetClassRow({
  guardianClass,
  set,
  selectedSeasonKey,
  ownedItemHashes,
  showOwnership,
  itemHrefs,
}: {
  guardianClass: GuardianClass;
  set: ArmorSet;
  selectedSeasonKey?: string | null;
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  itemHrefs?: Record<string, string>;
}) {
  const pieces = set.classes[guardianClass];

  const ownedCount = Object.values(pieces ?? {}).filter((piece) => isArmorPieceOwned(piece, ownedItemHashes)).length;
  const total = Object.values(pieces ?? {}).filter(Boolean).length;

  return (
    <div className="space-y-1.5">
      <p className="ui-label flex items-center gap-2 text-bone!">
        <GuardianClassIcon guardianClass={guardianClass} size="sm" />
        {guardianClass[0].toUpperCase() + guardianClass.slice(1)}
        {showOwnership ? <span className="text-ash">· {ownedCount} / {total}</span> : null}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ARMOR_SLOTS.map((slot, slotIndex) => {
          const piece = pieces?.[slot];
          const display = piece
            ? resolveArmorPieceForSeason(piece, selectedSeasonKey ?? null)
            : null;
          const displayPiece =
            piece && display
              ? { ...piece, itemHash: display.itemHash, iconPath: display.iconPath }
              : piece;
          const tooltipAlign =
            slotIndex === 0
              ? "start"
              : slotIndex === ARMOR_SLOTS.length - 1
                ? "end"
                : "center";

          return (
            <ArmorPieceIcon
              key={`${guardianClass}-${slot}`}
              piece={displayPiece}
              slotLabel={SLOT_LABELS[slot]}
              sourceLabel={set.source}
              owned={isArmorPieceOwned(piece, ownedItemHashes)}
              showOwnership={showOwnership}
              tooltipAlign={tooltipAlign}
              rarity={piece ? "Legendary" : undefined}
              classOrWeaponType={guardianClass[0].toUpperCase() + guardianClass.slice(1)}
              href={
                piece && display
                  ? resolvePieceHref(piece, display.itemHash, itemHrefs)
                  : undefined
              }
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
  selectedSeasonKey = null,
  isSignedIn = false,
  itemHrefs,
  preview = null,
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
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Set pieces" note={set.name} />
      {inventoryError ? (
        <p className="text-xs text-amber-200/80">Collection unavailable: {inventoryError}</p>
      ) : null}
      <div className="ui-panel grid gap-5 p-4 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="space-y-4">
          {[primaryGuardianClass, ...otherClasses].map((guardianClass) => (
            <ArmorSetClassRow
              key={guardianClass}
              guardianClass={guardianClass}
              set={set}
              selectedSeasonKey={selectedSeasonKey}
              ownedItemHashes={ownedSet}
              showOwnership={showOwnership}
              itemHrefs={itemHrefs}
            />
          ))}
        </div>
        {preview}
      </div>
    </section>
  );
}
