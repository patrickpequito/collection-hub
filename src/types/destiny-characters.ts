import type { GuardianClass } from "@/types/armor-set";
import type { WeaponRollLocation } from "@/types/weapon-rolls";

export type TransferDestinationId = "vault" | GuardianClass;

export type ProfileCharacter = {
  characterId: string;
  guardianClass: GuardianClass;
};

export type RollItemLocation = {
  itemInstanceId: string;
  itemHash: string;
  location: WeaponRollLocation;
  characterId?: string;
};
