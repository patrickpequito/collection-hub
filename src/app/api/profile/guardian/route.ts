import { NextResponse, type NextRequest } from "next/server";
import { loadGuardianProfileFor } from "@/lib/profile/guardian-profile";

/** Public profile of any guardian: ?type=3&id=4611… (only what their Bungie privacy allows). */
export async function GET(request: NextRequest) {
  const membershipType = Number(request.nextUrl.searchParams.get("type"));
  const membershipId = request.nextUrl.searchParams.get("id") ?? "";
  if (!Number.isInteger(membershipType) || !/^\d{5,25}$/.test(membershipId)) {
    return NextResponse.json({ profile: null, error: "Unknown guardian." }, { status: 400 });
  }
  try {
    const profile = await loadGuardianProfileFor({ membershipType, membershipId }, { accessToken: null });
    // Public data: a short shared cache keeps repeat visits cheap.
    return NextResponse.json(
      { profile, error: null },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } },
    );
  } catch (error) {
    console.warn("Guardian profile failed:", error instanceof Error ? error.message.slice(0, 300) : error);
    return NextResponse.json({ profile: null, error: "Bungie didn't return this profile. It may be private." });
  }
}
