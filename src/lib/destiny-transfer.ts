import type { BungieUserSession } from "@/lib/bungie";
import { parseProfileCharacters } from "@/lib/destiny-characters";
import {
  collectLocatedInventoryItems,
  fetchDestinyProfile,
} from "@/lib/destiny-inventory";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";
import { resolveRollTransferDestination } from "@/lib/roll-transfer-utils";
import type { TransferDestinationId } from "@/types/destiny-characters";
import type { GuardianClass } from "@/types/armor-set";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type TransferItemRequest = {
  itemReferenceHash: number;
  stackSize: number;
  transferToVault: boolean;
  itemId: string;
  characterId: string;
  membershipType: number;
};

function bungieHeaders(accessToken: string) {
  return {
    "X-API-Key": getBungieApiKey(),
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function bungieTransferItem(
  accessToken: string,
  body: TransferItemRequest,
): Promise<void> {
  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/Destiny2/Actions/Items/TransferItem/`,
    {
      method: "POST",
      headers: bungieHeaders(accessToken),
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bungie API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as BungieResponse<number>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Transfer failed");
  }
}

function findCharacterIdForClass(
  profile: Awaited<ReturnType<typeof fetchDestinyProfile>>,
  guardianClass: GuardianClass,
): string | null {
  const characters = parseProfileCharacters(profile);
  return (
    characters.find((character) => character.guardianClass === guardianClass)
      ?.characterId ?? null
  );
}

async function transferOnce(
  session: BungieUserSession,
  membershipType: number,
  input: {
    itemInstanceId: string;
    itemReferenceHash: string;
    transferToVault: boolean;
    characterId: string;
  },
): Promise<void> {
  await bungieTransferItem(session.accessToken, {
    itemReferenceHash: Number(input.itemReferenceHash),
    stackSize: 1,
    transferToVault: input.transferToVault,
    itemId: input.itemInstanceId,
    characterId: input.characterId,
    membershipType,
  });
}

export async function transferItemToDestination(
  session: BungieUserSession,
  itemInstanceId: string,
  itemReferenceHash: string,
  destination: TransferDestinationId,
): Promise<void> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) {
    throw new Error("No Destiny membership found");
  }

  const profile = await fetchDestinyProfile(session, membership);
  const characters = parseProfileCharacters(profile);
  const located = collectLocatedInventoryItems(profile).find(
    (item) => item.itemInstanceId === itemInstanceId,
  );

  if (!located) {
    throw new Error("Item not found in your inventory");
  }

  const currentDestination = resolveRollTransferDestination(located, characters);
  if (currentDestination === destination) {
    throw new Error("Item is already in that location");
  }

  if (destination === "vault") {
    if (!located.characterId) {
      throw new Error("Item is already in the vault");
    }

    await transferOnce(session, membership.membershipType, {
      itemInstanceId,
      itemReferenceHash,
      transferToVault: true,
      characterId: located.characterId,
    });
    return;
  }

  const targetCharacterId = findCharacterIdForClass(profile, destination);
  if (!targetCharacterId) {
    throw new Error(`No ${destination} character found`);
  }

  if (located.location === "vault") {
    await transferOnce(session, membership.membershipType, {
      itemInstanceId,
      itemReferenceHash,
      transferToVault: false,
      characterId: targetCharacterId,
    });
    return;
  }

  if (!located.characterId) {
    throw new Error("Could not resolve the item owner");
  }

  await transferOnce(session, membership.membershipType, {
    itemInstanceId,
    itemReferenceHash,
    transferToVault: true,
    characterId: located.characterId,
  });

  await transferOnce(session, membership.membershipType, {
    itemInstanceId,
    itemReferenceHash,
    transferToVault: false,
    characterId: targetCharacterId,
  });
}
