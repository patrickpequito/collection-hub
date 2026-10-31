import { NextResponse } from "next/server";
import { getFreshSession } from "@/lib/session-access";
import { refreshXurGear } from "@/lib/xur";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Signed-in visit: read Xûr's weapons + catalysts (sub-vendor) and store them for everyone until the reset. */
export async function POST() {
  const session = await getFreshSession();
  if (!session) return NextResponse.json({ gear: null, error: "Not signed in" }, { status: 401, headers: NO_STORE });
  const gear = await refreshXurGear(session);
  return NextResponse.json({ gear }, { headers: NO_STORE });
}
