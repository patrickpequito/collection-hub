import { NextResponse, type NextRequest } from "next/server";
import { loadGuardianProfile, loadGuardianProfileFor } from "@/lib/profile/guardian-profile";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in Guardian profile: characters, stats, favorites, clears and collection progress. */
export async function GET(request: NextRequest) {
  // Local development only: ?preview=3:4611… shows any public profile.
  const preview = request.nextUrl.searchParams.get("preview");
  if (preview && process.env.NODE_ENV === "development") {
    const [membershipType, membershipId] = preview.split(":");
    try {
      const profile = await loadGuardianProfileFor(
        { membershipType: Number(membershipType), membershipId },
        { accessToken: null },
      );
      return NextResponse.json({ profile, error: null }, { headers: NO_STORE });
    } catch (error) {
      return NextResponse.json(
        { profile: null, error: error instanceof Error ? error.message : "Preview failed" },
        { headers: NO_STORE },
      );
    }
  }

  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ profile: null, error: null }, { headers: NO_STORE });
  }

  try {
    const profile = await loadGuardianProfile(session);
    return NextResponse.json({ profile, error: null }, { headers: NO_STORE });
  } catch (error) {
    console.warn("Guardian profile failed:", error instanceof Error ? error.message.slice(0, 300) : error);
    return NextResponse.json(
      { profile: null, error: "Bungie didn't return your profile. Try again in a moment." },
      { headers: NO_STORE },
    );
  }
}
