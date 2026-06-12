import { NextResponse } from "next/server";
import { fetchTriumphScores } from "@/lib/destiny-records";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
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
