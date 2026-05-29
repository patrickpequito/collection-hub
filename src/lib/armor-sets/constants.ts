import type { ArmorCategory, ArmorSet } from "@/types/armor-set";

export const ARMOR_CATEGORIES: {
  id: ArmorCategory;
  label: string;
}[] = [
  { id: "destinations", label: "Destinations" },
  { id: "raids", label: "Raids" },
  { id: "dungeons", label: "Dungeons" },
  { id: "expansions", label: "Expansions" },
  { id: "seasons", label: "Seasons" },
];

export const ARMOR_SLOTS = [
  "helmet",
  "gauntlets",
  "chest",
  "legs",
  "classItem",
] as const;

export const SLOT_LABELS: Record<(typeof ARMOR_SLOTS)[number], string> = {
  helmet: "Helmet",
  gauntlets: "Gauntlets",
  chest: "Chest Armor",
  legs: "Leg Armor",
  classItem: "Class Item",
};

export const GUARDIAN_CLASSES = ["hunter", "titan", "warlock"] as const;

export const CLASS_LABELS: Record<(typeof GUARDIAN_CLASSES)[number], string> = {
  hunter: "Hunter",
  titan: "Titan",
  warlock: "Warlock",
};

export function filterSetsByCategory(
  sets: ArmorSet[],
  category: ArmorCategory,
): ArmorSet[] {
  return sets
    .filter((set) => set.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function countSetsByCategory(
  sets: ArmorSet[],
): Record<ArmorCategory, number> {
  return sets.reduce(
    (acc, set) => {
      acc[set.category] = (acc[set.category] ?? 0) + 1;
      return acc;
    },
    {
      destinations: 0,
      raids: 0,
      dungeons: 0,
      expansions: 0,
      seasons: 0,
    } as Record<ArmorCategory, number>,
  );
}
