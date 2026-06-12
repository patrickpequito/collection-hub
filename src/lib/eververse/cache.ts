import { getNextDailyResetMs } from "@/lib/eververse/reset";
import type { EververseRotation } from "@/types/eververse";

let cachedRotation: EververseRotation | null = null;

function rotationItemCount(rotation: EververseRotation): number {
  return rotation.categories.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );
}

export function getCachedEververseRotation(): EververseRotation | null {
  if (!cachedRotation) return null;
  if (rotationItemCount(cachedRotation) === 0) {
    cachedRotation = null;
    return null;
  }

  if (Date.now() >= getNextDailyResetMs(cachedRotation.fetchedAt)) {
    cachedRotation = null;
    return null;
  }

  return cachedRotation;
}

export function setCachedEververseRotation(rotation: EververseRotation): void {
  if (rotationItemCount(rotation) === 0) return;
  cachedRotation = rotation;
}

export function clearCachedEververseRotation(): void {
  cachedRotation = null;
}
