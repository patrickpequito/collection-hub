import { NextResponse } from "next/server";
import { fetchCurrentBungieUser } from "@/lib/bungie";
import { getBungieApiKey } from "@/lib/env";
import { setSession } from "@/lib/session";
import { getFreshSession } from "@/lib/session-access";

/** Session probe for client auth UI — renews the Bungie token when it expired. */
export async function GET() {
  const session = await getFreshSession();
  // Sessions from before avatars were stored: look it up once and keep it.
  if (session && !session.avatarPath) {
    try {
      const user = await fetchCurrentBungieUser(getBungieApiKey(), session.accessToken);
      if (user.avatarPath) {
        session.avatarPath = user.avatarPath;
        await setSession(session);
      }
    } catch {
      // Avatar is cosmetic — keep the session as it is.
    }
  }
  if (!session) {
    return NextResponse.json(
      { signedIn: false, membershipId: null, displayName: null, avatarPath: null },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      signedIn: true,
      membershipId: session.membershipId,
      displayName: session.displayName || "Guardian",
      avatarPath: session.avatarPath ?? null,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
