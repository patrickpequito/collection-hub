export type AllLootTypeFilterGroup = {
  label?: string;
  types: string[];
};

/** Player-facing type filter layout (mirrors scripts/all-loot-mappings.mjs). */
export const ALL_LOOT_TYPE_GROUPS: AllLootTypeFilterGroup[] = [
  { types: ["Armor", "Weapon"] },
  {
    label: "Cosmetics",
    types: ["Ship", "Sparrow", "Ghost Shell", "Emblem", "Shader", "Emote"],
  },
  {
    label: "Other",
    types: [
      "Ornament",
      "Ghost Projection",
      "Transmat Effect",
      "Mod",
      "Artifact",
    ],
  },
];

export function buildTypeFilterGroups(
  availableTypes: string[],
): AllLootTypeFilterGroup[] {
  const available = new Set(availableTypes);
  const used = new Set<string>();
  const groups: AllLootTypeFilterGroup[] = [];

  for (const group of ALL_LOOT_TYPE_GROUPS) {
    const types = group.types.filter((type) => available.has(type));
    types.forEach((type) => used.add(type));
    if (types.length === 0) continue;
    groups.push({ label: group.label, types });
  }

  const orphans = availableTypes.filter((type) => !used.has(type));
  if (orphans.length > 0) {
    const otherGroup = groups.find((group) => group.label === "Other");
    if (otherGroup) {
      otherGroup.types = [...otherGroup.types, ...orphans];
    } else {
      groups.push({ label: "Other", types: orphans });
    }
  }

  return groups;
}
