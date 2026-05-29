import { NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/env";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/?logout=success", getAppOrigin()));
}
