import type {
  AllLootItem,
  ResolvedWeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";

export function resolveWeaponPerkColumns(
  weapon: AllLootItem,
  plugIndex: Record<string, WeaponPlugDefinition>,
): ResolvedWeaponPerkColumn[] {
  if (!weapon.perkColumns?.length) return [];

  return weapon.perkColumns
    .map((column) => ({
      type: column.type,
      perks: column.plugHashes.flatMap((plugHash) => {
        const plug = plugIndex[plugHash];
        if (!plug) return [];
        return [{ ...plug, plugHash }];
      }),
    }))
    .filter((column) => column.perks.length > 0);
}

export function formatPerkDescription(description: string) {
  return description
    .replace(/\[#+[^\]]+\]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/•/g, "·")
    .trim();
}
