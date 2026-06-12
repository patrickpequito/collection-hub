import { NextResponse } from "next/server";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ itemHashes: [], error: "Not signed in" });
  }

  try {
    const owned = await fetchOwnedItemHashes(session);
    return NextResponse.json({ itemHashes: [...owned], error: null });
  } catch (error) {
    return NextResponse.json({
      itemHashes: [],
      error:
        error instanceof Error ? error.message : "Failed to load inventory",
    });
  }
}
