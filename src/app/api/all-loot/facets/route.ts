import { NextResponse } from "next/server";
import { loadAllLootFacets } from "@/lib/all-loot/search";

export async function GET() {
  try {
    const facets = await loadAllLootFacets();
    return NextResponse.json({ facets });
  } catch (error) {
    return NextResponse.json(
      {
        facets: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load Loot Collector filters",
      },
      { status: 500 },
    );
  }
}
