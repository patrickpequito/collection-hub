/**
 * Bungie assigns monotonically increasing itemInstanceId values when items are created.
 * Sort descending so the newest copies appear first in roll lists.
 */
export function compareRollInstancesByRecency(
  a: { itemInstanceId: string },
  b: { itemInstanceId: string },
): number {
  const idA = parseRollInstanceId(a.itemInstanceId);
  const idB = parseRollInstanceId(b.itemInstanceId);

  if (idA === null && idB === null) {
    return b.itemInstanceId.localeCompare(a.itemInstanceId);
  }
  if (idA === null) return 1;
  if (idB === null) return -1;
  if (idA > idB) return -1;
  if (idA < idB) return 1;
  return 0;
}

function parseRollInstanceId(id: string): bigint | null {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}
