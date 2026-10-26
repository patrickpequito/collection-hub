import { NextResponse } from "next/server";
import { fetchCatalystPlugStates } from "@/lib/exotics/catalyst-plugs";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Live catalyst state (found / progress / ready) for the signed-in account. */
export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ plugs: null, error: null }, { headers: NO_STORE });
  }
  try {
    const plugs = await fetchCatalystPlugStates(session);
    return NextResponse.json({ plugs, error: null }, { headers: NO_STORE });
  } catch (error) {
    console.warn(
      "Catalyst plug states failed:",
      error instanceof Error ? error.message.slice(0, 300) : error,
    );
    return NextResponse.json(
      { plugs: null, error: "Couldn't load your catalysts right now." },
      { headers: NO_STORE },
    );
  }
}
