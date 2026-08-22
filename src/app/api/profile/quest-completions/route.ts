import { NextRequest, NextResponse } from "next/server";
import {
  fetchCompletedQuestHashes,
  parseQuestCompletionTargets,
} from "@/lib/destiny-quest-progress";
import { getSession } from "@/lib/session";

/** Quest-line completion keyed by canonical quest item hash. */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { completed: {}, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const targetsParam = request.nextUrl.searchParams.get("targets") ?? "";
  const targets = parseQuestCompletionTargets(targetsParam);

  try {
    const completed = await fetchCompletedQuestHashes(session, targets);
    return NextResponse.json(
      { completed, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        completed: {},
        error:
          error instanceof Error
            ? error.message
            : "Failed to load quest completions",
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
