import type { WeaponPlugDefinition } from "@/types/all-loot";

export const ARMOR_ARCHETYPE_NAMES = [
  "Paragon",
  "Bulwark",
  "Grenadier",
  "Brawler",
  "Gunner",
  "Specialist",
] as const;

export type ArmorArchetypeName = (typeof ARMOR_ARCHETYPE_NAMES)[number];

const ARCHETYPE_NAMES = new Set<string>(ARMOR_ARCHETYPE_NAMES);

export type ArmorArchetype = {
  name: ArmorArchetypeName;
  iconPath: string;
};

export function resolveArchetypeFromPlugs(
  equippedPlugHashes: readonly string[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): ArmorArchetype | null {
  for (const hash of equippedPlugHashes) {
    const plug = plugIndex[hash];
    if (!plug?.name || !ARCHETYPE_NAMES.has(plug.name) || !plug.iconPath) {
      continue;
    }
    return {
      name: plug.name as ArmorArchetypeName,
      iconPath: plug.iconPath,
    };
  }
  return null;
}
