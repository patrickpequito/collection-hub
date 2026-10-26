import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/data/destinations";
import { fetchReputationLevels } from "@/lib/destiny-reputation";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in player's destination vendor ranks, keyed by destination slug. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ ranks: {}, error: "Not signed in" }, { headers: NO_STORE });

  const withReputation = DESTINATIONS.filter((destination) => destination.reputation);
  try {
    const levels = await fetchReputationLevels(
      session,
      withReputation.map((destination) => destination.reputation!.progressionHash),
    );
    const ranks = Object.fromEntries(
      withReputation
        .filter((destination) => levels[destination.reputation!.progressionHash])
        .map((destination) => [
          destination.slug,
          { ...levels[destination.reputation!.progressionHash], levelCap: destination.reputation!.maxRank },
        ]),
    );
    return NextResponse.json({ ranks, error: null }, { headers: NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { ranks: {}, error: error instanceof Error ? error.message : "Failed to load reputation" },
      { status: 502, headers: NO_STORE },
    );
  }
}
