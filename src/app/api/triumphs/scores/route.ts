import { NextResponse } from "next/server";
import { fetchTriumphScores } from "@/lib/destiny-records";
import { getFreshSession } from "@/lib/session-access";

export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ scores: null, error: "Not signed in" });
  }

  try {
    const scores = await fetchTriumphScores(session);
    return NextResponse.json({ scores, error: null });
  } catch (error) {
    return NextResponse.json({
      scores: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load triumph scores",
    });
  }
}
