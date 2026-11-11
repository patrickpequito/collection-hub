import { NextRequest, NextResponse } from "next/server";
import {
  fetchQuestProgress,
  parseQuestCompletionTargets,
} from "@/lib/destiny-quest-progress";
import { getFreshSession } from "@/lib/session-access";

/** Quest-line completion keyed by canonical quest item hash. */
export async function GET(request: NextRequest) {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json(
      { completed: {}, active: {}, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const targetsParam = request.nextUrl.searchParams.get("targets") ?? "";
  const targets = parseQuestCompletionTargets(targetsParam);

  try {
    const { completed, active } = await fetchQuestProgress(session, targets);
    return NextResponse.json(
      { completed, active, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        completed: {},
        active: {},
        error:
          error instanceof Error
            ? error.message
            : "Failed to load quest completions",
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
