import { NextResponse } from "next/server";
import { fetchAllActivityCompletions } from "@/lib/destiny-activity-stats";
import { getFreshSession } from "@/lib/session-access";

/** Normal/master completions for all tracked raid and dungeon activity pages. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json(
      { completions: {}, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const completions = await fetchAllActivityCompletions(session);
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
            : "Failed to load raid completions",
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
