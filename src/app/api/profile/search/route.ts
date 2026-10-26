import { NextResponse, type NextRequest } from "next/server";
import { searchGuardians } from "@/lib/profile/fireteam";

/** Bungie name search for the "Find a guardian" box: ?q=Name or Name#1234. */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 40);
  if (query.trim().length < 2) return NextResponse.json({ results: [] });
  try {
    return NextResponse.json({ results: await searchGuardians(query) });
  } catch {
    return NextResponse.json({ results: [], error: "Search failed" });
  }
}
