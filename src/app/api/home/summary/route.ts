import { NextResponse } from "next/server";
import { loadGuardianSummary } from "@/lib/home/guardian-summary";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in home data: emblem, score, collection progress, titles, featured. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ summary: null, error: null }, { headers: NO_STORE });
  }

  try {
    const summary = await loadGuardianSummary(session);
    return NextResponse.json({ summary, error: null }, { headers: NO_STORE });
  } catch (error) {
    // Full detail stays in the server log; the page gets a short message.
    console.warn(
      "Home summary failed:",
      error instanceof Error ? error.message.slice(0, 300) : error,
    );
    return NextResponse.json(
      { summary: null, error: "Bungie didn't return your profile. Try again in a moment." },
      { headers: NO_STORE },
    );
  }
}
