import { NextResponse } from "next/server";
import { transferItemToDestination } from "@/lib/destiny-transfer";
import { getSession } from "@/lib/session";
import type { TransferDestinationId } from "@/types/destiny-characters";
import { GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";

const VALID_DESTINATIONS = new Set<TransferDestinationId>([
  "vault",
  ...GUARDIAN_CLASSES,
]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: {
    itemInstanceId?: string;
    itemHash?: string;
    destination?: TransferDestinationId;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { itemInstanceId, itemHash, destination } = body;

  if (!itemInstanceId || !itemHash || !destination) {
    return NextResponse.json(
      { error: "Missing itemInstanceId, itemHash, or destination" },
      { status: 400 },
    );
  }

  if (!VALID_DESTINATIONS.has(destination)) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  try {
    await transferItemToDestination(
      session,
      itemInstanceId,
      itemHash,
      destination,
    );
    return NextResponse.json({ error: null });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to transfer item",
      },
      { status: 400 },
    );
  }
}
