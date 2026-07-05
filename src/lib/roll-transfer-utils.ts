import { CLASS_LABELS } from "@/lib/armor-sets/constants";
import { guardianClassLabel } from "@/lib/destiny-characters";
import type {
  ProfileCharacter,
  RollItemLocation,
  TransferDestinationId,
} from "@/types/destiny-characters";
import type { GuardianClass } from "@/types/armor-set";
import { GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";

export const TRANSFER_DESTINATIONS: TransferDestinationId[] = [
  "vault",
  ...GUARDIAN_CLASSES,
];

export function resolveRollTransferDestination(
  roll: Pick<RollItemLocation, "location" | "characterId">,
  characters: ProfileCharacter[],
): TransferDestinationId | null {
  if (roll.location === "vault") return "vault";

  const character = characters.find(
    (entry) => entry.characterId === roll.characterId,
  );
  return character?.guardianClass ?? null;
}

export function resolveRollLocationLabel(
  roll: Pick<RollItemLocation, "location" | "characterId">,
  characters: ProfileCharacter[],
): string {
  if (roll.location === "vault") return "Vault";

  const character = characters.find(
    (entry) => entry.characterId === roll.characterId,
  );
  const classLabel = character
    ? guardianClassLabel(character.guardianClass)
    : "Character";

  if (roll.location === "equipped") {
    return `${classLabel} (Equipped)`;
  }

  return `${classLabel} Inventory`;
}

export function isTransferDestinationDisabled(
  destination: TransferDestinationId,
  currentDestination: TransferDestinationId | null,
  characters: ProfileCharacter[],
): boolean {
  if (destination === currentDestination) return true;

  if (destination !== "vault") {
    return !characters.some(
      (character) => character.guardianClass === destination,
    );
  }

  return false;
}

export function transferDestinationLabel(
  destination: TransferDestinationId,
): string {
  if (destination === "vault") return "Vault";
  return CLASS_LABELS[destination as GuardianClass];
}
