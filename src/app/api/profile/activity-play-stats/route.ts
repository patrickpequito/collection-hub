import { NextRequest, NextResponse } from "next/server";
import { fetchActivityHashPlayStats } from "@/lib/destiny-activity-stats";
import { getFreshSession } from "@/lib/session-access";

/** Bungie's activity stats can be slow; give the function time instead of the default limit. */
export const maxDuration = 60;

/** Time played and kills for arbitrary activity hashes (Kepler World Tiers). */
export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ stats: {}, error: null }, { headers });

  const hashes = (request.nextUrl.searchParams.get("hashes") ?? "")
    .split(",")
    .map((hash) => hash.trim())
    .filter(Boolean)
    .slice(0, 32);

  try {
    return NextResponse.json({ stats: await fetchActivityHashPlayStats(session, hashes), error: null }, { headers });
  } catch (error) {
    return NextResponse.json(
      { stats: {}, error: error instanceof Error ? error.message : "Failed to load activity stats" },
      { status: 500, headers },
    );
  }
}
