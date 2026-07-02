import type { ArmorPiece } from "@/types/armor-set";

export function isArmorPieceOwned(
  piece: ArmorPiece | undefined,
  ownedSet: ReadonlySet<string>,
): boolean {
  if (!piece) return false;

  if (piece.itemHashes?.some((hash) => ownedSet.has(hash))) {
    return true;
  }

  return ownedSet.has(piece.itemHash);
}
