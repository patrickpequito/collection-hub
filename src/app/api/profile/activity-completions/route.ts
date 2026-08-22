import { NextRequest, NextResponse } from "next/server";
import { fetchActivityHashCompletions } from "@/lib/destiny-activity-stats";
import { getSession } from "@/lib/session";

/** Completions for arbitrary activity hashes (Empire Hunts, etc.). */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { completions: {}, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const hashes = (request.nextUrl.searchParams.get("hashes") ?? "")
    .split(",")
    .map((hash) => hash.trim())
    .filter(Boolean)
    .slice(0, 128);

  try {
    const completions = await fetchActivityHashCompletions(session, hashes);
    return NextResponse.json(
      { completions, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        completions: {},
        error:
          error instanceof Error
            ? error.message
            : "Failed to load activity completions",
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
