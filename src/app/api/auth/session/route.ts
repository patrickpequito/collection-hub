import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Lightweight session probe for client auth UI (no Bungie API calls). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { signedIn: false, displayName: null },
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
      displayName: session.displayName || "Guardian",
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
