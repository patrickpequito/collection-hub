import type { GuardianClass } from "@/types/armor-set";

export type UniformCrucibleClassEntry = {
  setName: string;
  classItem: string;
};

/** Cross-class Crucible sets that share the Binary Phoenix class items. */
export const BINARY_PHOENIX_CRUCIBLE_GROUP: Record<
  GuardianClass,
  UniformCrucibleClassEntry
> = {
  warlock: { setName: "Ankaa Seeker IV", classItem: "Binary Phoenix Bond" },
  titan: { setName: "Phoenix Strife Type 0", classItem: "Binary Phoenix Mark" },
  hunter: { setName: "Swordflight 4.1", classItem: "Binary Phoenix Cloak" },
};

/** Crucible sets whose four armor slots share one display name. */
export const UNIFORM_CRUCIBLE_SET_CLASS_ITEMS: Record<
  string,
  Partial<Record<GuardianClass, string>>
> = Object.fromEntries(
  Object.entries(BINARY_PHOENIX_CRUCIBLE_GROUP).map(([guardianClass, entry]) => [
    entry.setName,
    { [guardianClass]: entry.classItem },
  ]),
);

const UNIFORM_CRUCIBLE_SET_NAMES = new Set(
  Object.values(BINARY_PHOENIX_CRUCIBLE_GROUP).map((entry) => entry.setName),
);

export function isUniformCrucibleSetName(setName: string): boolean {
  return UNIFORM_CRUCIBLE_SET_NAMES.has(setName);
}

export function binaryPhoenixClassItemForUniformSet(
  setName: string,
  guardianClass: GuardianClass | null,
): string | null {
  if (!guardianClass) return null;
  return UNIFORM_CRUCIBLE_SET_CLASS_ITEMS[setName]?.[guardianClass] ?? null;
}

export function uniformCrucibleSetForClassItem(itemName: string): {
  setName: string;
  guardianClass: GuardianClass;
} | null {
  for (const [guardianClass, entry] of Object.entries(
    BINARY_PHOENIX_CRUCIBLE_GROUP,
  ) as [GuardianClass, UniformCrucibleClassEntry][]) {
    if (entry.classItem === itemName) {
      return { setName: entry.setName, guardianClass };
    }
  }
  return null;
}

/** @deprecated Use uniformCrucibleSetForClassItem */
export function uniformCrucibleSetForBinaryPhoenix(
  itemName: string,
): string | null {
  return uniformCrucibleSetForClassItem(itemName)?.setName ?? null;
}
