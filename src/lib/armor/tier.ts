/** Infer armor gear tier (1–5) from total base stat points. */
export function inferArmorTierFromTotal(total: number): number {
  if (total >= 73) return 5;
  if (total >= 65) return 4;
  if (total >= 59) return 3;
  if (total >= 54) return 2;
  if (total >= 48) return 1;
  return 1;
}

export function formatArmorTier(tier: number | null): string {
  return tier === null ? "—" : `T${tier}`;
}
