import { buildArmorHrefByItemHash } from "@/lib/armor/lookup";
import { buildWeaponHrefByItemHash } from "@/lib/weapons/lookup";

/** Weapon and armor detail page hrefs keyed by manifest item hash. */
export async function buildCollectibleHrefByItemHash(fromPath?: string) {
  const [weaponHrefs, armorHrefs] = await Promise.all([
    buildWeaponHrefByItemHash(fromPath),
    buildArmorHrefByItemHash(fromPath),
  ]);

  return { ...weaponHrefs, ...armorHrefs };
}
