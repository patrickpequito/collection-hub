import { CLASS_LABELS } from "@/lib/armor-sets/constants";
import type { ProfileCharacter } from "@/types/destiny-characters";
import type { GuardianClass } from "@/types/armor-set";

export const VAULT_ICON_PATH = "/icons/d2/vault.svg";

type ProfileWithCharacters = {
  characters?: {
    data?: Record<string, { classType?: number } | unknown>;
  };
};

export function bungieClassTypeToGuardianClass(
  classType: number,
): GuardianClass | null {
  if (classType === 0) return "titan";
  if (classType === 1) return "hunter";
  if (classType === 2) return "warlock";
  return null;
}

export function parseProfileCharacters(
  profile: ProfileWithCharacters,
): ProfileCharacter[] {
  const characters: ProfileCharacter[] = [];

  for (const [characterId, character] of Object.entries(
    profile.characters?.data ?? {},
  )) {
    const classType =
      typeof character === "object" &&
      character !== null &&
      "classType" in character &&
      typeof character.classType === "number"
        ? character.classType
        : -1;
    const guardianClass = bungieClassTypeToGuardianClass(classType);
    if (!guardianClass) continue;
    characters.push({ characterId, guardianClass });
  }

  return characters;
}

export function guardianClassLabel(guardianClass: GuardianClass): string {
  return CLASS_LABELS[guardianClass];
}
