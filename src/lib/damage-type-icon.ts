/** Bungie damage type icons from DestinyDamageTypeDefinition. */
const DAMAGE_TYPE_ICON_PATHS: Record<string, string> = {
  Kinetic:
    "/common/destiny2_content/icons/DestinyDamageTypeDefinition_3385a924fd3ccb92c343ade19f19a370.png",
  Arc: "/common/destiny2_content/icons/DestinyDamageTypeDefinition_092d066688b879c807c3b460afdd61e6.png",
  Solar:
    "/common/destiny2_content/icons/DestinyDamageTypeDefinition_2a1773e10968f2d088b97c22b22bba9e.png",
  Void: "/common/destiny2_content/icons/DestinyDamageTypeDefinition_ceb2f6197dccf3958bb31cc783eb97a0.png",
  Stasis:
    "/common/destiny2_content/icons/DestinyDamageTypeDefinition_530c4c3e7981dc2aefd24fd3293482bf.png",
  Strand:
    "/common/destiny2_content/icons/DestinyDamageTypeDefinition_b2fe51a94f3533f97079dfa0d27a4096.png",
};

export function damageTypeIconPath(
  damageType: string | null | undefined,
): string | null {
  if (!damageType) return null;
  return DAMAGE_TYPE_ICON_PATHS[damageType] ?? null;
}
