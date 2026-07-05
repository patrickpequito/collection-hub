import type {
  ProfileCharacter,
  RollItemLocation,
  TransferDestinationId,
} from "@/types/destiny-characters";
import { resolveRollTransferDestination } from "@/lib/roll-transfer-utils";

export type RollLocationUpdate = {
  itemInstanceId: string;
  destination: TransferDestinationId;
};

export function applyRollLocationUpdate<T extends RollItemLocation>(
  roll: T,
  update: RollLocationUpdate,
  characters: ProfileCharacter[],
): T {
  if (roll.itemInstanceId !== update.itemInstanceId) return roll;

  if (update.destination === "vault") {
    return { ...roll, location: "vault", characterId: undefined };
  }

  const character = characters.find(
    (entry) => entry.guardianClass === update.destination,
  );

  return {
    ...roll,
    location: "inventory",
    characterId: character?.characterId,
  };
}

export function rollMatchesDestination(
  roll: RollItemLocation,
  destination: TransferDestinationId,
  characters: ProfileCharacter[],
): boolean {
  return resolveRollTransferDestination(roll, characters) === destination;
}

export function applyRollLocationUpdates<T extends RollItemLocation>(
  rolls: T[],
  update: RollLocationUpdate,
  characters: ProfileCharacter[],
): T[] {
  return rolls.map((roll) => applyRollLocationUpdate(roll, update, characters));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
