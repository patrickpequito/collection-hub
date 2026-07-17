import { NextResponse } from "next/server";
import {
  fetchRecordInstances,
  serializeTriumphProfileData,
} from "@/lib/destiny-records";
import { getSession } from "@/lib/session";
import { EMPTY_TRIUMPH_STRING_VARIABLES } from "@/types/triumph";

/** Signed-in triumph progress for client hydration (no SSR session). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        recordInstances: {},
        stringVariables: EMPTY_TRIUMPH_STRING_VARIABLES,
        error: null,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const profile = serializeTriumphProfileData(
      await fetchRecordInstances(session),
    );
    return NextResponse.json(
      { ...profile, error: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        recordInstances: {},
        stringVariables: EMPTY_TRIUMPH_STRING_VARIABLES,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load triumph progress",
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
