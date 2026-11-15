import { NextResponse } from "next/server";
import { fetchRenegadesProgress } from "@/lib/renegades-progress";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in player's Renegades Syndicate ranks and unlocked Praxic Blade plugs. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ clans: {}, praxicUnlocked: [], error: "Not signed in" }, { headers: NO_STORE });
  try {
    return NextResponse.json({ ...(await fetchRenegadesProgress(session)), error: null }, { headers: NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { clans: {}, praxicUnlocked: [], error: error instanceof Error ? error.message : "Failed to load" },
      { status: 502, headers: NO_STORE },
    );
  }
}
