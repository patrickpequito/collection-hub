import { NextResponse, type NextRequest } from "next/server";
import { resolveDestinyMembership, type DestinyMembership } from "@/lib/destiny-membership";
import { loadClanMembers, loadFriends, loadRecentFireteams, type FireteamList } from "@/lib/profile/fireteam";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Fireteam tab of the signed-in profile: ?tab=clan | friends | recent. */
export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab") ?? "clan";
  // Local development only: ?preview=3:4611… reads a public profile's clan / recent fireteams.
  const preview = process.env.NODE_ENV === "development" ? request.nextUrl.searchParams.get("preview") : null;

  let membership: DestinyMembership | null = null;
  let accessToken: string | null = null;
  if (preview) {
    const [membershipType, membershipId] = preview.split(":");
    membership = { membershipType: Number(membershipType), membershipId };
  } else {
    const session = await getFreshSession();
    if (!session) return NextResponse.json({ guardians: [], heading: null, error: "Not signed in" }, { headers: NO_STORE });
    membership = await resolveDestinyMembership(session);
    accessToken = session.accessToken;
  }
  if (!membership) {
    return NextResponse.json({ guardians: [], heading: null, error: "No Destiny 2 profile found." }, { headers: NO_STORE });
  }

  try {
    let list: FireteamList;
    if (tab === "friends") {
      list = accessToken
        ? await loadFriends(accessToken)
        : { guardians: [], heading: null, error: "Friends need you to be signed in." };
    } else if (tab === "recent") {
      list = await loadRecentFireteams(membership, accessToken);
    } else {
      list = await loadClanMembers(membership, accessToken);
    }
    return NextResponse.json(list, { headers: NO_STORE });
  } catch (error) {
    console.warn("Fireteam failed:", error instanceof Error ? error.message.slice(0, 300) : error);
    return NextResponse.json(
      { guardians: [], heading: null, error: "Bungie didn't return this list. Try again in a moment." },
      { headers: NO_STORE },
    );
  }
}
