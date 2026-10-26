import { NextResponse } from "next/server";
import { fetchOwnedAndInventoryHashes } from "@/lib/destiny-inventory";
import { getFreshSession } from "@/lib/session-access";

export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ itemHashes: [], inventoryItemHashes: [], error: "Not signed in" });
  }

  try {
    const { owned, inventory } = await fetchOwnedAndInventoryHashes(session);
    return NextResponse.json({ itemHashes: [...owned], inventoryItemHashes: [...inventory], error: null });
  } catch (error) {
    return NextResponse.json({
      itemHashes: [],
      inventoryItemHashes: [],
      error:
        error instanceof Error ? error.message : "Failed to load inventory",
    });
  }
}
